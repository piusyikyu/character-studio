import { cp, mkdtemp, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import { wardrobeInputsSchema, wardrobeReviewSchema, prepareWardrobeReview } from './body-wardrobe-review';
import { constructSouthWardrobe, validateWardrobeCoverage, wardrobeClothing, wardrobeLayerNames } from './body-wardrobe';
import type { WardrobeLayers } from './body-wardrobe';
import { sha256 } from './reference-import';
const repository = fileURLToPath(new URL('../../../',import.meta.url));

it('keeps the approved S body exact with separate everyday underwear and validates high-slit and midriff coverage before native export', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(),'character-wardrobe-test-'));
  try {
    const assets = resolve(repository,'assets/source/heroine-v1'), source = resolve(assets,'outfit/dress-v1');
    const options = { sourceDirectory: source,assetDirectory: assets,referenceDirectory: resolve(repository,'assets/staging/heroine-v1/references/import-v1/transparent'),outputDirectory: resolve(temporary,'review') };
    const configBytes = await readFile(resolve(source,'authoring.json')), config = wardrobeReviewSchema.parse(JSON.parse(configBytes.toString('utf8')));
    const manifestBytes = await readFile(resolve(source,config.inputs.source)), manifest = wardrobeInputsSchema.parse(JSON.parse(manifestBytes.toString('utf8')));
    const baseline = JSON.parse(await readFile(resolve(assets,manifest.baselineConfiguration.source),'utf8'));
    const paths = [resolve(source,'authoring.json'),resolve(source,manifest.study.source),...wardrobeLayerNames.map(n => resolve(source,config.layers[n].source)),resolve(assets,baseline.wholeBody.source),resolve(assets,baseline.head.source),resolve(assets,baseline.frontHair.source),resolve(assets,baseline.rearHair.source)];
    const before = await Promise.all(paths.map(async path => ({ path,sha256: sha256(await readFile(path)),mtimeMs: (await stat(path)).mtimeMs })));
    const layers = Object.fromEntries(await Promise.all(wardrobeLayerNames.map(async n => [n,decodePng(await readFile(resolve(source,config.layers[n].source)))]))) as WardrobeLayers;
    const originalTorso = decodePng(await readFile(resolve(assets,'body/parts-v1/S-torso-v1.png'))), reconstructed = blankImage(1024,1536);
    for (const layer of [layers.skinBase,layers.bra,layers.panties]) drawRgba(reconstructed,layer,0,0);
    expect(sha256(reconstructed.data)).toBe(sha256(originalTorso.data));
    for (const look of ['daily-underwear','reference-dress','midriff-high-slit'] as const) expect(validateWardrobeCoverage(wardrobeClothing(layers,look)).pelvis).toBeGreaterThan(1000);
    expect(() => validateWardrobeCoverage([layers.panties])).toThrow('WARDROBE_COVERAGE_MISSING: bust');
    expect(() => validateWardrobeCoverage([layers.bra])).toThrow('WARDROBE_COVERAGE_MISSING: pelvis');
    expect(() => validateWardrobeCoverage([])).toThrow('WARDROBE_COVERAGE_MISSING');
    const slitDamage = { ...layers.dress,data: layers.dress.data.slice() }; slitDamage.data.fill(0,650 * 1024 * 4,706 * 1024 * 4);
    // Opening a garment above its compatible lining must fail when that lining is absent.
    expect(() => validateWardrobeCoverage([slitDamage])).toThrow('WARDROBE_COVERAGE_MISSING: pelvis');
    const expected = constructSouthWardrobe(originalTorso,decodePng(await readFile(resolve(source,manifest.study.source))));
    for (const name of wardrobeLayerNames) expect(sha256(encodePng(expected[name]))).toBe(config.layers[name].sourceSha256);
    const report = await prepareWardrobeReview(options);
    expect(report).toMatchObject({ direction: 'S',approvedBaselineReconstructed: true,separateUnderwearAuthored: true,skinBelowCoveredAreasAuthored: false,coveredAssembliesOnly: true,published: false,productionRigApproved: false,footwearCompatibilityApproved: false,finalStep6CAccepted: false,step6DStarted: false,measurements: { 'reference-dress': { bodyGapPixels: 0,visibleLiningPixels: 0,bellyVisible: false },'midriff-high-slit': { bodyGapPixels: 0,visibleLiningPixels: 0,bellyVisible: true } } });
    const acceptedFit = decodePng(await readFile(resolve(repository,'assets/staging/heroine-v1/body/shoulders-v1/fit/S.png')));
    for (const output of report.outputs) {
      const bytes = await readFile(resolve(options.outputDirectory,output.path)); expect(sha256(bytes)).toBe(output.sha256);
      if (!output.path.endsWith('.png')) continue;
      const fit = decodePng(bytes); expect([fit.width,fit.height]).toEqual([1024,1536]);
      for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) if (y < 309 || y >= 1441 || (y < 430 && (x < 390 || x > 635))) {
        const p = (y * 1024 + x) * 4;
        if (fit.data.subarray(p,p+4).some((v,c) => v !== acceptedFit.data[p+c])) throw new Error('Wardrobe changed an approved head, hair, hand, arm or foot outside its construction region.');
      }
    }
    expect(await prepareWardrobeReview({ ...options,outputDirectory: resolve(temporary,'repeat') })).toEqual(report);
    const forged = resolve(temporary,'forged'); await cp(source,forged,{ recursive: true });
    const damaged = { ...layers.lining,data: layers.lining.data.slice() }; damaged.data[(660 * 1024 + 512) * 4] = damaged.data[(660 * 1024 + 512) * 4]! ^ 1;
    const changed = encodePng(damaged), altered = wardrobeReviewSchema.parse(JSON.parse(configBytes.toString('utf8'))); altered.layers.lining.sourceSha256 = sha256(changed); await writeFile(resolve(forged,altered.layers.lining.source),changed); await writeFile(resolve(forged,'authoring.json'),JSON.stringify(altered));
    await expect(prepareWardrobeReview({ ...options,sourceDirectory: forged,outputDirectory: resolve(temporary,'bad') })).rejects.toThrow('native source construction changed: lining');
    await expect(prepareWardrobeReview({ ...options,outputDirectory: resolve(assets,'unsafe') })).rejects.toThrow('must be disjoint');
    const linked = resolve(temporary,'linked'); await symlink(source,linked);
    await expect(prepareWardrobeReview({ ...options,outputDirectory: resolve(linked,'unsafe') })).rejects.toThrow('symlinks forbidden');
    for (const file of before) { expect(sha256(await readFile(file.path))).toBe(file.sha256); expect((await stat(file.path)).mtimeMs).toBe(file.mtimeMs); }
  } finally { await rm(temporary,{ recursive: true,force: true }); }
},180_000);
