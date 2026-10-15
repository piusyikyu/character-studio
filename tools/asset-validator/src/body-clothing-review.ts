import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { z } from 'zod';
import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { RenderPlane } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { prepareFrontDiagonalBodyReview } from './body-profile-review';
import type { NorthBodyReviewOptions } from './body-north-review';
import { recolourSouthwestClothing } from './body-southwest-clothing';
import { checkerPreview } from './inspection';
import { sha256 } from './reference-import';

const hash = z.string().regex(/^[a-f0-9]{64}$/), source = z.string().regex(/^(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+$/).refine(p => p.split('/').every(s => s !== '.' && s !== '..'));
const pin = z.strictObject({ source, sourceSha256: hash });
export const southwestClothingReviewSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('body.front-diagonals.v1'), assetVersion: z.literal(5), direction: z.literal('SW'), target: z.literal('detailed'),
  previous: pin.extend({ source: z.literal('authoring-sw-v4.json') }), previousApproval: pin.extend({ source: z.literal('review-fit-sw-v4.json') }),
  originalBody: pin.extend({ source: z.literal('SW-body-v1.png') }), body: pin, selection: pin, settings: pin, provenance: pin, study: pin, guide: pin, colourReference: pin,
  reference: pin.extend({ source: z.literal('SW.png') }), front: pin, rear: pin,
  status: z.literal('draft-needs-human-review'), published: z.literal(false), paletteReady: z.literal(false),
  productionAnatomyApproved: z.literal(false), tposeApproved: z.literal(false), finalStep6CAccepted: z.literal(false), knownReviewIssues: z.array(z.string()).min(1),
});
const inside = (base: string, p: string) => { const r = relative(base, p); return r === '' || (!isAbsolute(r) && r !== '..' && !r.startsWith('../')); };
const missing = (e: unknown) => (e as NodeJS.ErrnoException).code === 'ENOENT';

