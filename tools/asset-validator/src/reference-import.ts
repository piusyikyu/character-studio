import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { decode } from 'fast-png';
import { DIRECTIONS } from '@character-studio/core';
import { decorateExport, encodePng } from '@character-studio/render-utils';
import type { Direction } from '@character-studio/core';
import type { RgbaImage } from '@character-studio/render-utils';
import { referenceImportSettingsSchema } from './schema';
import { matteReference } from './matte';
import { alphaStatistics, approximateBaseline, backgroundStatistics, characterBounds, foregroundFragments, reviewRegions } from './audit';
import { anchorPreview, checkerPreview, contactSheet, overview, reviewPreview } from './inspection';

export const sha256 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const nested = (parent: string, child: string) => { const path = relative(parent, child); return path === '' || (!path.startsWith('..') && !isAbsolute(path)); };

function decodeReference(bytes: Uint8Array, direction: Direction): RgbaImage {
  const image = decode(bytes, { checkCrc: true });
  if (image.width !== 1024 || image.height !== 1536) throw new Error(`${direction}: reference must be 1024 × 1536, received ${image.width} × ${image.height}.`);
  if (image.depth !== 8 || image.palette || (image.channels !== 3 && image.channels !== 4)) throw new Error(`${direction}: expected RGB8 or RGBA8 PNG.`);
  const data = new Uint8Array(image.width * image.height * 4);
  for (let p = 0; p < image.width * image.height; p++) {
    data.set(image.data.subarray(p * image.channels, p * image.channels + 3), p * 4);
    data[p * 4 + 3] = image.channels === 4 ? image.data[p * 4 + 3]! : 255;
  }
  return { width: image.width, height: image.height, data };
}

export interface ImportReferenceOptions { readonly sourceDirectory: string; readonly settingsPath: string; readonly outputDirectory: string }

