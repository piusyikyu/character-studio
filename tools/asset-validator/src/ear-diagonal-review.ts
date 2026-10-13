import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { z } from 'zod';
import { assetSourceSchema, DIRECTIONS, DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { RenderPlane } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { checkerPreview } from './inspection';
import { prepareDiagonalFaceReview, diagonalFaceReviewSchema } from './face-diagonal-review';
import { headFrontDiagonalsRepairSchema } from './head-review-schema';
import { sha256 } from './reference-import';

const directions = ['SE', 'SW'] as const, hash = z.string().regex(/^[a-f0-9]{64}$/), pin = z.strictObject({ source: assetSourceSchema, sourceSha256: hash });
const point = z.strictObject({ x: z.number().int(), y: z.number().int() }), region = z.array(z.tuple([z.number().int(), z.number().int()])).length(4);
const frame = z.strictObject({ side: z.enum(['right', 'left']), hiddenEar: z.enum(['right', 'left']), region, origin: point, originalHead: pin, study: pin, skinContour: z.array(z.tuple([z.number().int(), z.number().int()])).min(3), skinSelection: pin, head: pin, headRetention: pin, ear: pin.extend({ selection: pin, pixelCount: z.number().int().positive() }), authoredRootPixels: z.number().int().positive() });
export const diagonalEarRegions = { SE: [[472,135],[514,135],[514,207],[472,207]], SW: [[503,144],[550,144],[550,220],[503,220]] } as const;
export const diagonalEarSkinContours = { SE: [[478,135],[514,135],[514,207],[502,207],[498,194],[492,180],[486,166],[481,150]], SW: [[503,144],[541,144],[539,154],[534,169],[526,186],[520,203],[514,220],[503,220]] } as const;
export const diagonalEarReviewSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('ears.human.v1'), scope: z.literal('front-diagonals'), assetVersion: z.literal(1), target: z.literal('detailed'), nativeSize: z.strictObject({ width: z.literal(1024), height: z.literal(1536) }), sourcePose: z.literal('standing-reference'), intendedRuntimePose: z.literal('tpose'), status: z.literal('draft-needs-human-review'), published: z.literal(false), paletteReady: z.literal(false), minimumVisibleAlpha: z.literal(8),
  method: z.literal('native-ear-patches/authored-root-rgba/variant-retention'), faceConfig: pin.extend({ source: z.literal('authoring-v2.json') }), faceApproval: pin.extend({ source: z.literal('review-fit-v2.json') }), headConfig: pin.extend({ source: z.literal('front-diagonals-authoring-v4.json') }), settings: pin.extend({ source: z.literal('selections.json') }), prompts: pin.extend({ source: z.literal('prompts.json') }), frames: z.strictObject({ SE: frame, SW: frame }), knownReviewIssues: z.array(z.string().min(1)).min(1),
});
const inside = (parent: string, child: string) => { const p = relative(parent, child); return p === '' || (!p.startsWith('..') && !isAbsolute(p)); };
const contains = (x: number, y: number, polygon: readonly (readonly [number, number])[]) => { let selected = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a]!, [bx, by] = polygon[b]!; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) selected = !selected; } return selected; };
const crop = (image: RgbaImage) => { const out = blankImage(384, 440); for (let y = 0; y < 440; y++) out.data.set(image.data.subarray(((y + 40) * 1024 + 320) * 4, ((y + 40) * 1024 + 704) * 4), y * 384 * 4); return out; };
const roots = { SE: { x: 465, y: 125, width: 65, height: 95 }, SW: { x: 495, y: 135, width: 65, height: 95 } } as const;
const rootComparison = (direction: 'SE' | 'SW', images: readonly RgbaImage[]) => {
  const r = roots[direction], scale = 6, out = blankImage(r.width * scale * images.length, r.height * scale);
  for (const [column, image] of images.entries()) for (let y = 0; y < out.height; y++) for (let x = 0; x < r.width * scale; x++) {
    const i = ((r.y + Math.floor(y / scale)) * 1024 + r.x + Math.floor(x / scale)) * 4, j = (y * out.width + column * r.width * scale + x) * 4, alpha = image.data[i + 3]! / 255, checker = (Math.floor(x / 36) + Math.floor(y / 36)) % 2 ? 195 : 235;
    for (let c = 0; c < 3; c++) out.data[j + c] = Math.round(image.data[i + c]! * alpha + checker * (1 - alpha)); out.data[j + 3] = 255;
  }
  return out;
};
export interface DiagonalEarReviewOptions { readonly sourceDirectory: string; readonly headDirectory: string; readonly faceDirectory: string; readonly hairDirectory: string; readonly referenceDirectory: string; readonly outputDirectory: string; }
/** Bounded authored root skin with exact native human-ear reconstruction, outside the runtime catalog. */
export async function prepareDiagonalEarReview(options: DiagonalEarReviewOptions) {
  const [source, headRoot, faceRoot, hairRoot, refs] = await Promise.all([options.sourceDirectory, options.headDirectory, options.faceDirectory, options.hairDirectory, options.referenceDirectory].map(p => realpath(p)));
  const out = resolve(options.outputDirectory), inputs = new Map<string, string>();
  if ([source!, headRoot!, faceRoot!, hairRoot!, refs!].some(p => inside(p, out) || inside(out, p))) throw new Error('Diagonal ear output and inputs must be disjoint.');
  for (let ancestor = out;; ancestor = dirname(ancestor)) { try { if (await realpath(ancestor) !== ancestor) throw new Error('Diagonal ear output cannot traverse symlinks.'); break; } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; } }
  const read = async (directory: string, item: { source: string; sourceSha256?: string }) => {
    const path = resolve(directory, item.source); if (!inside(directory, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error('Expected an ordinary native input without symlinks.');
    const bytes = await readFile(path), h = sha256(bytes); if (item.sourceSha256 && h !== item.sourceSha256) throw new Error(`${item.source}: pinned source changed; create a new revision.`); inputs.set(path, h); return bytes;
  };
  const load = async (directory: string, item: { source: string; sourceSha256?: string }) => { const image = decodePng(await read(directory, item)); if (image.width !== 1024 || image.height !== 1536) throw new Error('Native 1024x1536 diagonal inputs required; no transforms.'); for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8) image.data.fill(0, i, i + 4); return image; };
  const bytes = await read(source!, { source: 'authoring.json' }), config = diagonalEarReviewSchema.parse(JSON.parse(bytes.toString('utf8'))), faceBytes = await read(faceRoot!, config.faceConfig), face = diagonalFaceReviewSchema.parse(JSON.parse(faceBytes.toString('utf8')));
  const approval = z.object({ decision: z.literal('approved-standing-reference-fit'), configSha256: hash, futureBodyFitObligations: z.array(z.string()), fitMeasurements: z.array(z.object({ direction: z.enum(directions), outputSha256: hash })).length(2) }).parse(JSON.parse((await read(faceRoot!, config.faceApproval)).toString('utf8')));
  if (approval.configSha256 !== sha256(faceBytes) || JSON.stringify(config.headConfig) !== JSON.stringify(face.headConfig)) throw new Error('Approved diagonal facial/anatomy baseline required.');
  const head = headFrontDiagonalsRepairSchema.parse(JSON.parse((await read(headRoot!, config.headConfig)).toString('utf8')));
  const settings = JSON.parse((await read(source!, config.settings)).toString('utf8')), prompts = JSON.parse((await read(source!, config.prompts)).toString('utf8'));
  if (settings.method !== config.method || JSON.stringify(settings.regions) !== JSON.stringify(diagonalEarRegions) || JSON.stringify(settings.skinContours) !== JSON.stringify(diagonalEarSkinContours)) throw new Error('Independent diagonal ear windows changed.');
  const pending: { path: string; image: RgbaImage }[] = [], parts = new Map<string, { original: RgbaImage; underlay: RgbaImage; masked: RgbaImage; ear: RgbaImage; reconstructed: RgbaImage }>(), measurements: { direction: 'SE' | 'SW'; side: string; earPixels: number; authoredRootPixels: number; changedRootPixels: number; origin: { x: number; y: number } }[] = [];
  for (const direction of directions) {
    const f = config.frames[direction], side = direction === 'SE' ? 'right' : 'left';
    if (f.hiddenEar !== (side === 'right' ? 'left' : 'right') || f.side !== side || JSON.stringify(f.region) !== JSON.stringify(diagonalEarRegions[direction]) || JSON.stringify(f.origin) !== JSON.stringify(head.frames[direction].candidateHeadAnchor) || f.originalHead.source !== head.frames[direction].head.source || f.originalHead.sourceSha256 !== head.frames[direction].head.sourceSha256 || f.ear.source !== `${direction}-${side}-ear-v1.png` || f.ear.selection.source !== `${direction}-ear-selection-v1.png` || f.head.source !== `${direction}-head-underlay-v1.png` || f.headRetention.source !== `${direction}-human-head-retention-v1.png` || f.study.source !== `inputs/${direction}-earless-study-v1.png`) throw new Error('Native diagonal ear side, geometry, source or anchor changed.');
    const prompt = prompts.selected?.[direction]; if (!prompt || prompt.output !== f.study.source || prompt.sourceSha256 !== f.study.sourceSha256 || prompt.inputs?.length !== 1 || prompt.inputs[0].source !== `inputs/${direction}-earless-guide.png`) throw new Error('Each diagonal root needs its own pinned study and native guide.');
    if (JSON.stringify(f.skinContour) !== JSON.stringify(diagonalEarSkinContours[direction]) || f.skinSelection.source !== `${direction}-skin-selection-v1.png`) throw new Error('Independent interior root ownership changed.');
    const [original, underlay, ear, selection, retention, study, guide, skinMask] = await Promise.all([load(headRoot!, f.originalHead), load(source!, f.head), load(source!, f.ear), load(source!, f.ear.selection), load(source!, f.headRetention), load(source!, f.study), load(source!, prompt.inputs[0]), load(source!, f.skinSelection)]);
    if (sha256(guide.data) !== sha256(original.data)) throw new Error('Diagonal guide must retain its own accepted native head.');
    const rootLandmark = direction === 'SE' ? { x: 498, y: 170 } : { x: 522, y: 176 };
    if (study.data[(rootLandmark.y * 1024 + rootLandmark.x) * 4 + 3]! < 8) throw new Error('Root study lacks skin at its native attachment.');
    const masked = { ...underlay, data: underlay.data.slice() }, [[x0, y0], , [x1, y1]] = diagonalEarRegions[direction]; let earPixels = 0, authoredRootPixels = 0, changedRootPixels = 0;
    for (let p = 0; p < 1024 * 1536; p++) {
      const i = p * 4, x = p % 1024, y = Math.floor(p / 1024), selected = x >= x0 && x < x1 && y >= y0 && y < y1, authored = selected;
      let samples = 0; if (selected) for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (contains(x + (sx + .5) / 4, y + (sy + .5) / 4, diagonalEarSkinContours[direction])) samples++;
      const coverage = Math.round(samples * 255 / 16), alpha = Math.round(study.data[i + 3]! * coverage / 255);
      if (selection.data.subarray(i, i + 4).some(v => v !== (selected ? 255 : 0)) || retention.data.subarray(i, i + 4).some(v => v !== (selected ? 0 : 255))) throw new Error('Diagonal ear masks must retain their native local window.');
      if (ear.data.subarray(i, i + 4).some((v, c) => v !== (selected ? original.data[i + c] : 0))) throw new Error(`${direction}: ear must retain exact original native RGBA.`);
      if (skinMask.data.subarray(i, i + 4).some(v => v !== coverage)) throw new Error('Root mask must select only its independently traced interior skin.');
      if (underlay.data.subarray(i, i + 4).some((v, c) => v !== (authored ? alpha >= 8 ? c === 3 ? alpha : study.data[i + c] : 0 : original.data[i + c]))) throw new Error(`${direction}: root underlay must preserve bounded native RGBA ownership.`);
      if (selected) { masked.data.fill(0, i, i + 4); if (ear.data[i + 3]! >= 8) earPixels++; }
      if (coverage > 0 && alpha >= 8) authoredRootPixels++; if (underlay.data.subarray(i, i + 4).some((v, c) => v !== original.data[i + c])) changedRootPixels++;
    }
    if (earPixels !== f.ear.pixelCount || authoredRootPixels !== f.authoredRootPixels || !changedRootPixels) throw new Error('Native ear/root coverage changed or concealed skin was not authored.');
    const reconstructed = blankImage(1024, 1536); drawRgba(reconstructed, masked, 0, 0); drawRgba(reconstructed, ear, 0, 0);
    if (sha256(reconstructed.data) !== sha256(original.data)) throw new Error('Profile human head must reconstruct exact native RGBA, including partial alpha.');
    parts.set(direction, { original, underlay, masked, ear, reconstructed }); measurements.push({ direction, side, earPixels, authoredRootPixels, changedRootPixels, origin: f.origin });
    pending.push({ path: `layers/${direction}-head-underlay.png`, image: underlay }, { path: `layers/${direction}-${side}-ear.png`, image: ear }, { path: `masks/${direction}-human-head-retention.png`, image: retention }, { path: `masks/${direction}-ear-selection.png`, image: selection }, { path: `masks/${direction}-skin-selection.png`, image: skinMask }, { path: `assembled/${direction}-head-human.png`, image: reconstructed });
  }
  const temporary = await mkdtemp(resolve(tmpdir(), 'diagonal-ear-review-'));
  try {
    const baseline = await prepareDiagonalFaceReview({ sourceDirectory: faceRoot!, configFile: config.faceConfig.source, headDirectory: headRoot!, hairDirectory: hairRoot!, referenceDirectory: refs!, outputDirectory: resolve(temporary, 'face') });
    const overview = blankImage(1152, 880), anatomy = blankImage(1536, 880), fitMeasurements: { direction: 'SE' | 'SW'; approvedSha256: string; humanFitSha256: string; earlessFitSha256: string }[] = [];
    for (const [row, direction] of directions.entries()) {
      const f = parts.get(direction)!, stage = async (path: string) => decodePng(await readFile(resolve(temporary, 'face', path))), front = await stage(`layers/${direction}-front-hair.png`), rear = await stage(`layers/${direction}-rear-hair.png`), neck = await stage(`layers/${direction}-neck.png`), reference = await load(refs!, face.frames[direction].reference);
      const facialLayers: [RenderPlane, RgbaImage][] = []; for (const item of Object.values(face.frames[direction].features)) facialLayers.push([item.plane, await load(faceRoot!, item)]);
      const compose = (headImage: RgbaImage, ears?: RgbaImage, withHair = true, withFace = true) => {
        const image = blankImage(1024, 1536), planes = new Map<RenderPlane, RgbaImage[]>([['head', [headImage]], ['neck', [neck]]]); if (ears) planes.set('ears', [ears]); if (withHair) { planes.set('hair-front', [front]); planes.set('hair-rear', [rear]); } if (withFace) for (const [plane, layer] of facialLayers) planes.set(plane, [...planes.get(plane) ?? [], layer]); for (const plane of DIRECTION_PLANE_ORDER[direction]) for (const layer of planes.get(plane) ?? []) drawRgba(image, layer, 0, 0); return image;
      };
      const accepted = compose(f.original), human = compose(f.masked, f.ear), earless = compose(f.underlay), approvedHash = sha256(encodePng(accepted));
      if (approvedHash !== approval.fitMeasurements.find(m => m.direction === direction)!.outputSha256 || approvedHash !== baseline.fitMeasurements.find(m => m.direction === direction)!.outputSha256 || sha256(encodePng(human)) !== approvedHash || sha256(encodePng(earless)) === approvedHash) throw new Error('Separate ears must retain the actual approved diagonal facial/hair fit and distinguish ear-free roots.');
      fitMeasurements.push({ direction, approvedSha256: approvedHash, humanFitSha256: sha256(encodePng(human)), earlessFitSha256: sha256(encodePng(earless)) });
      for (const [column, image] of [reference, accepted, human].entries()) drawRgba(overview, checkerPreview(crop(image), direction), column * 384, row * 440);
      for (const [column, image] of [compose(f.original, undefined, false, false), compose(f.underlay, undefined, false, false), f.ear, compose(f.masked, f.ear, false, false)].entries()) drawRgba(anatomy, checkerPreview(crop(image), direction), column * 384, row * 440);
      pending.push({ path: `fit/${direction}-human.png`, image: human }, { path: `fit/${direction}-earless.png`, image: earless }, { path: `inspection/${direction}-root-comparison.png`, image: rootComparison(direction, [f.original, f.underlay, f.ear, f.reconstructed]) }, { path: `layers/${direction}-neck.png`, image: neck }, { path: `layers/${direction}-front-hair.png`, image: front }, { path: `layers/${direction}-rear-hair.png`, image: rear });
    }
    pending.push({ path: 'overview.png', image: overview }, { path: 'anatomy-overview.png', image: anatomy });
    const report = { schemaVersion: 1, id: config.id, scope: config.scope, assetVersion: config.assetVersion, configSha256: sha256(bytes), status: config.status, published: false, anatomyApproved: false, paletteReady: false, bodyOcclusionVerified: false, supportedReviewDirections: directions, missingDirections: DIRECTIONS.filter(d => !new Set<string>(directions).has(d)), nativePosition: { x: 0, y: 0 }, humanAssemblyMatchesApprovedHead: true, humanFitMatchesApprovedFacialFit: true, originalRgbaPreservedOutsideEarWindows: true, hiddenEars: { SE: config.frames.SE.hiddenEar, SW: config.frames.SW.hiddenEar }, futureBodyFitObligations: approval.futureBodyFitObligations, comparisonColumns: ['reference', 'approved-front-diagonal-facial-fit', 'separate-human-ear-fit'], anatomyColumns: ['approved-skin', 'ear-free-root-underlay', 'original-ear-and-collar', 'reconstructed-human-skin'], rootCrops: roots, rootMagnification: 6, measurements, fitMeasurements, knownReviewIssues: config.knownReviewIssues, outputs: pending.map(p => ({ path: p.path, sha256: sha256(encodePng(p.image)) })), reviewRequired: ['Ear-free root colour, outline and local shade/ownership joins', 'Isolated ear/collar geometry and actual front/rear hair depth', 'Independent other ear facings/variants and concealed surfaces', 'N anatomy, body/clothing occlusion, production T-pose, independent pixel art and final Step 6C'] };
    for (const p of [...pending.map(p => ({ path: p.path, bytes: encodePng(p.image) })), { path: 'metadata.json', bytes: Buffer.from(JSON.stringify(report, null, 2) + '\n') }]) { const destination = resolve(out, p.path); for (let parent = destination; inside(out, parent); parent = dirname(parent)) { try { if ((await lstat(parent)).isSymbolicLink()) throw new Error('Diagonal ear output symlinks are forbidden.'); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; } if (parent === out) break; } await mkdir(dirname(destination), { recursive: true }); await writeFile(destination, p.bytes); }
    for (const [path, before] of inputs) if (sha256(await readFile(path)) !== before) throw new Error('Source changed during diagonal ear review.'); return report;
  } finally { await rm(temporary, { recursive: true, force: true }); }
}