/** Preserve the approved SW composition; replace only explicitly selected garment RGB at native coordinates. */
export async function prepareSouthwestClothingReview(options: NorthBodyReviewOptions) {
  const [root, assets, refs] = await Promise.all([options.sourceDirectory, options.assetDirectory, options.referenceDirectory].map(p => realpath(p)));
  const out = resolve(options.outputDirectory), inputs = new Map<string, string>();
  if ([root!, assets!, refs!].some(p => inside(p, out) || inside(out, p))) throw new Error('Clothing review outputs and inputs must be disjoint.');
  for (let p = out; ; p = dirname(p)) {
    try { if (await realpath(p) !== p) throw new Error('Clothing output cannot traverse symlinks.'); break; }
    catch (e) { if (!missing(e)) throw e; }
  }
  const read = async (base: string, p: { source: string; sourceSha256?: string }) => {
    const path = resolve(base, p.source);
    if (!inside(base, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error('Ordinary pinned clothing inputs required.');
    const bytes = await readFile(path), digest = sha256(bytes);
    if (p.sourceSha256 && p.sourceSha256 !== digest) throw new Error('Pinned clothing input changed: ' + p.source);
    inputs.set(path, digest); return bytes;
  };
  const load = async (base: string, p: z.infer<typeof pin>) => {
    const im = decodePng(await read(base, p));
    if (im.width !== 1024 || im.height !== 1536) throw new Error('Native 1024x1536 clothing inputs required.');
    return im;
  };
  const bytes = await read(root!, { source: 'authoring-sw-v5.json' }), config = southwestClothingReviewSchema.parse(JSON.parse(bytes.toString('utf8')));
  const previous = JSON.parse((await read(root!, config.previous)).toString('utf8')) as { body: z.infer<typeof pin>; quality: { front: z.infer<typeof pin>; rear: z.infer<typeof pin>; hairReference: z.infer<typeof pin> } };
  const accepted = z.object({ direction: z.literal('SW'), currentStudyFitApproved: z.literal(true), configuration: z.literal('authoring-sw-v4.json'), configurationSha256: hash, decision: z.literal('approved-independent-sw-body-study-and-head-hair-contours'), bareSha256: hash, fitSha256: hash }).parse(JSON.parse((await read(root!, config.previousApproval)).toString('utf8')));
  if (accepted.configurationSha256 !== config.previous.sourceSha256 || JSON.stringify(config.originalBody) !== JSON.stringify(previous.body) || JSON.stringify(config.reference) !== JSON.stringify(previous.quality.hairReference) || JSON.stringify(config.front) !== JSON.stringify(previous.quality.front) || JSON.stringify(config.rear) !== JSON.stringify(previous.quality.rear)) throw new Error('Clothing correction must preserve the exact approved SW revision-4 body and hair selection.');
  const [original, body, mask, front, rear, reference, guide] = await Promise.all([load(root!, config.originalBody), load(root!, config.body), load(root!, config.selection), load(root!, config.front), load(root!, config.rear), load(refs!, config.reference), load(root!, config.guide)]);
  await read(root!, config.provenance); await load(root!, config.study); await load(root!, config.colourReference);
  const expected = recolourSouthwestClothing(original!, JSON.parse((await read(root!, config.settings)).toString('utf8')));
  if (body!.data.some((v, i) => v !== expected.body.data[i]) || mask!.data.some((v, i) => v !== expected.mask.data[i])) throw new Error('SW clothing must retain native fabric-only tone transfer and exact source alpha.');
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-sw-clothing-'));
  try {
    const baseline = await prepareFrontDiagonalBodyReview({ ...options, sourceDirectory: root!, assetDirectory: assets!, referenceDirectory: refs!, outputDirectory: temporary, configFile: 'authoring-sw-v4.json' });
    if (baseline.configSha256 !== accepted.configurationSha256 || baseline.bareSha256 !== accepted.bareSha256 || baseline.fitSha256 !== accepted.fitSha256 || sha256(encodePng(guide!)) !== accepted.bareSha256) throw new Error('Clothing correction requires the actual approved SW anatomy and layered guide.');
    const baselineAnatomy = decodePng(await readFile(resolve(temporary, 'fit/SW-anatomy.png'))), baselineFit = decodePng(await readFile(resolve(temporary, 'fit/SW.png')));
    const anatomy = { ...baselineAnatomy, data: baselineAnatomy.data.slice() }, fit = { ...baselineFit, data: baselineFit.data.slice() };
    const composeGarment = (selectedBody: RgbaImage) => {
      const image = blankImage(1024, 1536), planes = new Map<RenderPlane, RgbaImage>([['body-torso', selectedBody], ['hair-front', front!], ['hair-rear', rear!]]);
      for (const plane of DIRECTION_PLANE_ORDER.SW) { const layer = planes.get(plane); if (layer) drawRgba(image, layer, 0, 0); }
      return image;
    };
    const originalGarment = composeGarment(original!), newGarment = composeGarment(body!);
    const outsideClothingHash = (image: RgbaImage) => {
      const data = image.data.slice();
      for (let p = 0; p < data.length; p += 4) if (mask!.data[p + 3]) data.fill(0, p, p + 4);
      return sha256(data);
    };
    let changedFitPixels = 0;
    for (let p = 0; p < mask!.data.length; p += 4) {
      if (body!.data[p + 3] !== original!.data[p + 3]) throw new Error('SW clothing cannot change source alpha.');
      if (!mask!.data[p + 3]) continue;
      for (let c = 0; c < 4; c++) if (baselineAnatomy.data[p + c] !== original!.data[p + c] || baselineFit.data[p + c] !== originalGarment.data[p + c]) throw new Error('Clothing selection must contain only the original body and its actual retained hair planes.');
      anatomy.data.set(body!.data.subarray(p, p + 4), p); fit.data.set(newGarment.data.subarray(p, p + 4), p);
      if (fit.data.subarray(p, p + 3).some((v, c) => v !== baselineFit.data[p + c])) changedFitPixels++;
    }
    const overview = blankImage(3072, 1536);
    for (const [column, image] of [reference!, anatomy, fit].entries()) drawRgba(overview, checkerPreview(image, 'SW'), column * 1024, 0);
    const crop = (image: RgbaImage, x: number, y: number, width: number, height: number) => {
      const result = blankImage(width, height);
      for (let row = 0; row < height; row++) result.data.set(image.data.subarray(((y + row) * 1024 + x) * 4, ((y + row) * 1024 + x + width) * 4), row * width * 4);
      return result;
    };
    const comparison = blankImage(600, 860);
    for (const [row, images] of [[baselineAnatomy, anatomy], [baselineFit, fit]].entries()) for (const [column, image] of images.entries()) drawRgba(comparison, checkerPreview(crop(image, 315, 290, 300, 430), 'SW'), column * 300, row * 430);
    const join = blankImage(1200, 170);
    for (const [column, image] of [reference!, anatomy, fit].entries()) drawRgba(join, checkerPreview(crop(image, 312, 270, 400, 170), 'SW'), column * 400, 0);
    const pending = [{ path: 'fit/SW-anatomy.png', bytes: encodePng(anatomy) }, { path: 'fit/SW.png', bytes: encodePng(fit) }, { path: 'overview.png', bytes: encodePng(overview) }, { path: 'inspection/SW-clothing-comparison.png', bytes: encodePng(comparison) }, { path: 'inspection/SW-neck-shoulder-comparison.png', bytes: encodePng(join) }, { path: 'inspection/SW-hand-alpha-comparison.png', bytes: await readFile(resolve(temporary, 'inspection/SW-hand-alpha-comparison.png')) }];
    const report = { ...baseline, assetVersion: 5, configuration: 'authoring-sw-v5.json', configSha256: sha256(bytes), status: config.status, bareSha256: sha256(encodePng(anatomy)), fitSha256: sha256(encodePng(fit)), baselineConfigSha256: accepted.configurationSha256, baselineBareSha256: accepted.bareSha256, baselineFitSha256: accepted.fitSha256, baselineOutsideClothingFitSha256: outsideClothingHash(baselineFit), baselineOutsideClothingBareSha256: outsideClothingHash(baselineAnatomy), clothingMeasurements: { ...expected.measurements, changedFitPixels, otherBodyPixelsPreserved: true, headEyesHairPreserved: true }, knownReviewIssues: config.knownReviewIssues, clothingComparisonColumns: ['approved SW revision 4', 'lighter cool-grey fabric candidate'], outputs: pending.map(p => ({ path: p.path, sha256: sha256(p.bytes) })) };
    const files = [...pending, { path: 'metadata.json', bytes: Buffer.from(JSON.stringify(report, null, 2) + '\n') }];
    for (const file of files) for (let p = resolve(out, file.path); inside(out, p); p = dirname(p)) {
      try { if ((await lstat(p)).isSymbolicLink()) throw new Error('Clothing output symlinks forbidden.'); }
      catch (e) { if (!missing(e)) throw e; }
      if (p === out) break;
    }
    for (const [path, digest] of inputs) if (sha256(await readFile(path)) !== digest) throw new Error('Clothing input changed during review.');
    for (const file of files) { const path = resolve(out, file.path); await mkdir(dirname(path), { recursive: true }); await writeFile(path, file.bytes); }
    return report;
  } finally { await rm(temporary, { recursive: true, force: true }); }
}
