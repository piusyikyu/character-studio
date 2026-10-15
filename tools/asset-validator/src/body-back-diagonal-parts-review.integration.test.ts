import { cp, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { RenderPlane } from '@character-studio/core';
import { decodePng, encodePng } from '@character-studio/render-utils';
import { northeastBodyPartsReviewSchema, prepareNortheastBodyPartsReview } from './body-facing-parts-review';
import { prepareBackDiagonalBodyReview } from './body-back-diagonal-review';
import { sha256 } from './reference-import';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
it('recomposes five native NE planes with posterior visibility, the accepted slimmer build and complete hands, rejecting side, alpha and facing substitutions', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-northeast-parts-test-'));
  try {
    const assets = resolve(repository, 'assets/source/heroine-v1'), source = resolve(assets, 'body/parts-v1/northeast');
    const options = { sourceDirectory: source, assetDirectory: assets, referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(temporary, 'review') };
    const config = northeastBodyPartsReviewSchema.parse(JSON.parse(await readFile(resolve(source, 'authoring.json'), 'utf8')));
    const paths = [resolve(source, 'authoring.json'), resolve(assets, config.baselineConfiguration.source), resolve(assets, config.baselineApproval.source), resolve(assets, config.wholeBody.source), ...config.parts.map(p => resolve(source, p.artwork.source))];
    const before = await Promise.all(paths.map(async path => ({ path, sha256: sha256(await readFile(path)), mtimeMs: (await stat(path)).mtimeMs })));
    const report = await prepareNortheastBodyPartsReview(options), approval = JSON.parse(await readFile(resolve(assets, config.baselineApproval.source), 'utf8'));
    expect(report).toMatchObject({ supportedReviewDirections: ['NE'], compositionOrder: DIRECTION_PLANE_ORDER.NE, hiddenFrontalLayers: ['eyes','eyebrows','mouth','hair-front'], exactApprovedFit: true, bareSha256: approval.bareSha256, fitSha256: approval.fitSha256, unavailableGeometry: [], allFivePartsAuthored: true, published: false, productionAnatomyApproved: false, concealedJointsApproved: false, separateUnderwearAuthored: false, footwearCompatibilityApproved: false, finalStep6CAccepted: false, step6DStarted: false, measurements: { overlapPixels: 0, unownedPixels: 0, generatedAnatomy: false } });
    for (const p of report.measurements.parts) expect(p.selectedPixels).toBeGreaterThan(1000);
    for (const output of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
    const parts = await Promise.all(config.parts.map(p => readFile(resolve(source, p.artwork.source)).then(decodePng)));
    const body = decodePng(await readFile(resolve(assets, config.wholeBody.source))), actual = decodePng(await readFile(resolve(options.outputDirectory, 'fit/NE-body-only.png')));
    // NE physical right is the near side on screen right; both original palms and feet remain opaque.
    for (const [part, x, y] of [[0,600,470],[1,950,360],[2,60,360],[3,700,1430],[4,480,1410]] as const) expect(parts[part]!.data[(y * 1024 + x) * 4 + 3]).toBeGreaterThan(240);
    const hands = [0,0], regions = [{ x:0, y:300, part:2 },{ x:824, y:300, part:1 }];
    for (let p = 0; p < body.data.length; p += 4) {
      const owners = parts.filter(im => im.data[p + 3]! > 0);
      if (owners.length !== (body.data[p + 3]! >= 8 ? 1 : 0)) throw new Error('NE source ownership must be exclusive and complete.');
      if (owners.length) for (let c = 0; c < 4; c++) if (owners[0]!.data[p + c] !== body.data[p + c]) throw new Error('Native NE source RGBA changed.');
      const x = p / 4 % 1024, y = Math.floor(p / 4096);
      for (const [i, r] of regions.entries()) if (x >= r.x && x < r.x + 200 && y >= r.y && y < r.y + 190 && body.data[p + 3]! >= 245) {
        if (parts[r.part]!.data[p + 3] !== body.data[p + 3]) throw new Error('NE native hand alpha was lost.');
        hands[i]!++;
      }
      if (body.data[p + 3]! < 8) body.data.fill(0,p,p+4);
    }
    for (const n of hands) expect(n).toBeGreaterThan(1000);
    expect(sha256(encodePng(actual))).toBe(sha256(encodePng(body)));
    const baseline = JSON.parse(await readFile(resolve(assets, config.baselineConfiguration.source), 'utf8'));
    const guide = decodePng(await readFile(resolve(assets, 'body/back-diagonals-v1', baseline.headGuide.source))), anatomy = decodePng(await readFile(resolve(options.outputDirectory, 'fit/NE-anatomy.png')));
    expect(sha256(anatomy.data.subarray(0, 294 * 4096))).toBe(sha256(guide.data.subarray(0, 294 * 4096)));
    expect(await prepareNortheastBodyPartsReview({ ...options, outputDirectory: resolve(temporary, 'repeat') })).toEqual(report);
    const invalidPlanes = config.parts.map((p,i) => ({ plane: p.plane as RenderPlane, image: parts[i]! })); invalidPlanes[1]!.plane = 'eyes';
    await expect(prepareBackDiagonalBodyReview({ ...options, sourceDirectory: resolve(assets, 'body/back-diagonals-v1'), configuration: 'authoring-ne-v2.json', bodyParts: invalidPlanes, outputDirectory: resolve(temporary, 'frontal-feature') })).rejects.toThrow('frontal feature planes are forbidden');
    const forged = resolve(temporary, 'forged'); await cp(source, forged, { recursive:true });
    const original = JSON.stringify(config); config.parts[1]!.characterSide = 'left';
    await writeFile(resolve(forged,'authoring.json'),JSON.stringify(config));
    await expect(prepareNortheastBodyPartsReview({ ...options, sourceDirectory:forged, outputDirectory:resolve(temporary,'wrong-side') })).rejects.toThrow('identity, plane or visibility changed');
    const changed = northeastBodyPartsReviewSchema.parse(JSON.parse(original)), arm = changed.parts[1]!;
    const hand = decodePng(await readFile(resolve(forged,arm.artwork.source))); hand.data[(360*1024+950)*4+3]=100;
    const bytes=encodePng(hand);await writeFile(resolve(forged,arm.artwork.source),bytes);arm.artwork.sourceSha256=sha256(bytes);
    await writeFile(resolve(forged,'authoring.json'),JSON.stringify(changed));
    await expect(prepareNortheastBodyPartsReview({ ...options,sourceDirectory:forged,outputDirectory:resolve(temporary,'lost-hand') })).rejects.toThrow('native ownership changed');
    const oldBuild=northeastBodyPartsReviewSchema.parse(JSON.parse(original));oldBuild.wholeBody.source='body/back-diagonals-v1/NE-body-v1.png';oldBuild.wholeBody.sourceSha256=sha256(await readFile(resolve(assets,oldBuild.wholeBody.source)));
    await writeFile(resolve(forged,'authoring.json'),JSON.stringify(oldBuild));
    await expect(prepareNortheastBodyPartsReview({ ...options,sourceDirectory:forged,outputDirectory:resolve(temporary,'old-build') })).rejects.toThrow('preserve accepted native body selection');
    changed.baselineConfiguration.source='body/back-diagonals-v1/authoring-nw-v1.json';changed.baselineConfiguration.sourceSha256=sha256(await readFile(resolve(assets,changed.baselineConfiguration.source)));
    await writeFile(resolve(forged,'authoring.json'),JSON.stringify(changed));
    await expect(prepareNortheastBodyPartsReview({ ...options,sourceDirectory:forged,outputDirectory:resolve(temporary,'wrong-facing') })).rejects.toThrow('same-facing checkpoint');
    await expect(prepareNortheastBodyPartsReview({ ...options,outputDirectory:resolve(assets,'unsafe') })).rejects.toThrow('must be disjoint');
    for(const f of before){expect(sha256(await readFile(f.path))).toBe(f.sha256);expect((await stat(f.path)).mtimeMs).toBe(f.mtimeMs);}
  } finally { await rm(temporary,{ recursive:true,force:true }); }
},180_000);
