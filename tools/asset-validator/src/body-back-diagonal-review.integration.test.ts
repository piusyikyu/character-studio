import { cp, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { RenderPlane } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { prepareBackDiagonalBodyReview, backDiagonalBodyReviewSchema } from './body-back-diagonal-review';
import { selectBackDiagonalBody } from './body-silhouette';
import { sha256 } from './reference-import';

const repository = fileURLToPath(new URL('../../../', import.meta.url));

it('validates NE posterior native composition, hand opacity and ownership using a scratch fixture; missing real artwork fails explicitly', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-ne-body-boundaries-'));
  try {
    const assets = resolve(repository, 'assets/source/heroine-v1'), refs = resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), source = resolve(temporary, 'fixture');
    await mkdir(source);
    const options = { sourceDirectory: source, assetDirectory: assets, referenceDirectory: refs, outputDirectory: resolve(temporary, 'review') };
    await expect(prepareBackDiagonalBodyReview(options)).rejects.toThrow('NE body study is unavailable');
    expect(await stat(options.outputDirectory).catch(() => undefined)).toBeUndefined();
    const pin = async (base: string, path: string) => ({ source: path, sourceSha256: sha256(await readFile(resolve(base, path))) });
    const load = async (base: string, path: string) => { const im = decodePng(await readFile(resolve(base, path))); for (let i = 0; i < im.data.length; i += 4) if (im.data[i + 3]! < 8) im.data.fill(0, i, i + 4); return im; };
    const save = async (path: string, value: Uint8Array | string) => { await writeFile(resolve(source, path), value); return pin(source, path); };
    const headConfig = JSON.parse(await readFile(resolve(assets, 'head/soft-oval-v1/back-diagonals-authoring-v1.json'), 'utf8')), hairConfig = JSON.parse(await readFile(resolve(assets, 'hair/long-waves-v1/back-diagonals-authoring-v1.json'), 'utf8'));
    const originalHead = await pin(assets, 'head/soft-oval-v1/' + headConfig.frames.NE.head.source), originalNeck = await pin(assets, 'head/soft-oval-v1/' + headConfig.frames.NE.neck.source), rearHair = await pin(assets, 'hair/long-waves-v1/' + hairConfig.frames.NE.rear.source);
    const head = await load(assets, originalHead.source), neck = await load(assets, originalNeck.source), rear = await load(assets, rearHair.source), guide = blankImage(1024, 1536);
    drawRgba(guide, neck, 0, 0); drawRgba(guide, head, 0, 0);
    const accepted = JSON.parse(await readFile(resolve(assets, 'head/assembly-v1/review-fit-v1.json'), 'utf8')).frames.find((f: { direction: string }) => f.direction === 'NE');
    expect(sha256(encodePng(guide))).toBe(accepted.bareSha256);
    // This fixture exercises native masking/export boundaries, not anatomical visual quality.
    const study = blankImage(1024, 1536);
    const fill = (x: number, y: number, width: number, height: number, alpha = 255) => { for (let yy = y; yy < y + height; yy++) for (let xx = x; xx < x + width; xx++) study.data.set([235, 181, 150, alpha], (yy * 1024 + xx) * 4); };
    fill(495, 300, 175, 470); fill(475, 770, 75, 700); fill(585, 770, 75, 720);
    fill(65, 335, 430, 30); fill(670, 335, 275, 30);
    fill(28, 330, 55, 50); fill(929, 330, 60, 50); fill(30, 333, 1, 6, 127);
    for (let f = 0; f < 5; f++) { fill(22, 330 + f * 9, 9, 5); fill(985, 330 + f * 9, 12, 5); }
    const rect = (x: number, y: number, width: number, height: number) => [[x, y], [x + width, y], [x + width, y + height], [x, y + height]];
    const settings = { schemaVersion: 1, method: 'native-body-study-silhouette', direction: 'NE', cutY: 294, coverageSamples: 4, contourTolerancePixels: 0, minimumStudyAlpha: 8, bodyPolygon: rect(20, 294, 984, 1200), handPolygons: { physicalRight: rect(824, 294, 180, 190), physicalLeft: rect(20, 294, 180, 190) }, neckOwnership: { source: originalNeck.source, startY: 294, endY: 308, method: 'remove-native-neck-coverage-only-where-selected-body-supplies-skin' } };
    const selected = selectBackDiagonalBody(study, settings), posedNeck = { ...neck, data: neck.data.slice() }, neckMask = blankImage(1024, 1536);
    for (let y = 294; y < 308; y++) for (let x = 0; x < 1024; x++) { const p = (y * 1024 + x) * 4; if (neck.data[p + 3]! >= 8 && selected.body.data[p + 3]! >= 8) { posedNeck.data.fill(0, p, p + 4); neckMask.data.fill(255, p, p + 4); } }
    const north = JSON.parse(await readFile(resolve(assets, 'body/north-v1/authoring.json'), 'utf8'));
    const config = backDiagonalBodyReviewSchema.parse({ ...north, id: 'body.back-diagonals.v1', direction: 'NE', headConfiguration: await pin(assets, 'head/soft-oval-v1/back-diagonals-authoring-v1.json'), hairConfiguration: await pin(assets, 'hair/long-waves-v1/back-diagonals-authoring-v1.json'), earConfiguration: await pin(assets, 'ears/human-v1/back-diagonals-v1/authoring.json'), earApproval: await pin(assets, 'ears/human-v1/back-diagonals-v1/review-fit-v1.json'), originalHead, originalNeck, rearHair, headGuide: await save('head-guide.png', encodePng(guide)), approvedHeadBareSha256: accepted.bareSha256, approvedHeadFitSha256: accepted.fitSha256, reference: await pin(refs, 'NE.png'), study: await save('fixture-study.png', encodePng(study)), body: await save('fixture-body.png', encodePng(selected.body)), selection: await save('fixture-mask.png', encodePng(selected.mask)), posedNeck: await save('fixture-neck.png', encodePng(posedNeck)), neckSelection: await save('fixture-neck-mask.png', encodePng(neckMask)), settings: await save('fixture-settings.json', JSON.stringify(settings)), provenance: await save('fixture-provenance.json', JSON.stringify({ purpose: 'scratch-only native workflow fixture; never approved artwork' })), footwearCompatibilityApproved: false, futureFootwearFitObligations: ['Independently author and review footwear posture; this fixture certifies no anatomy or shoe.'] });
    await writeFile(resolve(source, 'authoring-ne-v1.json'), JSON.stringify(config));
    const protectedPaths = [resolve(assets, originalHead.source), resolve(assets, originalNeck.source), resolve(assets, rearHair.source), resolve(assets, 'body/front-diagonals-v1/review-fit-sw-v4.json')];
    const before = await Promise.all(protectedPaths.map(async path => ({ path, hash: sha256(await readFile(path)), mtime: (await stat(path)).mtimeMs })));
    await expect(prepareBackDiagonalBodyReview({ ...options, configuration: 'authoring-nw-v1.json', outputDirectory: resolve(temporary, 'missing-nw') })).rejects.toThrow('NW body study is unavailable');
    const report = await prepareBackDiagonalBodyReview(options);
    expect(report).toMatchObject({ supportedReviewDirections: ['NE'], missingBodyDirections: ['NW'], hiddenFrontalLayers: ['eyes', 'eyebrows', 'mouth', 'hair-front'], published: false, productionAnatomyApproved: false, footwearCompatibilityApproved: false, finalStep6CAccepted: false, step6DStarted: false, nativeHandMeasurements: { sourceAlphaPreserved: true } });
    expect(report.nativeHandMeasurements.retainedInteriors).toBeGreaterThan(1000);
    const planes = new Map<RenderPlane, RgbaImage>([['body-torso', selected.body], ['neck', posedNeck], ['head', head], ['hair-rear', rear]]), anatomy = blankImage(1024, 1536), fit = blankImage(1024, 1536), bodyFree = blankImage(1024, 1536);
    for (const plane of DIRECTION_PLANE_ORDER.NE) { const layer = planes.get(plane); if (!layer) continue; drawRgba(fit, layer, 0, 0); if (plane !== 'hair-rear') drawRgba(anatomy, layer, 0, 0); if (plane !== 'body-torso') drawRgba(bodyFree, plane === 'neck' ? neck : layer, 0, 0); }
    expect(sha256(encodePng(anatomy))).toBe(report.bareSha256); expect(sha256(encodePng(fit))).toBe(report.fitSha256); expect(sha256(encodePng(bodyFree))).toBe(accepted.fitSha256);
    expect(anatomy.data.subarray(0, 294 * 4096)).toEqual(guide.data.subarray(0, 294 * 4096));
    for (const [x, y] of [[40, 345], [950, 345], [990, 332]]) { const p = (y! * 1024 + x!) * 4; expect(anatomy.data.subarray(p, p + 4)).toEqual(study.data.subarray(p, p + 4)); }
    expect(anatomy.data[(335 * 1024 + 23) * 4 + 3]).toBe(0); expect(anatomy.data[(335 * 1024 + 30) * 4 + 3]).toBe(127);
    for (const output of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
    expect(await prepareBackDiagonalBodyReview({ ...options, outputDirectory: resolve(temporary, 'repeat') })).toEqual(report);
    const copied = resolve(temporary, 'forged'); await cp(source, copied, { recursive: true });
    const altered = decodePng(await readFile(resolve(copied, config.body.source))), p = (200 * 1024 + 550) * 4; altered.data.set([255, 0, 255, 255], p);
    const bytes = encodePng(altered); await writeFile(resolve(copied, config.body.source), bytes); config.body.sourceSha256 = sha256(bytes); await writeFile(resolve(copied, 'authoring-ne-v1.json'), JSON.stringify(config));
    await expect(prepareBackDiagonalBodyReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'bad-body') })).rejects.toThrow('native study ownership');
    await cp(source, copied, { recursive: true }); const wrongFacing = backDiagonalBodyReviewSchema.parse(JSON.parse(await readFile(resolve(source, 'authoring-ne-v1.json'), 'utf8')));
    wrongFacing.originalHead = await pin(assets, 'head/soft-oval-v1/NW-head-v1.png'); await writeFile(resolve(copied, 'authoring-ne-v1.json'), JSON.stringify(wrongFacing));
    await expect(prepareBackDiagonalBodyReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'bad-facing') })).rejects.toThrow('same-facing native head');
    await expect(prepareBackDiagonalBodyReview({ ...options, outputDirectory: resolve(source, 'unsafe') })).rejects.toThrow('must be disjoint');
    for (const file of before) { expect(sha256(await readFile(file.path))).toBe(file.hash); expect((await stat(file.path)).mtimeMs).toBe(file.mtime); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 90_000);

