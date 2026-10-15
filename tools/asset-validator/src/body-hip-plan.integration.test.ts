import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { decodePng, encodePng } from '@character-studio/render-utils';
import { prepareHipPlan, hipPlanSchema } from './body-hip-plan';
import { checkerPreview } from './inspection';
import { sha256 } from './reference-import';
const repository = fileURLToPath(new URL('../../../', import.meta.url));

it('validates the approved shoulder/leg checkpoint and renders only planned hip coverage without inventing art, rejecting changed guides and foreign baselines', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-hip-plan-test-'));
  try {
    const assets = resolve(repository, 'assets/source/heroine-v1'), source = resolve(assets, 'body/hips-v1');
    const options = { sourceDirectory: source, assetDirectory: assets, referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(temporary, 'review') };
    const bytes = await readFile(resolve(source, 'authoring-pending.json')), config = hipPlanSchema.parse(JSON.parse(bytes.toString('utf8')));
    const paths = [resolve(source, 'authoring-pending.json'), resolve(source, config.guide.source), resolve(assets, config.shoulderConfiguration.source), resolve(assets, config.shoulderApproval.source), ...['S-right-leg-v1.png','S-left-leg-v1.png'].map(p => resolve(assets, 'body/parts-v1', p))];
    const before = await Promise.all(paths.map(async path => ({ path, sha256: sha256(await readFile(path)), mtimeMs: (await stat(path)).mtimeMs })));
    const report = await prepareHipPlan(options), approval = JSON.parse(await readFile(resolve(assets, config.shoulderApproval.source), 'utf8'));
    expect(report).toMatchObject({ status: 'blocked-image-generation', generatedArtProduced: false, selectedStudy: null, plannedGeometryOnly: true, sourceLegsChanged: false, sourceFeetChanged: false, approvedCompositionVerified: true, bodySha256: approval.bodySha256, bareSha256: approval.bareSha256, fitSha256: approval.fitSha256, published: false, productionAnatomyApproved: false, concealedJointsApproved: false, footwearCompatibilityApproved: false, finalStep6CAccepted: false, step6DStarted: false });
    expect(report.attempts).toHaveLength(2);
    expect((await readdir(source)).filter(p => /^S-.*-leg.*\.png$/.test(p))).toEqual([]);
    expect(await readdir(options.outputDirectory)).toEqual(['inspection','metadata.json']);
    for (const p of [...report.outputs, report.interactiveInspection]) expect(sha256(await readFile(resolve(options.outputDirectory, p.path)))).toBe(p.sha256);
    const baseline = JSON.parse(await readFile(resolve(assets, config.baselineConfiguration.source), 'utf8')), body = decodePng(await readFile(resolve(assets, baseline.wholeBody.source))), expected = checkerPreview(body, 'S'), sheet = decodePng(await readFile(resolve(options.outputDirectory, 'inspection/hip-root-plan.png')));
    const torso = decodePng(await readFile(resolve(assets, 'body/parts-v1/S-torso-v1.png'))), legs = await Promise.all(['right','left'].map(async side => decodePng(await readFile(resolve(assets, `body/parts-v1/S-${side}-leg-v1.png`)))));
    const changed = [0,0];
    for (let y = 0; y < 192; y++) for (let x = 0; x < 384; x++) {
      const native = ((624 + y) * 1024 + 320 + x) * 4, p = (y * 1152 + x) * 4;
      if (sheet.data.subarray(p,p+4).some((v,c) => v !== expected.data[native+c])) throw new Error('Hip plan changed the accepted native panel or resampled it.');
      for (const side of [0,1]) {
        const q = (y * 1152 + (side + 1) * 384 + x) * 4;
        if (sheet.data.subarray(q,q+4).some((v,c) => v !== expected.data[native+c])) {
          const nx = x + 320, ny = y + 624;
          if (ny < 667 || ny >= 739 || (side === 0 ? nx < 368 || nx > 511 : nx < 513 || nx > 652) || legs[side]!.data[native+3] || torso.data[native+3]! < 245) throw new Error('Diagnostic overlay escaped its proposed concealed root.');
          changed[side]!++;
        }
      }
    }
    for (const n of changed) expect(n).toBeGreaterThan(2000);
    expect(await prepareHipPlan({ ...options, outputDirectory: resolve(temporary, 'repeat') })).toEqual(report);
    const forged = resolve(temporary, 'forged'); await cp(source, forged, { recursive: true });
    const altered = hipPlanSchema.parse(JSON.parse(bytes.toString('utf8'))), guide = decodePng(await readFile(resolve(forged, altered.guide.source)));
    const pixel = guide.data.findIndex((v,i) => i % 4 === 3 && v >= 245); guide.data[pixel - 3] = guide.data[pixel - 3]! ^ 1;
    const changedGuide = encodePng(guide); await writeFile(resolve(forged, altered.guide.source), changedGuide); altered.guide.sourceSha256 = sha256(changedGuide); await writeFile(resolve(forged, 'authoring-pending.json'), JSON.stringify(altered));
    await expect(prepareHipPlan({ ...options, sourceDirectory: forged, outputDirectory: resolve(temporary, 'bad-guide') })).rejects.toThrow('preserve original upper-leg RGBA');
    const foreign = hipPlanSchema.parse(JSON.parse(bytes.toString('utf8'))); foreign.baselineConfiguration.source = 'body/parts-v1/north/authoring.json'; foreign.baselineConfiguration.sourceSha256 = sha256(await readFile(resolve(assets, foreign.baselineConfiguration.source))); await writeFile(resolve(forged, 'authoring-pending.json'), JSON.stringify(foreign));
    await expect(prepareHipPlan({ ...options, sourceDirectory: forged, outputDirectory: resolve(temporary, 'foreign') })).rejects.toThrow('accepted S parts and shoulder checkpoint');
    await expect(prepareHipPlan({ ...options, outputDirectory: resolve(assets, 'unsafe') })).rejects.toThrow('must be disjoint');
    const unsafe = resolve(temporary, 'unsafe'); await mkdir(resolve(unsafe, 'inspection'), { recursive: true }); await symlink(resolve(source, config.guide.source), resolve(unsafe, 'inspection/hip-root-plan.png'));
    await expect(prepareHipPlan({ ...options, outputDirectory: unsafe })).rejects.toThrow('output symlinks forbidden');
    for (const f of before) { expect(sha256(await readFile(f.path))).toBe(f.sha256); expect((await stat(f.path)).mtimeMs).toBe(f.mtimeMs); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 180_000);
