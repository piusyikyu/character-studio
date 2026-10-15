import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { isDeepStrictEqual } from 'node:util';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { z } from 'zod';
import { DIRECTIONS, DIRECTION_PLANE_ORDER } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import { bodyPartsReviewSchema, northBodyPartsReviewSchema, prepareBodyPartsReview, prepareNorthBodyPartsReview } from './body-parts-review';
import { eastBodyPartsReviewSchema, westBodyPartsReviewSchema, southeastBodyPartsReviewSchema, southwestBodyPartsReviewSchema, northeastBodyPartsReviewSchema, northwestBodyPartsReviewSchema, prepareEastBodyPartsReview, prepareWestBodyPartsReview, prepareSoutheastBodyPartsReview, prepareSouthwestBodyPartsReview, prepareNortheastBodyPartsReview, prepareNorthwestBodyPartsReview } from './body-facing-parts-review';
import { checkerPreview } from './inspection';
import { sha256 } from './reference-import';
import { bodyPartSetViewer } from './body-part-set-viewer';

export const bodyPartSetFacings = {
  N: { directory: 'body/parts-v1/north', decision: 'approved-native-n-body-part-study-with-footwear-limitation', schema: northBodyPartsReviewSchema, prepare: prepareNorthBodyPartsReview },
  NE: { directory: 'body/parts-v1/northeast', decision: 'approved-native-ne-visible-body-part-study', schema: northeastBodyPartsReviewSchema, prepare: prepareNortheastBodyPartsReview },
  E: { directory: 'body/parts-v1/east', decision: 'approved-native-e-visible-body-part-study', schema: eastBodyPartsReviewSchema, prepare: prepareEastBodyPartsReview },
  SE: { directory: 'body/parts-v1/southeast', decision: 'approved-native-se-visible-body-part-study', schema: southeastBodyPartsReviewSchema, prepare: prepareSoutheastBodyPartsReview },
  S: { directory: 'body/parts-v1', decision: 'approved-native-s-body-part-study', schema: bodyPartsReviewSchema, prepare: prepareBodyPartsReview },
  SW: { directory: 'body/parts-v1/southwest', decision: 'approved-native-sw-visible-body-part-study', schema: southwestBodyPartsReviewSchema, prepare: prepareSouthwestBodyPartsReview },
  W: { directory: 'body/parts-v1/west', decision: 'approved-native-w-visible-body-part-study', schema: westBodyPartsReviewSchema, prepare: prepareWestBodyPartsReview },
  NW: { directory: 'body/parts-v1/northwest', decision: 'approved-native-nw-visible-body-part-study', schema: northwestBodyPartsReviewSchema, prepare: prepareNorthwestBodyPartsReview },
} as const;
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const source = z.string().regex(/^(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+$/).refine(p => p.split('/').every(s => s !== '.' && s !== '..'));
const pin = z.strictObject({ source, sourceSha256: hash });
const pack = z.strictObject({ directory: source, configuration: pin, approval: pin });
export const bodyPartSetSelectionSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('body.parts.assembly.review.v1'), target: z.literal('detailed'),
  scope: z.literal('all-eight-visible-body-part-studies'), published: z.literal(false),
  frames: z.strictObject({ N: pack, NE: pack, E: pack, SE: pack, S: pack, SW: pack, W: pack, NW: pack }),
});
const approvalSchema = z.object({
  direction: z.enum(DIRECTIONS), target: z.literal('detailed'), configuration: z.literal('authoring.json'),
  configurationSha256: hash, decision: z.string(), currentStudyPartsApproved: z.literal(true),
  bodySha256: hash, bareSha256: hash, fitSha256: hash, parts: z.array(z.unknown()).length(5),
  published: z.literal(false), productionAnatomyApproved: z.literal(false), concealedJointsApproved: z.literal(false),
  separateUnderwearAuthored: z.literal(false), tposeApproved: z.literal(false), finalStep6CAccepted: z.literal(false),
});
const inside = (base: string, path: string) => { const p = relative(base, path); return p === '' || (!isAbsolute(p) && p !== '..' && !p.startsWith('../')); };
const missing = (e: unknown) => (e as NodeJS.ErrnoException).code === 'ENOENT';
export interface BodyPartSetReviewOptions {
  readonly selectionDirectory: string;
  readonly assetDirectory: string;
  readonly referenceDirectory: string;
  readonly stagingDirectory: string;
  readonly outputDirectory: string;
}

