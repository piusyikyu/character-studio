import { cp, mkdir, mkdtemp, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import { decodePng, encodePng } from '@character-studio/render-utils';
import { prepareShoulderReview, shoulderReviewSchema } from './body-shoulder-review';
import { sha256 } from './reference-import';
const repository = fileURLToPath(new URL('../../../', import.meta.url));

it('completes independent S shoulder roots while retaining every visible arm pixel and exact masked body/head/hair fit, rejecting hand, side and mask substitutions', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-shoulder-test-'));
  try {
    const assets = resolve(repository, 'assets/source/heroine-v1'), source = resolve(assets, 'body/shoulders-v1');
    const options = { sourceDirectory: source, assetDirectory: assets, referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(temporary, 'review') };
    const configBytes = await readFile(resolve(source, 'authoring.json')), config = shoulderReviewSchema.parse(JSON.parse(configBytes.toString('utf8')));
    const paths = [resolve(source, 'authoring.json'), ...[config.rightArm, config.leftArm, config.rightRetention, config.leftRetention, config.study].map(p => resolve(source, p.source)), ...[config.baselineConfiguration, config.baselineApproval, config.combinedApproval].map(p => resolve(assets, p.source))];
    const before = await Promise.all(paths.map(async path => ({ path, sha256: sha256(await readFile(path)), mtimeMs: (await stat(path)).mtimeMs })));
    const report = await prepareShoulderReview(options), approval = JSON.parse(await readFile(resolve(assets, config.baselineApproval.source), 'utf8'));
    expect(report).toMatchObject({ supportedReviewDirections: ['S'], compositionOrder: DIRECTION_PLANE_ORDER.S, bodySha256: approval.bodySha256, bareSha256: approval.bareSha256, fitSha256: approval.fitSha256, exactApprovedFit: true, measurements: { changedApprovedArmPixels: 0, generatedVisiblePixels: 0, poseMasksRequired: ['right-arm','left-arm'] }, published: false, productionAnatomyApproved: false, concealedJointsApproved: false, separateUnderwearAuthored: false, footwearCompatibilityApproved: false, finalStep6CAccepted: false, step6DStarted: false });
    expect(report.measurements.unmaskedChangedPixels).toBeGreaterThan(500);
    for (const count of Object.values(report.measurements.addedRootPixels)) expect(count).toBeGreaterThan(2000);
    const torso = decodePng(await readFile(resolve(assets, 'body/parts-v1/S-torso-v1.png')));
    for (const [index, side] of ['right','left'].entries()) {
      const original = decodePng(await readFile(resolve(assets, `body/parts-v1/S-${side}-arm-v1.png`))), arm = decodePng(await readFile(resolve(source, `S-${side}-arm-v1.png`))), mask = decodePng(await readFile(resolve(source, `S-${side}-arm-retention-v1.png`))); let added = 0;
      for (let p = 0; p < arm.data.length; p += 4) {
        if (original.data[p + 3]) {
          if (arm.data.subarray(p, p + 4).some((v, c) => v !== original.data[p + c]) || mask.data[p + 3] !== 255) throw new Error('Original S arm/hand RGBA changed.');
        } else if (arm.data[p + 3]) {
          const x = p / 4 % 1024, y = Math.floor(p / 4096);
          if (y < 309 || y >= 430 || (index === 0 ? x < 412 || x > 475 : x < 551 || x > 616) || torso.data[p + 3]! < 245 || mask.data[p + 3]) throw new Error('S root escaped its concealed same-side shoulder or pose mask.');
          added++;
        }
      }
      expect(added).toBe(index === 0 ? report.measurements.addedRootPixels.right : report.measurements.addedRootPixels.left);
    }
    for (const output of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
    expect(sha256(await readFile(resolve(options.outputDirectory, 'fit/S.png')))).toBe(approval.fitSha256);
    expect(await prepareShoulderReview({ ...options, outputDirectory: resolve(temporary, 'repeat') })).toEqual(report);
    const forged = resolve(temporary, 'forged'); await cp(source, forged, { recursive: true });
    const save = async (configuration: unknown) => writeFile(resolve(forged, 'authoring.json'), JSON.stringify(configuration));
    const handConfig = shoulderReviewSchema.parse(JSON.parse(configBytes.toString('utf8'))), hand = decodePng(await readFile(resolve(forged, handConfig.rightArm.source)));
    const pixel = hand.data.findIndex((v, i) => i % 4 === 3 && v >= 245 && Math.floor(i / 4) % 1024 < 120); hand.data[pixel - 3] = hand.data[pixel - 3]! ^ 1;
    const changedHand = encodePng(hand); await writeFile(resolve(forged, handConfig.rightArm.source), changedHand); handConfig.rightArm.sourceSha256 = sha256(changedHand); await save(handConfig);
    await expect(prepareShoulderReview({ ...options, sourceDirectory: forged, outputDirectory: resolve(temporary, 'changed-hand') })).rejects.toThrow('native completion or pose-retention mask changed');
    const wrongSide = shoulderReviewSchema.parse(JSON.parse(configBytes.toString('utf8'))); wrongSide.rightArm = wrongSide.leftArm; await save(wrongSide);
    await expect(prepareShoulderReview({ ...options, sourceDirectory: forged, outputDirectory: resolve(temporary, 'wrong-side') })).rejects.toThrow('native completion or pose-retention mask changed');
    const maskConfig = shoulderReviewSchema.parse(JSON.parse(configBytes.toString('utf8'))), mask = decodePng(await readFile(resolve(forged, maskConfig.leftRetention.source))), left = decodePng(await readFile(resolve(source, config.leftArm.source)));
    const rootPixel = left.data.findIndex((v, i) => i % 4 === 3 && v > 0 && mask.data[i] === 0); mask.data[rootPixel] = 255;
    const changedMask = encodePng(mask); await writeFile(resolve(forged, maskConfig.leftRetention.source), changedMask); maskConfig.leftRetention.sourceSha256 = sha256(changedMask); await save(maskConfig);
    // Restore the forged arm to isolate the retention-mask failure.
    await writeFile(resolve(forged, config.rightArm.source), await readFile(resolve(source, config.rightArm.source)));
    await expect(prepareShoulderReview({ ...options, sourceDirectory: forged, outputDirectory: resolve(temporary, 'lost-mask') })).rejects.toThrow('native completion or pose-retention mask changed');
    const foreign = shoulderReviewSchema.parse(JSON.parse(configBytes.toString('utf8'))); foreign.baselineConfiguration.source = 'body/parts-v1/north/authoring.json'; foreign.baselineConfiguration.sourceSha256 = sha256(await readFile(resolve(assets, foreign.baselineConfiguration.source))); await save(foreign);
    await expect(prepareShoulderReview({ ...options, sourceDirectory: forged, outputDirectory: resolve(temporary, 'foreign') })).rejects.toThrow('exact accepted part checkpoints');
    await expect(prepareShoulderReview({ ...options, outputDirectory: resolve(assets, 'unsafe') })).rejects.toThrow('must be disjoint');
    const unsafe = resolve(temporary, 'unsafe'); await mkdir(resolve(unsafe, 'fit'), { recursive: true }); await symlink(resolve(source, config.rightArm.source), resolve(unsafe, 'fit/S.png'));
    await expect(prepareShoulderReview({ ...options, outputDirectory: unsafe })).rejects.toThrow('output symlinks forbidden');
    for (const f of before) { expect(sha256(await readFile(f.path))).toBe(f.sha256); expect((await stat(f.path)).mtimeMs).toBe(f.mtimeMs); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 180_000);