export async function importReferencePack(options: ImportReferenceOptions) {
  const sourceDirectory = await realpath(options.sourceDirectory), settingsPath = await realpath(options.settingsPath);
  const outputDirectory = resolve(options.outputDirectory);
  // Resolve existing ancestors before writing: a symlink must never redirect staging into approved art.
  let ancestor = outputDirectory;
  while (true) {
    try { if ((await realpath(ancestor)) !== ancestor) throw new Error('Output path must not traverse symlinks.'); break; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; const parent = resolve(ancestor, '..'); if (parent === ancestor) throw error; ancestor = parent; }
  }
  if (nested(sourceDirectory, outputDirectory) || nested(outputDirectory, sourceDirectory) || nested(outputDirectory, settingsPath)) throw new Error('Staging and approved source/settings paths must be disjoint.');
  const settingsBytes = await readFile(settingsPath), settings = referenceImportSettingsSchema.parse(JSON.parse(settingsBytes.toString('utf8')));
  // Validate the whole pack before creating outputs. Missing files, CRCs, dimensions or changed art abort.
  const sources = await Promise.all(DIRECTIONS.map(async (direction) => {
    const path = resolve(sourceDirectory, `${direction}.png`);
    if (!(await lstat(path)).isFile()) throw new Error(`${direction}: source must be a regular PNG, not a symlink.`);
    const bytes = await readFile(path), hash = sha256(bytes), image = decodeReference(bytes, direction);
    if (hash !== settings.frames[direction].sourceSha256) throw new Error(`${direction}: approved source hash differs from import-v1 metadata. Review the source and create a new import version.`);
    return { direction, path, hash, image };
  }));
  if (new Set(sources.map((s) => s.hash)).size !== 8) throw new Error('Eight distinct independently supplied references are required.');
  const processed = sources.map((source) => {
    const frame = settings.frames[source.direction], matte = matteReference(source.image, frame.labelExclusions, settings.matte, frame.backgroundCorrections);
    const baseline = approximateBaseline(matte.image, frame.footSearchRegions);
    const report = {
      direction: source.direction, source: `${source.direction}.png`, sourceSha256: source.hash,
      dimensions: { width: source.image.width, height: source.image.height },
      sourceAlpha: alphaStatistics(source.image), stagingAlpha: alphaStatistics(matte.image),
      background: { ...backgroundStatistics(source.image, matte.backgroundSeeds), medianRgb: matte.backgroundColour },
      characterBounds: characterBounds(matte.image), solidCharacterBounds: characterBounds(matte.image, 128),
      approximateFootBaseline: baseline, labelExclusions: frame.labelExclusions, labelForegroundPixelsRemoved: matte.labelsRemoved,
      backgroundCorrections: frame.backgroundCorrections,
      changedRgbPixels: matte.changedRgbPixels, fallbackBackgroundPixels: matte.fallbackBackgroundPixels,
      greenHaloCandidates: reviewRegions(matte.reviewMask, source.image.width, 4),
      uncertainForeground: reviewRegions(matte.reviewMask, source.image.width, 2),
      estimatedEdgePixels: reviewRegions(matte.reviewMask, source.image.width, 1).pixels,
      incompleteMaskCandidates: foregroundFragments(matte.image),
      anchorCandidates: frame.anchors,
      stagingSha256: sha256(encodePng(matte.image)),
    };
    if (!report.characterBounds || !report.stagingAlpha.transparent || !report.stagingAlpha.opaque) throw new Error(`${source.direction}: matte is empty or lacks foreground/background separation.`);
    return { ...source, matte, report };
  });
  const baselineValues = processed.flatMap((p) => p.report.approximateFootBaseline.y === null ? [] : [p.report.approximateFootBaseline.y]);
  const baselineRange = baselineValues.length ? Math.max(...baselineValues) - Math.min(...baselineValues) : null;
  const metadata = {
    schemaVersion: 1, packId: settings.packId, pipelineVersion: settings.pipelineVersion, processingRevision: settings.processingRevision,
    sourceKind: settings.sourceKind, target: settings.target, pose: settings.pose,
    status: 'staging-needs-human-review', modular: false, published: false,
    settingsSha256: sha256(settingsBytes), settings,
    coordinateConvention: 'Native top-left pixel coordinates. Screen-side shoulder/hip/foot observations have no approved anatomical left/right mapping. Occluded candidates are null.',
    baselineAudit: { range: baselineRange, tolerance: settings.matte.baselineTolerance, inconsistent: baselineRange === null || baselineValues.length !== 8 || baselineRange > settings.matte.baselineTolerance },
    frames: processed.map((p) => p.report),
  };
  await mkdir(outputDirectory, { recursive: true });
  const save = async (path: string, image: RgbaImage) => {
    const destination = resolve(outputDirectory, path);
    // Reject pre-existing symlink destinations, including nested output folders.
    let parent = destination;
    while (nested(outputDirectory, parent)) {
      try { if ((await lstat(parent)).isSymbolicLink()) throw new Error(`Staging symlink is forbidden: ${parent}`); }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
      if (parent === outputDirectory) break; parent = resolve(parent, '..');
    }
    await mkdir(resolve(destination, '..'), { recursive: true }); await writeFile(destination, encodePng(image));
  };
  const checkers: RgbaImage[] = [], greens: RgbaImage[] = [];
  for (const p of processed) {
    const checker = checkerPreview(p.matte.image, p.direction), green = decorateExport(p.matte.image, p.direction);
    checkers.push(checker); greens.push(green);
    await save(`transparent/${p.direction}.png`, p.matte.image);
    await save(`inspection/checker/${p.direction}.png`, checker);
    await save(`inspection/green/${p.direction}.png`, green);
    await save(`inspection/review/${p.direction}.png`, reviewPreview(checker, p.matte.reviewMask));
    await save(`inspection/anchors/${p.direction}.png`, anchorPreview(checker, p.report.anchorCandidates, p.report.approximateFootBaseline.y));
  }
  await save('contact-originals.png', contactSheet(sources.map((s) => s.image)));
  await save('overview-originals.png', overview(contactSheet(sources.map((s) => s.image))));
  await save('overview-checker.png', overview(contactSheet(checkers)));
  await save('overview-green.png', overview(contactSheet(greens)));
  // Source preservation is verified again after processing, not just promised.
  for (const source of sources) if (sha256(await readFile(source.path)) !== source.hash) throw new Error(`${source.direction}: original file changed during import.`);
  for (const name of ['metadata.json', 'audit.md']) {
    try { if ((await lstat(resolve(outputDirectory, name))).isSymbolicLink()) throw new Error(`Staging symlink is forbidden: ${name}`); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  }
  await writeFile(resolve(outputDirectory, 'metadata.json'), `${JSON.stringify(metadata, null, 2)}\n`);
  const rows = metadata.frames.map((f) => `| ${f.direction} | ${f.characterBounds!.x},${f.characterBounds!.y} ${f.characterBounds!.width}×${f.characterBounds!.height} | ${f.approximateFootBaseline.y ?? 'unknown'} | ${f.stagingAlpha.partial} | ${f.greenHaloCandidates.pixels} | ${f.uncertainForeground.pixels} | ${f.incompleteMaskCandidates.smallFragments.length} | ${f.labelForegroundPixelsRemoved} |`).join('\n');
  await writeFile(resolve(outputDirectory, 'audit.md'), `# Heroine v1 reference import audit\n\nStatus: **staging; human review required; not modular or published**. Pipeline v1. All eight source SHA-256 hashes verified unchanged after import. Native 1024 × 1536, standing reference pose.\n\n| Facing | Character bounds (x,y width×height) | Approx. foot baseline | Partial alpha pixels | Green halo candidates | Uncertain pixels | Small retained fragments | Label pixels removed |\n| --- | --- | --- | --- | --- | --- | --- | --- |\n${rows}\n\nBaseline spread: **${baselineRange ?? 'unknown'} px**, tolerance ${settings.matte.baselineTolerance} px; ${metadata.baselineAudit.inconsistent ? '**FLAG: inconsistent baselines**' : 'within tolerance'}. Measurements use shoe search regions and may include overlapping fabric. No normalization was performed.\n\n## Review required before Step 6C\n\n- Inspect checker and green native previews at 100% and higher, especially hair curls, ahoge, fingers, dress edges and shoe heels. Exact original antialias coverage cannot be recovered uniquely from flattened RGB. Core non-green foreground RGB remains unchanged; only green-dominant boundary colours are unmixed.\n- Red review pixels flag residual green; orange flags low-coverage, poor-fit or fallback-background estimates; cyan identifies other estimated edge pixels. Counts are diagnostics, not automatic acceptance or removal instructions.\n- Review disconnected retained fragments as possible incomplete masks or fine curls. Enclosed green openings are removed by colour, including hair loops: confirm no intended foreground was keyed.\n- Compare native contact-originals.png and original sources with transparent outputs for any lost curls, garment details or faint edges. The 4× reduced overview files are inspection thumbnails only.\n- Confirm the source-free top-left label margins. N/S have no baked label in this pack; the other six do. Internal transparent outputs have no labels; preview labels are freshly applied.\n- Review all candidate anchor coordinates, shoe search regions and physical left/right mapping. Hidden points remain null. These observations are not rig profiles and must not drive modular placement.\n- Preserve the approved NE/NW dress corrections; confirm back-facing eye absence and garment topology visually. No art reconstruction, directional reflection or rig transformation occurred.\n- These references are standing illustrations, not the architecture's authored detailed T-pose. Decide the eventual pose/rig separately during review. No pixel artwork has been authored or derived.\n\nFull alpha histograms, background variations, source/output hashes, review tiles and candidate anchors are in metadata.json. See docs/REFERENCE_IMPORT.md for reproducibility and review steps.\n`);
  return metadata;
}