/** Rebuild actual approved part compositions; retain one body-only sheet and reuse existing images in the viewer. */
export async function prepareBodyPartSetReview(options: BodyPartSetReviewOptions) {
  const [root, assets, refs, staging] = await Promise.all([options.selectionDirectory, options.assetDirectory, options.referenceDirectory, options.stagingDirectory].map(p => realpath(p)));
  const out = resolve(options.outputDirectory), inputs = new Map<string, string>();
  if ([root!, assets!, refs!, ...DIRECTIONS.map(d => resolve(staging!, bodyPartSetFacings[d].directory))].some(p => inside(p, out) || inside(out, p))) throw new Error('Body-part-set outputs and inputs must be disjoint.');
  for (const name of ['body-only-overview.png', 'inspection/body-parts-review.html', 'metadata.json']) for (let p = resolve(out, name); ; p = dirname(p)) {
    try { if ((await lstat(p)).isSymbolicLink() || await realpath(p) !== p) throw new Error('Body-part-set output symlinks forbidden.'); }
    catch (e) { if (!missing(e)) throw e; }
    if (dirname(p) === p) break;
  }
  const read = async (base: string, p: { source: string; sourceSha256?: string }) => {
    const path = resolve(base, p.source);
    if (!inside(base, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error('Ordinary pinned body-part-set inputs required.');
    const bytes = await readFile(path), digest = sha256(bytes);
    if (p.sourceSha256 && digest !== p.sourceSha256) throw new Error('Body-part-set pinned input changed: ' + p.source);
    inputs.set(path, digest); return bytes;
  };
  const selectionBytes = await read(root!, { source: 'review-selection.json' }), selection = bodyPartSetSelectionSchema.parse(JSON.parse(selectionBytes.toString('utf8')));
  // Validate the complete eight-facing checkpoint before running any component export.
  const selected = [];
  for (const direction of DIRECTIONS) {
    const frame = selection.frames[direction], definition = bodyPartSetFacings[direction];
    if (frame.directory !== definition.directory || frame.configuration.source !== 'authoring.json' || frame.approval.source !== 'review-fit-v1.json') throw new Error(direction + ': independently approved same-facing part pack required.');
    const base = resolve(assets!, frame.directory), configBytes = await read(base, frame.configuration);
    const config = definition.schema.parse(JSON.parse(configBytes.toString('utf8'))), approval = approvalSchema.parse(JSON.parse((await read(base, frame.approval)).toString('utf8')));
    if (config.direction !== direction || approval.direction !== direction || approval.configurationSha256 !== sha256(configBytes) || approval.decision !== definition.decision || !isDeepStrictEqual(approval.parts, config.parts)) throw new Error(direction + ': part approval must match its selected cuts, configuration and facing.');
    const parts = [];
    for (const part of config.parts) {
      const artwork = 'artwork' in part ? part.artwork : 'source' in part ? { source: part.source, sourceSha256: part.sourceSha256 } : undefined;
      if (artwork) await read(base, artwork);
      parts.push({ id: part.id, plane: part.plane, characterSide: part.characterSide, visibility: 'visibility' in part ? part.visibility : 'visible' as const, ...(artwork ? { artwork: { source: frame.directory + '/' + artwork.source, sourceSha256: artwork.sourceSha256 } } : {}) });
    }
    const views = { anatomy: `${frame.directory}/fit/${direction}-anatomy.png`, hair: `${frame.directory}/fit/${direction}.png` };
    await read(staging!, { source: views.anatomy, sourceSha256: approval.bareSha256 });
    await read(staging!, { source: views.hair, sourceSha256: approval.fitSha256 });
    selected.push({ direction, frame, definition, config, approval, parts, views });
  }
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-body-part-set-'));
  try {
    const sheet = blankImage(4096, 3072), frames = [], viewerFrames = [];
    const url = (path: string) => relative(resolve(out, 'inspection'), path).split(sep).map(encodeURIComponent).join('/');
    for (const [index, s] of selected.entries()) {
      const component = { sourceDirectory: resolve(assets!, s.frame.directory), assetDirectory: assets!, referenceDirectory: refs!, outputDirectory: resolve(temporary, s.direction) };
      const report = await s.definition.prepare(component);
      if (report.configSha256 !== s.frame.configuration.sourceSha256 || JSON.stringify(report.supportedReviewDirections) !== JSON.stringify([s.direction]) || report.bodySha256 !== s.approval.bodySha256 || report.bareSha256 !== s.approval.bareSha256 || report.fitSha256 !== s.approval.fitSha256 || !report.exactApprovedFit) throw new Error(s.direction + ': actual body planes must reproduce their approved native body, anatomy and hair fit.');
      const bodyBytes = await readFile(resolve(component.outputDirectory, `fit/${s.direction}-body-only.png`)), body = decodePng(bodyBytes);
      if (sha256(bodyBytes) !== s.approval.bodySha256 || body.width !== 1024 || body.height !== 1536) throw new Error('Native approved 1024x1536 body partition required.');
      drawRgba(sheet, checkerPreview(body, s.direction), index % 4 * 1024, Math.floor(index / 4) * 1536);
      const unavailable = s.parts.filter(p => p.visibility === 'occluded-unavailable').map(p => p.id);
      frames.push({ direction: s.direction, directory: s.frame.directory, configuration: s.frame.configuration, approval: s.frame.approval, compositionOrder: DIRECTION_PLANE_ORDER[s.direction], parts: s.parts, measurements: report.measurements, bodySha256: report.bodySha256, bareSha256: report.bareSha256, fitSha256: report.fitSha256, exactApprovedFit: true, unavailableGeometry: unavailable, hiddenFrontalLayers: ['N','NE','NW'].includes(s.direction) ? ['eyes','eyebrows','mouth','hair-front'] : [] });
      viewerFrames.push({ direction: s.direction, order: DIRECTION_PLANE_ORDER[s.direction], parts: s.parts.map(p => ({ id: p.id, plane: p.plane, ...(p.artwork ? { url: url(resolve(assets!, p.artwork.source)) } : {}) })), anatomy: url(resolve(staging!, s.views.anatomy)), hair: url(resolve(staging!, s.views.hair)), unavailable });
    }
    const png = encodePng(sheet), viewer = Buffer.from(bodyPartSetViewer(viewerFrames)), dependencies = [...inputs].map(([path, digest]) => ({ root: inside(assets!, path) ? 'source' : inside(staging!, path) ? 'staging' : 'selection', path: relative(inside(assets!, path) ? assets! : inside(staging!, path) ? staging! : root!, path).split(sep).join('/'), sha256: digest }));
    const report = {
      schemaVersion: 1, id: selection.id, selectionSha256: sha256(selectionBytes), target: 'detailed', sourcePose: 'tpose-study', status: 'needs-cross-facing-human-review', supportedReviewDirections: DIRECTIONS,
      individualPartsMatchApprovals: true, crossFacingPartSetApproved: false, newArtwork: false, frames, dependencies,
      unavailableGeometry: frames.filter(f => f.unavailableGeometry.length).map(f => ({ direction: f.direction, parts: f.unavailableGeometry })),
      published: false, paletteReady: false, productionAnatomyApproved: false, concealedJointsApproved: false, separateUnderwearAuthored: false, footwearCompatibilityApproved: false, tposeApproved: false, finalStep6CAccepted: false, step6DStarted: false,
      grid: { columns: 4, rows: 2, cellWidth: 1024, cellHeight: 1536, sampling: 'native-copy-no-transforms' },
      reviewRequired: ['Compare visible cuts and physical-side ownership across all eight directions.', 'Profiles retain explicit unavailable far limbs. Concealed joints and complete limb anatomy are unfinished.', 'Underwear remains baked into torso; separate garments and material maps are unfinished.', 'Existing heel-based feet do not certify barefoot, flat-shoe or arbitrary footwear compatibility.'],
      outputs: [{ path: 'body-only-overview.png', sha256: sha256(png) }], interactiveInspection: { path: 'inspection/body-parts-review.html', sha256: sha256(viewer) },
    };
    for (const [path, digest] of inputs) if (sha256(await readFile(path)) !== digest) throw new Error('Body-part-set input changed during review.');
    for (const f of [{ path: 'body-only-overview.png', bytes: png }, { path: report.interactiveInspection.path, bytes: viewer }, { path: 'metadata.json', bytes: Buffer.from(JSON.stringify(report, null, 2) + '\n') }]) {
      await mkdir(dirname(resolve(out, f.path)), { recursive: true }); await writeFile(resolve(out, f.path), f.bytes);
    }
    return report;
  } finally { await rm(temporary, { recursive: true, force: true }); }
}
