import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { z } from 'zod';
import { assetSourceSchema, DIRECTIONS, DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { RenderPlane } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { checkerPreview } from './inspection';
import { prepareHeadReview } from './head-review';
import { headFrontDiagonalsRepairSchema } from './head-review-schema';
import { hairReviewSchema } from './hair-review-schema';
import { diagonalFaceGeometry, diagonalEyeCheekTrim } from './face-diagonal-geometry';
import { sha256 } from './reference-import';

const directions = ['SE', 'SW'] as const, names = ['rightEye', 'leftEye', 'rightBrow', 'leftBrow', 'mouth'] as const;
const hash = z.string().regex(/^[a-f0-9]{64}$/), pin = z.strictObject({ source: assetSourceSchema, sourceSha256: hash });
const part = pin.extend({ selection: pin, plane: z.enum(['eyes', 'eyebrows', 'mouth']), side: z.enum(['right', 'left', 'center']), owner: z.literal('reference'), pixelCount: z.number().int().positive(), origin: z.strictObject({ x: z.number().int(), y: z.number().int() }) });
const frame = z.strictObject({ reference: pin, features: z.strictObject({ rightEye: part, leftEye: part, rightBrow: part, leftBrow: part, mouth: part }) });
const diagonalFaceBaseSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('face.reference.v1'), scope: z.literal('front-diagonals'), target: z.literal('detailed'), nativeSize: z.strictObject({ width: z.literal(1024), height: z.literal(1536) }),
  sourcePose: z.literal('standing-reference'), intendedRuntimePose: z.literal('tpose'), published: z.literal(false), paletteReady: z.literal(false), status: z.literal('draft-needs-human-review'),
  headConfig: pin.extend({ source: z.literal('front-diagonals-authoring-v4.json') }), headApproval: pin.extend({ source: z.literal('front-diagonals-review-fit-v4.json') }),
  frames: z.strictObject({ SE: frame, SW: frame }), knownReviewIssues: z.array(z.string().min(1)).min(1),
});
export const diagonalFaceReviewSchema = z.discriminatedUnion('assetVersion', [
  diagonalFaceBaseSchema.extend({ assetVersion: z.literal(1), settings: pin.extend({ source: z.literal('selections.json') }) }),
  diagonalFaceBaseSchema.extend({ assetVersion: z.literal(2), settings: pin.extend({ source: z.literal('selections-v2.json') }), previous: pin.extend({ source: z.literal('authoring.json') }) }),
]);
const inside = (parent: string, child: string) => { const p = relative(parent, child); return p === '' || (!p.startsWith('..') && !isAbsolute(p)); };
const contains = (x: number, y: number, polygon: readonly (readonly [number, number])[]) => { let selected = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a]!, [bx, by] = polygon[b]!; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) selected = !selected; } return selected; };
const crop = (image: RgbaImage) => { const out = blankImage(384, 440); for (let y = 0; y < 440; y++) out.data.set(image.data.subarray(((y + 40) * 1024 + 320) * 4, ((y + 40) * 1024 + 704) * 4), y * 384 * 4); return out; };
const faceCropRegions = { SE: { x: 490, y: 135, width: 145, height: 135 }, SW: { x: 390, y: 150, width: 150, height: 145 } } as const;
const faceComparison = (direction: 'SE' | 'SW', images: readonly RgbaImage[]) => {
  const r = faceCropRegions[direction], scale = 4, out = blankImage(r.width * scale * images.length, r.height * scale);
  for (const [column, image] of images.entries()) for (let y = 0; y < out.height; y++) for (let x = 0; x < r.width * scale; x++) {
    const i = ((r.y + Math.floor(y / scale)) * 1024 + r.x + Math.floor(x / scale)) * 4, j = (y * out.width + column * r.width * scale + x) * 4, alpha = image.data[i + 3]! / 255, checker = (Math.floor(x / 32) + Math.floor(y / 32)) % 2 ? 195 : 235;
    for (let c = 0; c < 3; c++) out.data[j + c] = Math.round(image.data[i + c]! * alpha + checker * (1 - alpha)); out.data[j + 3] = 255;
  }
  return out;
};
export interface DiagonalFaceReviewOptions { readonly sourceDirectory: string; readonly headDirectory: string; readonly hairDirectory: string; readonly referenceDirectory: string; readonly outputDirectory: string; readonly configFile?: 'authoring.json' | 'authoring-v2.json'; }
/** Independent native diagonal features over approved anatomy; never publishes runtime assets. */
export async function prepareDiagonalFaceReview(options: DiagonalFaceReviewOptions) {
  const [source, headRoot, hairRoot, refs] = await Promise.all([options.sourceDirectory, options.headDirectory, options.hairDirectory, options.referenceDirectory].map(p => realpath(p)));
  const out = resolve(options.outputDirectory), inputs = new Map<string, string>();
  if ([source!, headRoot!, hairRoot!, refs!].some(p => inside(p, out) || inside(out, p))) throw new Error('Diagonal face output and source/reference directories must be disjoint.');
  for (let ancestor = out;; ancestor = dirname(ancestor)) { try { if (await realpath(ancestor) !== ancestor) throw new Error('Diagonal face output cannot traverse symlinks.'); break; } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; } }
  const read = async (directory: string, item: { source: string; sourceSha256?: string }) => {
    const path = resolve(directory, item.source); if (!inside(directory, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error('Expected a native ordinary file without symlinks.');
    const bytes = await readFile(path), h = sha256(bytes); if (item.sourceSha256 && h !== item.sourceSha256) throw new Error(`${item.source}: source hash changed; create a new revision.`); inputs.set(path, h); return bytes;
  };
  const load = async (directory: string, item: { source: string; sourceSha256?: string }) => { const image = decodePng(await read(directory, item)); if (image.width !== 1024 || image.height !== 1536) throw new Error('Native diagonal RGBA dimensions required; no resampling.'); for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8) image.data.fill(0, i, i + 4); return image; };
  const bytes = await read(source!, { source: options.configFile ?? 'authoring-v2.json' }), config = diagonalFaceReviewSchema.parse(JSON.parse(bytes.toString('utf8')));
  const previous = config.assetVersion === 2 ? diagonalFaceReviewSchema.parse(JSON.parse((await read(source!, config.previous)).toString('utf8'))) : undefined;
  if (previous) {
    if (previous.assetVersion !== 1 || JSON.stringify(previous.headConfig) !== JSON.stringify(config.headConfig) || JSON.stringify(previous.headApproval) !== JSON.stringify(config.headApproval)) throw new Error('Eye cheek trim must retain the revision-1 approved anatomy baseline.');
    const previousSettings = JSON.parse((await read(source!, previous.settings)).toString('utf8'));
    if (previousSettings.schemaVersion !== 1 || previousSettings.method !== 'independent-native-reference-features' || JSON.stringify(previousSettings.frames) !== JSON.stringify(diagonalFaceGeometry)) throw new Error('Previous native facial geometry changed.');
    for (const direction of directions) {
      if (JSON.stringify(config.frames[direction].reference) !== JSON.stringify(previous.frames[direction].reference)) throw new Error('Eye cheek trim must retain both native references.');
      for (const name of names) if (!(direction === 'SE' && name === 'rightEye') && JSON.stringify(config.frames[direction].features[name]) !== JSON.stringify(previous.frames[direction].features[name])) throw new Error('Eye cheek trim must preserve all nine other native features.');
    }
  }
  const headBytes = await read(headRoot!, config.headConfig), head = headFrontDiagonalsRepairSchema.parse(JSON.parse(headBytes.toString('utf8')));
  const approval = z.object({ status: z.literal('approved-standing-reference-fit-candidate'), configSha256: hash, bodyOcclusionVerified: z.literal(false), futureBodyFitObligations: z.array(z.string()), fitMeasurements: z.array(z.object({ direction: z.enum(directions), outputSha256: hash })).length(2) }).parse(JSON.parse((await read(headRoot!, config.headApproval)).toString('utf8')));
  if (approval.configSha256 !== config.headConfig.sourceSha256 || head.assetVersion !== 4) throw new Error('Approved revision-4 diagonal anatomy required.');
  const settings = JSON.parse((await read(source!, config.settings)).toString('utf8'));
  if (settings.schemaVersion !== 1 || settings.method !== 'independent-native-reference-features' || JSON.stringify(settings.frames) !== JSON.stringify(diagonalFaceGeometry)) throw new Error('Independent SE/SW feature geometry changed.');
  if (config.assetVersion === 2 && JSON.stringify(settings.cheekTrim) !== JSON.stringify(diagonalEyeCheekTrim)) throw new Error('Bounded SE lower-lid ownership changed.');
  const pending: { path: string; image: RgbaImage }[] = [], parts = new Map<string, RgbaImage>(), measurements: { direction: 'SE' | 'SW'; name: typeof names[number]; plane: RenderPlane; side: string; pixels: number; foregroundHairOverlapPixels: number }[] = [];
  const references = new Map<string, RgbaImage>();
  let previousEye: RgbaImage | undefined;
  for (const direction of directions) {
    const f = config.frames[direction]; if (f.reference.source !== `${direction}.png` || f.reference.sourceSha256 !== head.frames[direction].referenceSha256) throw new Error('Facing reference ownership cannot be substituted or mirrored.');
    const reference = await load(refs!, f.reference); references.set(direction, reference);
    for (const name of names) {
      const item = f.features[name], plane = name.endsWith('Eye') ? 'eyes' : name.endsWith('Brow') ? 'eyebrows' : 'mouth', side = name.startsWith('right') ? 'right' : name.startsWith('left') ? 'left' : 'center';
      const trimmed = config.assetVersion === 2 && direction === 'SE' && name === 'rightEye', suffix = trimmed ? '-v2' : '';
      if (item.source !== `${direction}-${name}${suffix}.png` || item.selection.source !== `${direction}-${name}-mask${suffix}.png` || item.plane !== plane || item.side !== side || JSON.stringify(item.origin) !== JSON.stringify(head.frames[direction].candidateHeadAnchor)) throw new Error('Native facing, physical side, feature plane or anchor changed.');
      const [image, mask] = await Promise.all([load(source!, item), load(source!, item.selection)]), polygon = diagonalFaceGeometry[direction][name]; let pixels = 0;
      const oldItem = trimmed ? previous!.frames.SE.features.rightEye : undefined, oldMask = oldItem ? await load(source!, oldItem.selection) : undefined;
      if (oldItem) previousEye = await load(source!, oldItem);
      const xs = polygon.map(p => p[0]), ys = polygon.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      for (let p = 0; p < 1024 * 1536; p++) { const i = p * 4, x = p % 1024, y = Math.floor(p / 1024), selected = x >= x0 && x <= x1 && y >= y0 && y <= y1 && contains(x + .5, y + .5, polygon);
        let coverage = selected ? 255 : 0;
        if (trimmed && selected) {
          let samples = 0; for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (contains(x + (sx + .5) / 4, y + (sy + .5) / 4, diagonalEyeCheekTrim.polygon)) samples++;
          coverage = Math.round(samples * 255 / 16);
        }
        const alpha = Math.round(reference.data[i + 3]! * coverage / 255);
        if (mask.data.subarray(i, i + 4).some(v => v !== coverage) || image.data.subarray(i, i + 4).some((v, c) => v !== (alpha >= 8 ? c === 3 ? alpha : reference.data[i + c] : 0))) throw new Error(`${direction}-${name}: layer/mask must retain only its own native reference pixels.`);
        if (oldMask && (oldMask.data.subarray(i, i + 4).some(v => v !== (selected ? 255 : 0)) || previousEye!.data.subarray(i, i + 4).some((v, c) => v !== (selected ? reference.data[i + c] : 0)))) throw new Error('Previous SE eye must preserve its native revision-1 ownership.');
        if (image.data[i + 3]! >= 8) pixels++;
      }
      if (pixels !== item.pixelCount) throw new Error('Native feature coverage changed.'); parts.set(`${direction}-${name}`, image);
      measurements.push({ direction, name, plane, side, pixels, foregroundHairOverlapPixels: 0 }); pending.push({ path: `layers/${direction}-${name}.png`, image }, { path: `masks/${direction}-${name}.png`, image: mask });
    }
  }
  const temporary = await mkdtemp(resolve(tmpdir(), 'diagonal-face-review-'));
  try {
    const baseline = await prepareHeadReview({ sourceDirectory: headRoot!, hairDirectory: hairRoot!, referenceDirectory: refs!, outputDirectory: resolve(temporary, 'head'), configSource: 'front-diagonals-authoring-v4.json' });
    const hair = hairReviewSchema.parse(JSON.parse((await read(hairRoot!, head.hairConfig)).toString('utf8')));
    if (!('SE' in hair.frames)) throw new Error('Approved hair must include independently authored SE geometry.');
    const fitMeasurements: { direction: 'SE' | 'SW'; baselineSha256: string; outputSha256: string; bareSha256: string }[] = [], overview = blankImage(1152, 880);
    for (const [row, direction] of directions.entries()) {
      const stage = async (path: string) => decodePng(await readFile(resolve(temporary, 'head', path)));
      const headImage = await stage(`layers/${direction}-head.png`), neck = await stage(`layers/${direction}-neck.png`), front = await stage(`layers/${direction}-front-fit.png`), rear = direction === 'SW' ? await stage('layers/SW-rear-fit.png') : await load(hairRoot!, hair.frames.SE!.rear);
      const compose = (features: boolean, withHair: boolean, oldEye?: RgbaImage) => { const image = blankImage(1024, 1536), planes = new Map<RenderPlane, RgbaImage[]>([['head', [headImage]], ['neck', [neck]]]); if (withHair) { planes.set('hair-front', [front]); planes.set('hair-rear', [rear]); }
        if (features) for (const name of names) { const plane = config.frames[direction].features[name].plane, layer = direction === 'SE' && name === 'rightEye' && oldEye ? oldEye : parts.get(`${direction}-${name}`)!; planes.set(plane, [...planes.get(plane) ?? [], layer]); }
        for (const plane of DIRECTION_PLANE_ORDER[direction]) for (const layer of planes.get(plane) ?? []) drawRgba(image, layer, 0, 0); return image;
      };
      const previous = compose(false, true), fit = compose(true, true), bare = compose(true, false), previousHash = sha256(encodePng(previous));
      if (previousHash !== approval.fitMeasurements.find(m => m.direction === direction)!.outputSha256 || previousHash !== baseline.fitMeasurements.find(m => m.direction === direction)!.outputSha256) throw new Error('Actual approved diagonal composition changed.');
      for (const m of measurements.filter(m => m.direction === direction)) { const image = parts.get(`${direction}-${m.name}`)!; for (let i = 3; i < image.data.length; i += 4) if (image.data[i]! >= 8 && front.data[i]! >= 8) m.foregroundHairOverlapPixels++; }
      fitMeasurements.push({ direction, baselineSha256: previousHash, outputSha256: sha256(encodePng(fit)), bareSha256: sha256(encodePng(bare)) });
      for (const [column, image] of [references.get(direction)!, previous, fit].entries()) drawRgba(overview, checkerPreview(crop(image), direction), column * 384, row * 440);
      pending.push({ path: `inspection/${direction}-face-fit-comparison.png`, image: faceComparison(direction, [references.get(direction)!, previous, fit]) }, { path: `fit/${direction}.png`, image: fit }, { path: `fit/${direction}-bare.png`, image: bare }, { path: `fit/${direction}-approved-baseline.png`, image: previous }, { path: `layers/${direction}-head.png`, image: headImage }, { path: `layers/${direction}-neck.png`, image: neck }, { path: `layers/${direction}-front-hair.png`, image: front }, { path: `layers/${direction}-rear-hair.png`, image: rear });
      if (direction === 'SE' && previousEye) pending.push({ path: 'inspection/SE-cheek-fit-comparison.png', image: faceComparison(direction, [references.get(direction)!, compose(true, true, previousEye), fit]) });
    }
    pending.push({ path: 'overview.png', image: overview });
    const report = { schemaVersion: 1, id: config.id, scope: config.scope, assetVersion: config.assetVersion, configSha256: sha256(bytes), status: config.status, published: false, anatomyApproved: false, paletteReady: false, supportedReviewDirections: directions, missingDirections: DIRECTIONS.filter(d => !new Set<string>(directions).has(d)), nativePosition: { x: 0, y: 0 }, comparisonColumns: ['reference', 'approved-revision-4-head-hair', `native-facial-candidate-v${config.assetVersion}`], ...(previousEye ? { cheekComparisonColumns: ['reference', 'revision-1', 'revision-2'] } : {}), inspectionCrops: faceCropRegions, inspectionMagnification: 4, fitMeasurements, measurements, bodyOcclusionVerified: false, futureBodyFitObligations: approval.futureBodyFitObligations, knownReviewIssues: config.knownReviewIssues, outputs: pending.map(p => ({ path: p.path, sha256: sha256(encodePng(p.image)) })), reviewRequired: ['Actual native eye/brow/mouth placement and source ownership', 'Local skin rims and existing fringe occlusion', 'Concealed feature surfaces, independent expressions and materials', 'Other facings, body/clothing, production T-pose, independent pixel artwork and final Step 6C'] };
    for (const p of [...pending.map(p => ({ path: p.path, bytes: encodePng(p.image) })), { path: 'metadata.json', bytes: Buffer.from(JSON.stringify(report, null, 2) + '\n') }]) { const destination = resolve(out, p.path); for (let parent = destination; inside(out, parent); parent = dirname(parent)) { try { if ((await lstat(parent)).isSymbolicLink()) throw new Error('Diagonal face output symlinks are forbidden.'); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; } if (parent === out) break; } await mkdir(dirname(destination), { recursive: true }); await writeFile(destination, p.bytes); }
    for (const [path, before] of inputs) if (sha256(await readFile(path)) !== before) throw new Error('Source changed during diagonal face review.');
    return report;
  } finally { await rm(temporary, { recursive: true, force: true }); }
}