it.each([1, 2, 'NW'] as const)('exports real rear-diagonal selection %s with exact accepted head, complete hands and a closed neck attachment', async revision => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-ne-real-body-'));
  try {
    const assets = resolve(repository, 'assets/source/heroine-v1'), source = resolve(assets, 'body/back-diagonals-v1'), referenceDirectory = resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent');
    const configuration: 'authoring-ne-v1.json' | 'authoring-ne-v2.json' | 'authoring-nw-v1.json' = revision === 'NW' ? 'authoring-nw-v1.json' : `authoring-ne-v${revision}.json`;
    const direction = revision === 'NW' ? 'NW' : 'NE', cutY = revision === 'NW' ? 288 : 294;
    const options = { sourceDirectory: source, assetDirectory: assets, referenceDirectory, outputDirectory: resolve(temporary, 'review'), configuration };
    const config = backDiagonalBodyReviewSchema.parse(JSON.parse(await readFile(resolve(source, configuration), 'utf8')));
    const load = async (base: string, path: string) => { const im = decodePng(await readFile(resolve(base, path))); for (let i = 0; i < im.data.length; i += 4) if (im.data[i + 3]! < 8) im.data.fill(0, i, i + 4); return im; };
    const [head, neck, originalNeck, rear, body, guide, study] = await Promise.all([load(assets, config.originalHead.source), load(source, config.posedNeck.source), load(assets, config.originalNeck.source), load(assets, config.rearHair.source), load(source, config.body.source), load(source, config.headGuide.source), load(source, config.study.source)]);
    const tracked = [resolve(assets, config.originalHead.source), resolve(assets, config.originalNeck.source), resolve(assets, config.rearHair.source), resolve(assets, 'body/front-diagonals-v1/review-fit-sw-v4.json'), resolve(source, config.study.source)];
    const before = await Promise.all(tracked.map(async path => ({ path, hash: sha256(await readFile(path)), mtime: (await stat(path)).mtimeMs })));
    const report = await prepareBackDiagonalBodyReview(options);
    expect(report).toMatchObject({ configuration, supportedReviewDirections: [direction], hiddenFrontalLayers: ['eyes', 'eyebrows', 'mouth', 'hair-front'], missingBodyDirections: revision === 'NW' ? [] : ['NW'], nativeHandMeasurements: { sourceAlphaPreserved: true }, published: false, productionAnatomyApproved: false, footwearCompatibilityApproved: false, finalStep6CAccepted: false, step6DStarted: false });
    expect(report.nativeHandMeasurements.retainedInteriors).toBeGreaterThan(1000);
    if (revision === 1) expect(report.nativeHandMeasurements.retainedInteriors).toBe(11336);
    const planes = new Map<RenderPlane, RgbaImage>([['body-torso', body], ['neck', neck], ['head', head], ['hair-rear', rear]]), anatomy = blankImage(1024, 1536), fit = blankImage(1024, 1536), bodyFree = blankImage(1024, 1536);
    for (const plane of DIRECTION_PLANE_ORDER[direction]) { const layer = planes.get(plane); if (!layer) continue; drawRgba(fit, layer, 0, 0); if (plane !== 'hair-rear') drawRgba(anatomy, layer, 0, 0); if (plane !== 'body-torso') drawRgba(bodyFree, plane === 'neck' ? originalNeck : layer, 0, 0); }
    expect(sha256(encodePng(anatomy))).toBe(report.bareSha256); expect(sha256(encodePng(fit))).toBe(report.fitSha256); expect(sha256(encodePng(bodyFree))).toBe(config.approvedHeadFitSha256);
    expect(sha256(anatomy.data.subarray(0, cutY * 4096))).toBe(sha256(guide.data.subarray(0, cutY * 4096)));
    let interiors = 0;
    for (let y = cutY; y < 1536; y++) for (let x = 0; x < 1024; x++) { const p = (y * 1024 + x) * 4; if (study.data[p + 3]! < 245) continue; expect(body.data.subarray(p, p + 4)).toEqual(study.data.subarray(p, p + 4)); interiors++; }
    expect(interiors).toBeGreaterThan(100_000);
    if (revision === 1) expect(interiors).toBe(253975);
    if (revision === 'NW') {
      expect(interiors).toBe(245582);
      expect(report.outputs.some(o => o.path === 'inspection/NW-proportion-comparison.png')).toBe(true);
    }
    // The revised slope moves (626,297) onto the outer antialiased edge; probe its interior below it.
    for (const [x, y] of (revision === 'NW' ? [[440, 296], [490, 300]] : [[615, 297], [626, revision === 1 ? 297 : 299]])) { const p = (y! * 1024 + x!) * 4; expect(anatomy.data[p + 3]).toBeGreaterThanOrEqual(245); }
    if (revision === 2) {
      const p = (297 * 1024 + 626) * 4;
      expect(anatomy.data.subarray(p, p + 4)).toEqual(study.data.subarray(p, p + 4));
      expect(report.outputs.some(o => o.path === 'inspection/NE-proportion-comparison.png')).toBe(true);
    }
    for (const o of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, o.path)))).toBe(o.sha256);
    expect(await prepareBackDiagonalBodyReview({ ...options, outputDirectory: resolve(temporary, 'repeat') })).toEqual(report);
    const copied = resolve(temporary, 'forged'); await cp(source, copied, { recursive: true });
    const altered = decodePng(await readFile(resolve(copied, config.posedNeck.source))), p = revision === 'NW' ? (270 * 1024 + 450) * 4 : (280 * 1024 + 580) * 4; altered.data[p] = altered.data[p]! ^ 1;
    const bytes = encodePng(altered); await writeFile(resolve(copied, config.posedNeck.source), bytes); config.posedNeck.sourceSha256 = sha256(bytes); await writeFile(resolve(copied, configuration), JSON.stringify(config));
    await expect(prepareBackDiagonalBodyReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'bad-neck') })).rejects.toThrow(revision === 'NW' ? 'outside its fifteen native attachment rows' : 'outside its fourteen native attachment rows');
    for (const file of before) { expect(sha256(await readFile(file.path))).toBe(file.hash); expect((await stat(file.path)).mtimeMs).toBe(file.mtime); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 120_000);
