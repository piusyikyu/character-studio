import { cp,mkdtemp,readFile,rm,stat,writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect,it } from 'vitest';
import { blankImage,decodePng,drawRgba,encodePng } from '@character-studio/render-utils';
import { northWardrobeInputsSchema,northWardrobeReviewSchema,prepareWardrobeReview } from './body-wardrobe-review';
import { northWardrobeClothing,validateNorthWardrobeCoverage,constructNorthWardrobe } from './body-north-wardrobe';
import { wardrobeLayerNames } from './body-wardrobe';
import type { WardrobeLayers } from './body-wardrobe';
import { sha256 } from './reference-import';
const repository = fileURLToPath(new URL('../../../',import.meta.url));
it('reconstructs posterior underwear exactly and fits an independently authored N gown with closed rear construction and optional waist exposure',async () => {
  const temporary = await mkdtemp(resolve(tmpdir(),'character-north-wardrobe-test-'));
  try {
    const assets = resolve(repository,'assets/source/heroine-v1'),source = resolve(assets,'outfit/dress-v1/north');
    const options = { sourceDirectory: source,assetDirectory: assets,referenceDirectory: resolve(repository,'assets/staging/heroine-v1/references/import-v1/transparent'),outputDirectory: resolve(temporary,'review') };
    const configBytes = await readFile(resolve(source,'authoring.json')),config = northWardrobeReviewSchema.parse(JSON.parse(configBytes.toString('utf8'))),manifestBytes = await readFile(resolve(source,config.inputs.source)),manifest = northWardrobeInputsSchema.parse(JSON.parse(manifestBytes.toString('utf8')));
    const baseline = JSON.parse(await readFile(resolve(assets,manifest.baselineConfiguration.source),'utf8'));
    const paths = [resolve(source,'authoring.json'),resolve(source,manifest.study.source),...wardrobeLayerNames.map(n => resolve(source,config.layers[n].source)),resolve(assets,baseline.head.source),resolve(assets,baseline.neck.source),resolve(assets,baseline.rearHair.source),resolve(assets,'outfit/dress-v1/authoring.json')];
    const before = await Promise.all(paths.map(async path => ({ path,sha256: sha256(await readFile(path)),mtimeMs: (await stat(path)).mtimeMs })));
    const layers = Object.fromEntries(await Promise.all(wardrobeLayerNames.map(async n => [n,decodePng(await readFile(resolve(source,config.layers[n].source)))]))) as WardrobeLayers;
    const originalTorso = decodePng(await readFile(resolve(assets,'body/parts-v1/north/N-torso-v1.png'))),reconstructed = blankImage(1024,1536);
    for (const layer of [layers.skinBase,layers.bra,layers.panties]) drawRgba(reconstructed,layer,0,0);
    expect(sha256(reconstructed.data)).toBe(sha256(originalTorso.data));
    for (const look of ['daily-underwear','reference-dress','waist-opening-test'] as const) expect(validateNorthWardrobeCoverage(northWardrobeClothing(layers,look),look,layers.skinBase).pelvis).toBeGreaterThan(1000);
    expect(() => validateNorthWardrobeCoverage([layers.bra],'daily-underwear',layers.skinBase)).toThrow('WARDROBE_COVERAGE_MISSING: pelvis');
    const frontSlit = { ...layers.dress,data: layers.dress.data.slice() };frontSlit.data.fill(0,(800 * 1024 + 530) * 4,(800 * 1024 + 570) * 4);
    expect(() => validateNorthWardrobeCoverage([layers.lining,frontSlit],'reference-dress',layers.skinBase)).toThrow('WARDROBE_COVERAGE_MISSING: closed-rear-skirt');
    const sideCutout = { ...layers.dress,data: layers.dress.data.slice() };
    for (let y = 500; y < 525; y++) sideCutout.data.fill(0,(y * 1024 + 409) * 4,(y * 1024 + 460) * 4);
    expect(() => validateNorthWardrobeCoverage([layers.lining,sideCutout],'reference-dress',layers.skinBase)).toThrow('WARDROBE_COVERAGE_MISSING: closed-bodice-sides');
    const expected = constructNorthWardrobe(originalTorso,decodePng(await readFile(resolve(source,manifest.study.source))));
    for (const name of wardrobeLayerNames) expect(sha256(encodePng(expected[name]))).toBe(config.layers[name].sourceSha256);
    const report = await prepareWardrobeReview(options),approval = JSON.parse(await readFile(resolve(assets,manifest.baselineApproval.source),'utf8'));
    expect(report).toMatchObject({ direction: 'N',approvedBaselineReconstructed: true,bodySha256: approval.bodySha256,fitSha256: approval.fitSha256,separateUnderwearAuthored: true,skinBelowCoveredAreasAuthored: false,coveredAssembliesOnly: true,published: false,productionRigApproved: false,footwearCompatibilityApproved: false,finalStep6CAccepted: false,step6DStarted: false,measurements: { 'reference-dress': { bodyGapPixels: 0,visibleLiningPixels: 0,closedRearSkirt: true },'waist-opening-test': { bodyGapPixels: 0,visibleLiningPixels: 0,waistVisible: true,closedRearSkirt: true } } });
    const original = decodePng(await readFile(resolve(repository,'assets/staging/heroine-v1/body/parts-v1/north/fit/N.png')));
    const fitted = decodePng(await readFile(resolve(options.outputDirectory,'fit/N.png')));
    for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) if (y < 317 || y >= 1420 || (y < 460 && (x < 390 || x > 635))) {
      const p = (y * 1024 + x) * 4;
      if (original.data.subarray(p,p+4).some((v,c) => v !== fitted.data[p+c])) throw new Error('N wardrobe changed original posterior head, arms, hands or heel-oriented feet.');
    }
    for (const p of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory,p.path)))).toBe(p.sha256);
    expect(await prepareWardrobeReview({ ...options,outputDirectory: resolve(temporary,'repeat') })).toEqual(report);
    const forged = resolve(temporary,'forged');await cp(source,forged,{ recursive: true });
    const bad = northWardrobeInputsSchema.parse(JSON.parse(manifestBytes.toString('utf8')));bad.baselineConfiguration.source = 'body/parts-v1/authoring.json';const badBytes = Buffer.from(JSON.stringify(bad));const modified = northWardrobeReviewSchema.parse(JSON.parse(configBytes.toString('utf8')));modified.inputs.sourceSha256 = sha256(badBytes);await writeFile(resolve(forged,modified.inputs.source),badBytes);await writeFile(resolve(forged,'authoring.json'),JSON.stringify(modified));
    await expect(prepareWardrobeReview({ ...options,sourceDirectory: forged,outputDirectory: resolve(temporary,'bad') })).rejects.toThrow('approved N body checkpoint');
    for (const f of before) { expect(sha256(await readFile(f.path))).toBe(f.sha256);expect((await stat(f.path)).mtimeMs).toBe(f.mtimeMs); }
  } finally { await rm(temporary,{ recursive: true,force: true }); }
},180_000);
