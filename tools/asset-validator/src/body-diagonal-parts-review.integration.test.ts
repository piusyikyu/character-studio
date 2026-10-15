import { cp, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { decodePng, encodePng } from '@character-studio/render-utils';
import { southeastBodyPartsReviewSchema, prepareSoutheastBodyPartsReview, southwestBodyPartsReviewSchema, prepareSouthwestBodyPartsReview } from './body-facing-parts-review';
import { sha256 } from './reference-import';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
it.each([
  { direction: 'SE', folder: 'southeast', schema: southeastBodyPartsReviewSchema, prepare: prepareSoutheastBodyPartsReview, probes: [[0,600,450],[1,100,345],[2,920,360],[3,500,1440],[4,700,1415]], hands: [{ x: 35, y: 315, width: 160, height: 90 }, { x: 875, y: 330, width: 149, height: 90 }] },
  { direction: 'SW', folder: 'southwest', schema: southwestBodyPartsReviewSchema, prepare: prepareSouthwestBodyPartsReview, probes: [[0,480,450],[1,60,380],[2,950,400],[3,390,1445],[4,610,1470]], hands: [{ x: 0, y: 325, width: 195, height: 150 }, { x: 850, y: 330, width: 174, height: 150 }] },
] as const)('recomposes five native $direction planes with approved fabric, facial/hair depth and complete hands, and rejects side, pixel or foreign-facing substitutions', async ({ direction, folder, schema, prepare, probes, hands: handRegions }) => {
  const temporary = await mkdtemp(resolve(tmpdir(), `character-${direction.toLowerCase()}-parts-test-`));
  try {
    const assets = resolve(repository, 'assets/source/heroine-v1'), source = resolve(assets, 'body/parts-v1/' + folder);
    const options = { sourceDirectory: source, assetDirectory: assets, referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(temporary, 'review') };
    const config = schema.parse(JSON.parse(await readFile(resolve(source, 'authoring.json'), 'utf8')));
    const paths = [resolve(source, 'authoring.json'), resolve(assets, config.baselineConfiguration.source), resolve(assets, config.baselineApproval.source), resolve(assets, config.wholeBody.source), ...config.parts.map(p => resolve(source, p.artwork.source))];
    const before = await Promise.all(paths.map(async path => ({ path, sha256: sha256(await readFile(path)), mtimeMs: (await stat(path)).mtimeMs })));
    const report = await prepare(options), approval = JSON.parse(await readFile(resolve(assets, config.baselineApproval.source), 'utf8'));
    expect(report).toMatchObject({ supportedReviewDirections: [direction], exactApprovedFit: true, bareSha256: approval.bareSha256, fitSha256: approval.fitSha256, unavailableGeometry: [], allFivePartsAuthored: true, published: false, productionAnatomyApproved: false, concealedJointsApproved: false, separateUnderwearAuthored: false, footwearCompatibilityApproved: false, finalStep6CAccepted: false, step6DStarted: false, measurements: { overlapPixels: 0, unownedPixels: 0, generatedAnatomy: false } });
    for (const p of report.measurements.parts) expect(p.selectedPixels).toBeGreaterThan(1000);
    for (const output of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
    const parts = await Promise.all(config.parts.map(p => readFile(resolve(source, p.artwork.source)).then(decodePng)));
    const body = decodePng(await readFile(resolve(assets, config.wholeBody.source))), actual = decodePng(await readFile(resolve(options.outputDirectory, `fit/${direction}-body-only.png`)));
    // Independently selected native probes: torso, physical-right/left palms, then right/left feet.
    for (const [part, x, y] of probes) expect(parts[part]!.data[(y * 1024 + x) * 4 + 3]).toBeGreaterThan(240);
    const hands = [0, 0];
    for (let p = 0; p < body.data.length; p += 4) {
      const owners = parts.filter(im => im.data[p + 3]! > 0);
      if (owners.length !== (body.data[p + 3]! >= 8 ? 1 : 0)) throw new Error(`${direction} source ownership must be complete and exclusive.`);
      if (owners.length) for (let c = 0; c < 4; c++) if (owners[0]!.data[p + c] !== body.data[p + c]) throw new Error(`Source RGBA changed in a visible ${direction} part.`);
      const x = p / 4 % 1024, y = Math.floor(p / 4096);
      for (const [side, region] of handRegions.entries()) if (x >= region.x && x < region.x + region.width && y >= region.y && y < region.y + region.height && body.data[p + 3]! >= 250) {
        if (parts[side + 1]!.data[p + 3] !== body.data[p + 3]) throw new Error(`Accepted native ${direction} hand alpha was lost.`);
        hands[side]!++;
      }
      if (body.data[p + 3]! < 8) body.data.fill(0, p, p + 4);
    }
    for (const count of hands) expect(count).toBeGreaterThan(1000);
    expect(sha256(encodePng(actual))).toBe(sha256(encodePng(body)));
    expect(await prepare({ ...options, outputDirectory: resolve(temporary, 'repeat') })).toEqual(report);
    const forged = resolve(temporary, 'forged'); await cp(source, forged, { recursive: true });
    const original = JSON.stringify(config); config.parts[1]!.characterSide = 'left';
    await writeFile(resolve(forged, 'authoring.json'), JSON.stringify(config));
    await expect(prepare({ ...options, sourceDirectory: forged, outputDirectory: resolve(temporary, 'bad-side') })).rejects.toThrow('identity, plane or visibility changed');
    const changed = schema.parse(JSON.parse(original)), arm = changed.parts[1]!;
    const image = decodePng(await readFile(resolve(forged, arm.artwork.source))); image.data[(probes[1][2] * 1024 + probes[1][1]) * 4 + 3] = 100;
    const bytes = encodePng(image); await writeFile(resolve(forged, arm.artwork.source), bytes); arm.artwork.sourceSha256 = sha256(bytes);
    await writeFile(resolve(forged, 'authoring.json'), JSON.stringify(changed));
    await expect(prepare({ ...options, sourceDirectory: forged, outputDirectory: resolve(temporary, 'lost-hand') })).rejects.toThrow('native ownership changed');
    if (direction === 'SW') {
      const oldColour = schema.parse(JSON.parse(original));
      oldColour.wholeBody.source = 'body/front-diagonals-v1/SW-body-v1.png';
      oldColour.wholeBody.sourceSha256 = sha256(await readFile(resolve(assets, oldColour.wholeBody.source)));
      await writeFile(resolve(forged, 'authoring.json'), JSON.stringify(oldColour));
      await expect(prepare({ ...options, sourceDirectory: forged, outputDirectory: resolve(temporary, 'old-colour') })).rejects.toThrow('preserve accepted native body selection');
    }
    changed.baselineConfiguration.source = direction === 'SE' ? 'body/front-diagonals-v1/authoring-sw-v5.json' : 'body/front-diagonals-v1/authoring-v2.json';
    changed.baselineConfiguration.sourceSha256 = sha256(await readFile(resolve(assets, changed.baselineConfiguration.source)));
    await writeFile(resolve(forged, 'authoring.json'), JSON.stringify(changed));
    await expect(prepare({ ...options, sourceDirectory: forged, outputDirectory: resolve(temporary, 'wrong-facing') })).rejects.toThrow('same-facing checkpoint');
    await expect(prepare({ ...options, outputDirectory: resolve(assets, 'unsafe') })).rejects.toThrow('must be disjoint');
    for (const file of before) { expect(sha256(await readFile(file.path))).toBe(file.sha256); expect((await stat(file.path)).mtimeMs).toBe(file.mtimeMs); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 180_000);
