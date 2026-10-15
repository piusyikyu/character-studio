import { cp, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { decodePng, encodePng } from '@character-studio/render-utils';
import { eastBodyPartsReviewSchema, prepareEastBodyPartsReview, westBodyPartsReviewSchema, prepareWestBodyPartsReview } from './body-profile-parts-review';
import { sha256 } from './reference-import';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
it.each([
  { direction: 'E', folder: 'east', schema: eastBodyPartsReviewSchema, prepare: prepareEastBodyPartsReview, farSide: 'left', probes: [[0,600,450],[1,475,385],[2,550,1400]] },
  { direction: 'W', folder: 'west', schema: westBodyPartsReviewSchema, prepare: prepareWestBodyPartsReview, farSide: 'right', probes: [[0,400,450],[1,530,350],[2,475,800]] },
] as const)('recomposes the native $direction visible partitions through real face/hair planes, declares unavailable far limbs, and rejects changed side or native pixels', async ({ direction, folder, schema, prepare, farSide, probes }) => {
  const temporary = await mkdtemp(resolve(tmpdir(), `character-${direction.toLowerCase()}-parts-test-`));
  try {
    const assets = resolve(repository, 'assets/source/heroine-v1'), source = resolve(assets, 'body/parts-v1/' + folder);
    const options = { sourceDirectory: source, assetDirectory: assets, referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(temporary, 'review') };
    const config = schema.parse(JSON.parse(await readFile(resolve(source, 'authoring.json'), 'utf8')));
    const paths = [resolve(source, 'authoring.json'), resolve(assets, config.baselineConfiguration.source), resolve(assets, config.baselineApproval.source), resolve(assets, config.wholeBody.source), ...config.parts.flatMap(p => p.visibility === 'visible' ? [resolve(source, p.artwork.source)] : [])];
    const before = await Promise.all(paths.map(async path => ({ path, sha256: sha256(await readFile(path)), mtimeMs: (await stat(path)).mtimeMs })));
    const report = await prepare(options);
    const approval = JSON.parse(await readFile(resolve(assets, config.baselineApproval.source), 'utf8'));
    expect(report).toMatchObject({ supportedReviewDirections: [direction], exactApprovedFit: true, bareSha256: approval.bareSha256, fitSha256: approval.fitSha256, unavailableGeometry: [farSide + '-arm', farSide + '-leg'], allFivePartsAuthored: false, published: false, productionAnatomyApproved: false, concealedJointsApproved: false, separateUnderwearAuthored: false, footwearCompatibilityApproved: false, finalStep6CAccepted: false, step6DStarted: false, measurements: { overlapPixels: 0, unownedPixels: 0, generatedAnatomy: false } });
    for (const p of report.measurements.parts) expect(p.selectedPixels === 0).toBe(p.visibility === 'occluded-unavailable');
    for (const output of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
    // Independent native probes: hand and leg keep their physical near-side identity, bra remains on the torso.
    const visible = await Promise.all(config.parts.flatMap(p => p.visibility === 'visible' ? [readFile(resolve(source, p.artwork.source)).then(decodePng)] : []));
    for (const [part, x, y] of probes) expect(visible[part]!.data[(y * 1024 + x) * 4 + 3]).toBeGreaterThan(240);
    const body = decodePng(await readFile(resolve(assets, config.wholeBody.source))), actual = decodePng(await readFile(resolve(options.outputDirectory, `fit/${direction}-body-only.png`)));
    for (let p = 0; p < body.data.length; p += 4) {
      const owners = visible.filter(im => im.data[p + 3]! > 0);
      if (owners.length !== (body.data[p + 3]! >= 8 ? 1 : 0)) throw new Error('Native body ownership must be exclusive and complete.');
      if (owners.length) for (let c = 0; c < 4; c++) if (owners[0]!.data[p + c] !== body.data[p + c]) throw new Error('Source RGBA changed in a visible partition.');
      if (body.data[p + 3]! < 8) body.data.fill(0, p, p + 4);
    }
    expect(sha256(encodePng(actual))).toBe(sha256(encodePng(body)));
    expect(await prepare({ ...options, outputDirectory: resolve(temporary, 'repeat') })).toEqual(report);
    const forged = resolve(temporary, 'forged'); await cp(source, forged, { recursive: true });
    const original = JSON.stringify(config); config.parts[1]!.characterSide = farSide;
    await writeFile(resolve(forged, 'authoring.json'), JSON.stringify(config));
    await expect(prepare({ ...options, sourceDirectory: forged, outputDirectory: resolve(temporary, 'bad-side') })).rejects.toThrow('identity, plane or visibility changed');
    const changed = schema.parse(JSON.parse(original)), arm = changed.parts[1]!;
    if (arm.visibility !== 'visible') throw new Error('Near arm required.');
    const image = decodePng(await readFile(resolve(forged, arm.artwork.source))); image.data[(probes[1][2] * 1024 + probes[1][1]) * 4] = 0;
    const bytes = encodePng(image); await writeFile(resolve(forged, arm.artwork.source), bytes); arm.artwork.sourceSha256 = sha256(bytes);
    await writeFile(resolve(forged, 'authoring.json'), JSON.stringify(changed));
    await expect(prepare({ ...options, sourceDirectory: forged, outputDirectory: resolve(temporary, 'foreign-pixel') })).rejects.toThrow('native ownership changed');
    if (direction === 'W') {
      const east = eastBodyPartsReviewSchema.parse(JSON.parse(await readFile(resolve(assets, 'body/parts-v1/east/authoring.json'), 'utf8')));
      changed.baselineConfiguration = east.baselineConfiguration; changed.baselineApproval = east.baselineApproval;
      await writeFile(resolve(forged, 'authoring.json'), JSON.stringify(changed));
      await expect(prepare({ ...options, sourceDirectory: forged, outputDirectory: resolve(temporary, 'foreign-facing') })).rejects.toThrow('same-facing checkpoint');
    }
    await expect(prepare({ ...options, outputDirectory: resolve(assets, 'unsafe') })).rejects.toThrow('must be disjoint');
    for (const file of before) { expect(sha256(await readFile(file.path))).toBe(file.sha256); expect((await stat(file.path)).mtimeMs).toBe(file.mtimeMs); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 180_000);
