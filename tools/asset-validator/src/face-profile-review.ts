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
import { headProfilesReviewSchema } from './head-review-schema';
import { profileFaceGeometry } from './face-profile-geometry';
import { sha256 } from './reference-import';

const directions = ['E', 'W'] as const, names = ['eye', 'brow', 'mouth'] as const;
const hash = z.string().regex(/^[a-f0-9]{64}$/), pin = z.strictObject({ source: assetSourceSchema, sourceSha256: hash });
const part = pin.extend({ selection: pin, plane: z.enum(['eyes', 'eyebrows', 'mouth']), side: z.enum(['right', 'left', 'center']), owner: z.literal('reference'), pixelCount: z.number().int().positive(), origin: z.strictObject({ x: z.number().int(), y: z.number().int() }) });
const frame = z.strictObject({ reference: pin, features: z.strictObject({ eye: part, brow: part, mouth: part }) });
export const profileFaceReviewSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('face.reference.v1'), scope: z.literal('profiles'), assetVersion: z.literal(1), target: z.literal('detailed'), nativeSize: z.strictObject({ width: z.literal(1024), height: z.literal(1536) }),
  sourcePose: z.literal('standing-reference'), intendedRuntimePose: z.literal('tpose'), published: z.literal(false), paletteReady: z.literal(false), status: z.literal('draft-needs-human-review'),
  headConfig: pin.extend({ source: z.literal('profiles-authoring-v3.json') }), headApproval: pin.extend({ source: z.literal('profiles-review-fit-v3.json') }), settings: pin.extend({ source: z.literal('selections.json') }),
  frames: z.strictObject({ E: frame.extend({ hiddenFeatures: z.tuple([z.literal('leftEye'), z.literal('leftBrow')]) }), W: frame.extend({ hiddenFeatures: z.tuple([z.literal('rightEye'), z.literal('rightBrow')]) }) }), knownReviewIssues: z.array(z.string().min(1)).min(1),
});
const inside = (parent: string, child: string) => { const p = relative(parent, child); return p === '' || (!p.startsWith('..') && !isAbsolute(p)); };
const contains = (x: number, y: number, polygon: readonly (readonly [number, number])[]) => { let selected = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a]!, [bx, by] = polygon[b]!; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) selected = !selected; } return selected; };
const crop = (image: RgbaImage) => { const out = blankImage(384, 440); for (let y = 0; y < 440; y++) out.data.set(image.data.subarray(((y + 40) * 1024 + 320) * 4, ((y + 40) * 1024 + 704) * 4), y * 384 * 4); return out; };
const faceCropRegions = { E: { x: 500, y: 125, width: 145, height: 170 }, W: { x: 365, y: 135, width: 155, height: 170 } } as const;
const faceComparison = (direction: 'E' | 'W', images: readonly RgbaImage[]) => {
  const r = faceCropRegions[direction], scale = 4, out = blankImage(r.width * scale * images.length, r.height * scale);
  for (const [column, image] of images.entries()) for (let y = 0; y < out.height; y++) for (let x = 0; x < r.width * scale; x++) {
    const i = ((r.y + Math.floor(y / scale)) * 1024 + r.x + Math.floor(x / scale)) * 4, j = (y * out.width + column * r.width * scale + x) * 4, alpha = image.data[i + 3]! / 255, checker = (Math.floor(x / 32) + Math.floor(y / 32)) % 2 ? 195 : 235;
    for (let c = 0; c < 3; c++) out.data[j + c] = Math.round(image.data[i + c]! * alpha + checker * (1 - alpha)); out.data[j + 3] = 255;
  }
  return out;
};
export interface ProfileFaceReviewOptions { readonly sourceDirectory: string; readonly headDirectory: string; readonly hairDirectory: string; readonly referenceDirectory: string; readonly outputDirectory: string; }
/** Independent visible profile features over accepted native anatomy, outside the runtime catalog. */
export async function prepareProfileFaceReview(options: ProfileFaceReviewOptions) {
  const [source, headRoot, hairRoot, refs] = await Promise.all([options.sourceDirectory, options.headDirectory, options.hairDirectory, options.referenceDirectory].map(p => realpath(p)));
  const out = resolve(options.outputDirectory), inputs = new Map<string, string>();
  if ([source!, headRoot!, hairRoot!, refs!].some(p => inside(p, out) || inside(out, p))) throw new Error('Profile face output and source/reference directories must be disjoint.');
  for (let ancestor = out;; ancestor = dirname(ancestor)) { try { if (await realpath(ancestor) !== ancestor) throw new Error('Profile face output cannot traverse symlinks.'); break; } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; } }
  const read = async (directory: string, item: { source: string; sourceSha256?: string }) => {
    const path = resolve(directory, item.source); if (!inside(directory, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error('Expected a native ordinary file without symlinks.');
    const bytes = await readFile(path), h = sha256(bytes); if (item.sourceSha256 && h !== item.sourceSha256) throw new Error(`${item.source}: source hash changed; create a new revision.`); inputs.set(path, h); return bytes;
  };
  const load = async (directory: string, item: { source: string; sourceSha256?: string }) => { const image = decodePng(await read(directory, item)); if (image.width !== 1024 || image.height !== 1536) throw new Error('Native profile RGBA dimensions required; no resampling.'); for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8) image.data.fill(0, i, i + 4); return image; };
  const bytes = await read(source!, { source: 'authoring.json' }), config = profileFaceReviewSchema.parse(JSON.parse(bytes.toString('utf8')));
  const headBytes = await read(headRoot!, config.headConfig), head = headProfilesReviewSchema.parse(JSON.parse(headBytes.toString('utf8')));
  const approval = z.object({ status: z.literal('approved-standing-reference-fit-candidate'), configSha256: hash, fitMeasurements: z.array(z.object({ direction: z.enum(directions), outputSha256: hash })).length(2) }).parse(JSON.parse((await read(headRoot!, config.headApproval)).toString('utf8')));
  if (approval.configSha256 !== config.headConfig.sourceSha256 || head.assetVersion !== 3) throw new Error('Approved revision-3 profile anatomy required.');
  const settings = JSON.parse((await read(source!, config.settings)).toString('utf8'));
  if (settings.schemaVersion !== 1 || settings.method !== 'independent-native-reference-features' || settings.coverageSamples !== 4 || JSON.stringify(settings.frames) !== JSON.stringify(profileFaceGeometry)) throw new Error('Independent E/W native feature geometry changed.');
  const pending: { path: string; image: RgbaImage }[] = [], parts = new Map<string, RgbaImage>(), measurements: { direction: 'E' | 'W'; name: typeof names[number]; plane: RenderPlane; side: string; pixels: number; foregroundHairOverlapPixels: number }[] = [], references = new Map<string, RgbaImage>();
  for (const direction of directions) {
    const f = config.frames[direction]; if (f.reference.source !== `${direction}.png` || f.reference.sourceSha256 !== head.frames[direction].referenceSha256) throw new Error('Facing reference ownership cannot be substituted or mirrored.');
    const reference = await load(refs!, f.reference); references.set(direction, reference);
    for (const name of names) {
      const item = f.features[name], plane = name === 'eye' ? 'eyes' : name === 'brow' ? 'eyebrows' : 'mouth', side = name === 'mouth' ? 'center' : direction === 'E' ? 'right' : 'left', label = name === 'mouth' ? 'mouth' : `${side}${name === 'eye' ? 'Eye' : 'Brow'}`;
      if (item.source !== `${direction}-${label}.png` || item.selection.source !== `${direction}-${label}-mask.png` || item.plane !== plane || item.side !== side || JSON.stringify(item.origin) !== JSON.stringify(head.frames[direction].candidateHeadAnchor)) throw new Error('Native profile facing, physical side, feature plane or anchor changed.');
      const [image, mask] = await Promise.all([load(source!, item), load(source!, item.selection)]), polygon = profileFaceGeometry[direction][name]; let pixels = 0;
      const xs = polygon.map(p => p[0]), ys = polygon.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      for (let p = 0; p < 1024 * 1536; p++) {
        const i = p * 4, x = p % 1024, y = Math.floor(p / 1024); let samples = 0;
        if (x >= x0 - 1 && x <= x1 && y >= y0 - 1 && y <= y1) for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (contains(x + (sx + .5) / 4, y + (sy + .5) / 4, polygon)) samples++;
        const coverage = Math.round(samples * 255 / 16), alpha = Math.round(reference.data[i + 3]! * coverage / 255);
        if (mask.data.subarray(i, i + 4).some(v => v !== coverage) || image.data.subarray(i, i + 4).some((v, c) => v !== (alpha >= 8 ? c === 3 ? alpha : reference.data[i + c] : 0))) throw new Error(`${direction}-${label}: layer/mask must retain only its own native reference pixels.`);
        if (image.data[i + 3]! >= 8) pixels++;
      }
      if (pixels !== item.pixelCount) throw new Error('Native feature coverage changed.'); parts.set(`${direction}-${name}`, image);
      measurements.push({ direction, name, plane, side, pixels, foregroundHairOverlapPixels: 0 }); pending.push({ path: `layers/${direction}-${label}.png`, image }, { path: `masks/${direction}-${label}.png`, image: mask });
    }
  }
  const temporary = await mkdtemp(resolve(tmpdir(), 'profile-face-review-'));
  try {
    const baseline = await prepareHeadReview({ sourceDirectory: headRoot!, hairDirectory: hairRoot!, referenceDirectory: refs!, outputDirectory: resolve(temporary, 'head'), configSource: 'profiles-authoring-v3.json' });
    const fitMeasurements: { direction: 'E' | 'W'; baselineSha256: string; outputSha256: string; bareSha256: string }[] = [], overview = blankImage(1152, 880);
    for (const [row, direction] of directions.entries()) {
      const stage = async (path: string) => decodePng(await readFile(resolve(temporary, 'head', path)));
      const headImage = await stage(`layers/${direction}-head.png`), neck = await stage(`layers/${direction}-neck.png`), front = await stage(`layers/${direction}-front-coherent.png`), rear = await stage(`layers/${direction}-rear-coherent.png`);
      const compose = (features: boolean, withHair: boolean) => { const image = blankImage(1024, 1536), planes = new Map<RenderPlane, RgbaImage[]>([['head', [headImage]], ['neck', [neck]]]); if (withHair) { planes.set('hair-front', [front]); planes.set('hair-rear', [rear]); }
        if (features) for (const name of names) { const plane = config.frames[direction].features[name].plane; planes.set(plane, [...planes.get(plane) ?? [], parts.get(`${direction}-${name}`)!]); }
        for (const plane of DIRECTION_PLANE_ORDER[direction]) for (const layer of planes.get(plane) ?? []) drawRgba(image, layer, 0, 0); return image;
      };
      const previous = compose(false, true), fit = compose(true, true), bare = compose(true, false), previousHash = sha256(encodePng(previous));
      if (previousHash !== approval.fitMeasurements.find(m => m.direction === direction)!.outputSha256 || previousHash !== baseline.fitMeasurements.find(m => m.direction === direction)!.outputSha256) throw new Error('Actual approved profile composition changed.');
      for (const m of measurements.filter(m => m.direction === direction)) { const image = parts.get(`${direction}-${m.name}`)!; for (let i = 3; i < image.data.length; i += 4) if (image.data[i]! >= 8 && front.data[i]! >= 8) m.foregroundHairOverlapPixels++; }
      fitMeasurements.push({ direction, baselineSha256: previousHash, outputSha256: sha256(encodePng(fit)), bareSha256: sha256(encodePng(bare)) });
      for (const [column, image] of [references.get(direction)!, previous, fit].entries()) drawRgba(overview, checkerPreview(crop(image), direction), column * 384, row * 440);
      pending.push({ path: `inspection/${direction}-face-fit-comparison.png`, image: faceComparison(direction, [references.get(direction)!, previous, fit]) }, { path: `fit/${direction}.png`, image: fit }, { path: `fit/${direction}-bare.png`, image: bare }, { path: `fit/${direction}-approved-baseline.png`, image: previous }, { path: `layers/${direction}-head.png`, image: headImage }, { path: `layers/${direction}-neck.png`, image: neck }, { path: `layers/${direction}-front-hair.png`, image: front }, { path: `layers/${direction}-rear-hair.png`, image: rear });
    }
    pending.push({ path: 'overview.png', image: overview });
    const report = { schemaVersion: 1, id: config.id, scope: config.scope, assetVersion: config.assetVersion, configSha256: sha256(bytes), status: config.status, published: false, anatomyApproved: false, paletteReady: false, supportedReviewDirections: directions, missingDirections: DIRECTIONS.filter(d => !new Set<string>(directions).has(d)), hiddenFeatures: { E: config.frames.E.hiddenFeatures, W: config.frames.W.hiddenFeatures }, nativePosition: { x: 0, y: 0 }, comparisonColumns: ['reference', 'approved-revision-3-head-hair', 'native-facial-candidate-v1'], inspectionCrops: faceCropRegions, inspectionMagnification: 4, fitMeasurements, measurements, bodyOcclusionVerified: false, knownReviewIssues: config.knownReviewIssues, outputs: pending.map(p => ({ path: p.path, sha256: sha256(encodePng(p.image)) })), reviewRequired: ['Actual native profile eye/brow/mouth placement and physical side identity', 'Local skin rims, complete visible extraction and original foreground occlusion', 'Concealed surfaces, expressions, materials and remaining independent ear facings', 'N anatomy, body/clothing occlusion, production T-pose, independent pixel art and final Step 6C'] };
    for (const p of [...pending.map(p => ({ path: p.path, bytes: encodePng(p.image) })), { path: 'metadata.json', bytes: Buffer.from(JSON.stringify(report, null, 2) + '\n') }]) { const destination = resolve(out, p.path); for (let parent = destination; inside(out, parent); parent = dirname(parent)) { try { if ((await lstat(parent)).isSymbolicLink()) throw new Error('Profile face output symlinks are forbidden.'); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; } if (parent === out) break; } await mkdir(dirname(destination), { recursive: true }); await writeFile(destination, p.bytes); }
    for (const [path, before] of inputs) if (sha256(await readFile(path)) !== before) throw new Error('Source changed during profile face review.');
    return report;
  } finally { await rm(temporary, { recursive: true, force: true }); }
}
