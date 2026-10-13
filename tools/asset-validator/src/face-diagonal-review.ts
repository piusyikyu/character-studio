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
import { diagonalFaceGeometry, diagonalEyeCheekTrim, diagonalFarEyeTrim, diagonalFarEyeHairOwnership, diagonalFarEyeTrimV4, diagonalCompleteFarEye, diagonalRightBrowTrim } from './face-diagonal-geometry';
import { sha256 } from './reference-import';

const directions = ['SE', 'SW'] as const, names = ['rightEye', 'leftEye', 'rightBrow', 'leftBrow', 'mouth'] as const;
const hash = z.string().regex(/^[a-f0-9]{64}$/), pin = z.strictObject({ source: assetSourceSchema, sourceSha256: hash });
const part = pin.extend({ selection: pin, plane: z.enum(['eyes', 'eyebrows', 'mouth']), side: z.enum(['right', 'left', 'center']), owner: z.enum(['reference','study']), pixelCount: z.number().int().positive(), origin: z.strictObject({ x: z.number().int(), y: z.number().int() }) });
const frame = z.strictObject({ reference: pin, features: z.strictObject({ rightEye: part, leftEye: part, rightBrow: part, leftBrow: part, mouth: part }) });
const completeEyeSchema=z.strictObject({study:pin.extend({source:z.literal('inputs/SE-left-eye-study-v5.png')}),guide:pin.extend({source:z.literal('inputs/SE-left-eye-guide-v5.png')}),provenance:pin.extend({source:z.literal('prompts-v5.json')}),foregroundBaseline:pin.extend({source:z.literal('authoring-v3.json')}),foreground:pin.extend({source:z.literal('SE-front-hair-v3.png')}),foregroundSelection:pin.extend({source:z.literal('SE-front-hair-mask-v3.png')})});
const diagonalFaceBaseSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('face.reference.v1'), scope: z.literal('front-diagonals'), target: z.literal('detailed'), nativeSize: z.strictObject({ width: z.literal(1024), height: z.literal(1536) }),
  sourcePose: z.literal('standing-reference'), intendedRuntimePose: z.literal('tpose'), published: z.literal(false), paletteReady: z.literal(false), status: z.literal('draft-needs-human-review'),
  headConfig: pin.extend({ source: z.literal('front-diagonals-authoring-v4.json') }), headApproval: pin.extend({ source: z.literal('front-diagonals-review-fit-v4.json') }),
  frames: z.strictObject({ SE: frame, SW: frame }), knownReviewIssues: z.array(z.string().min(1)).min(1),
});
export const diagonalFaceReviewSchema = z.discriminatedUnion('assetVersion', [
  diagonalFaceBaseSchema.extend({ assetVersion: z.literal(1), settings: pin.extend({ source: z.literal('selections.json') }) }),
  diagonalFaceBaseSchema.extend({ assetVersion: z.literal(2), settings: pin.extend({ source: z.literal('selections-v2.json') }), previous: pin.extend({ source: z.literal('authoring.json') }) }),
  diagonalFaceBaseSchema.extend({ assetVersion: z.literal(3), settings: pin.extend({ source: z.literal('selections-v3.json') }), previous: pin.extend({ source: z.literal('authoring-v2.json') }), hairRepair: pin.extend({source:z.literal('SE-front-hair-v3.png'),original:pin.extend({source:z.literal('SE-front-fit-v2.png')}),selection:pin.extend({source:z.literal('SE-front-hair-mask-v3.png')}),pixelCount:z.number().int().positive()}) }),
  diagonalFaceBaseSchema.extend({ assetVersion: z.literal(4), settings: pin.extend({ source: z.literal('selections-v4.json') }), previous: pin.extend({ source: z.literal('authoring-v3.json') }), hairRepair: pin.extend({source:z.literal('SE-front-hair-v4.png'),original:pin.extend({source:z.literal('SE-front-fit-v2.png')}),selection:pin.extend({source:z.literal('SE-front-hair-mask-v4.png')}),pixelCount:z.number().int().positive(),eyeReleaseSelection:pin.extend({source:z.literal('SE-eye-release-mask-v4.png')}),eyeReleasePixels:z.number().int().positive()}) }),
  diagonalFaceBaseSchema.extend({ assetVersion: z.literal(5), settings: pin.extend({source:z.literal('selections-v5.json')}),previous:pin.extend({source:z.literal('authoring-v4.json')}),completeEye:completeEyeSchema }),
  diagonalFaceBaseSchema.extend({ assetVersion: z.literal(6), settings: pin.extend({source:z.literal('selections-v6.json')}),previous:pin.extend({source:z.literal('authoring-v5.json')}),completeEye:completeEyeSchema,leftEyeApproval:pin.extend({source:z.literal('review-left-eye-v5.json')}) }),
]);
const inside = (parent: string, child: string) => { const p = relative(parent, child); return p === '' || (!p.startsWith('..') && !isAbsolute(p)); };
const contains = (x: number, y: number, polygon: readonly (readonly [number, number])[]) => { let selected = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a]!, [bx, by] = polygon[b]!; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) selected = !selected; } return selected; };
const crop = (image: RgbaImage) => { const out = blankImage(384, 440); for (let y = 0; y < 440; y++) out.data.set(image.data.subarray(((y + 40) * 1024 + 320) * 4, ((y + 40) * 1024 + 704) * 4), y * 384 * 4); return out; };
const faceCropRegions = { SE: { x: 490, y: 135, width: 145, height: 135 }, SW: { x: 390, y: 150, width: 150, height: 145 } } as const;
const faceComparison = (direction: 'SE' | 'SW', images: readonly RgbaImage[], r: { x:number; y:number; width:number; height:number } = faceCropRegions[direction], scale = 4) => {
  const out = blankImage(r.width * scale * images.length, r.height * scale);
  for (const [column, image] of images.entries()) for (let y = 0; y < out.height; y++) for (let x = 0; x < r.width * scale; x++) {
    const i = ((r.y + Math.floor(y / scale)) * 1024 + r.x + Math.floor(x / scale)) * 4, j = (y * out.width + column * r.width * scale + x) * 4, alpha = image.data[i + 3]! / 255, checker = (Math.floor(x / 32) + Math.floor(y / 32)) % 2 ? 195 : 235;
    for (let c = 0; c < 3; c++) out.data[j + c] = Math.round(image.data[i + c]! * alpha + checker * (1 - alpha)); out.data[j + 3] = 255;
  }
  return out;
};
export interface DiagonalFaceReviewOptions { readonly sourceDirectory: string; readonly headDirectory: string; readonly hairDirectory: string; readonly referenceDirectory: string; readonly outputDirectory: string; readonly configFile?: 'authoring.json' | 'authoring-v2.json' | 'authoring-v3.json' | 'authoring-v4.json' | 'authoring-v5.json' | 'authoring-v6.json'; }
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
  const bytes = await read(source!, { source: options.configFile ?? 'authoring-v6.json' }), config = diagonalFaceReviewSchema.parse(JSON.parse(bytes.toString('utf8')));
  const previous = config.assetVersion >= 2 && 'previous' in config ? diagonalFaceReviewSchema.parse(JSON.parse((await read(source!, config.previous)).toString('utf8'))) : undefined;
  if (previous) {
    if (previous.assetVersion !== config.assetVersion - 1 || JSON.stringify(previous.headConfig) !== JSON.stringify(config.headConfig) || JSON.stringify(previous.headApproval) !== JSON.stringify(config.headApproval)) throw new Error('Eye correction must retain its preceding approved anatomy baseline.');
    const previousSettings = JSON.parse((await read(source!, previous.settings)).toString('utf8'));
    if (previousSettings.schemaVersion !== 1 || previousSettings.method !== (previous.assetVersion===5?'native-reference-features/complete-eye-study':'independent-native-reference-features') || JSON.stringify(previousSettings.frames) !== JSON.stringify(diagonalFaceGeometry)) throw new Error('Previous native facial geometry changed.');
    for (const direction of directions) {
      if (JSON.stringify(config.frames[direction].reference) !== JSON.stringify(previous.frames[direction].reference)) throw new Error('Eye correction must retain both native references.');
      for (const name of names) if (!(direction === 'SE' && name === (config.assetVersion === 6 ? 'rightBrow' : config.assetVersion >= 3 ? 'leftEye' : 'rightEye')) && JSON.stringify(config.frames[direction].features[name]) !== JSON.stringify(previous.frames[direction].features[name])) throw new Error('Native correction must preserve all nine other features, including the accepted eye.');
    }
  }
  if(config.assetVersion===6){
    const accepted=z.object({schemaVersion:z.literal(1),status:z.literal('approved-native-feature'),target:z.literal('detailed'),direction:z.literal('SE'),name:z.literal('leftEye'),configSha256:hash,feature:part,completeEye:completeEyeSchema,wholeFitApproved:z.literal(false),productionAnatomyApproved:z.literal(false),finalStep6CAccepted:z.literal(false)}).parse(JSON.parse((await read(source!,config.leftEyeApproval)).toString('utf8')));
    if(previous?.assetVersion!==5||accepted.configSha256!==config.previous.sourceSha256||JSON.stringify(accepted.feature)!==JSON.stringify(config.frames.SE.features.leftEye)||JSON.stringify(accepted.completeEye)!==JSON.stringify(config.completeEye)||JSON.stringify(previous.completeEye)!==JSON.stringify(config.completeEye))throw new Error('Brow correction must retain the accepted revision-5 complete eye and foreground.');
  }
  let approvedConfig=previous;
  while(approvedConfig&&approvedConfig.assetVersion>2&&'previous' in approvedConfig){const parent=diagonalFaceReviewSchema.parse(JSON.parse((await read(source!,approvedConfig.previous)).toString('utf8')));if(parent.assetVersion!==approvedConfig.assetVersion-1)throw new Error('Native facial derivation chain changed.');approvedConfig=parent;}
  const originalConfig = approvedConfig?.assetVersion === 2 ? diagonalFaceReviewSchema.parse(JSON.parse((await read(source!, approvedConfig.previous)).toString('utf8'))) : approvedConfig;
  if (config.assetVersion >= 3) {
    if (originalConfig?.assetVersion !== 1 || !approvedConfig || approvedConfig.assetVersion !== 2) throw new Error('Far-eye trim requires its revision-2 and revision-1 derivation baselines.');
    const previousSettings = JSON.parse((await read(source!, approvedConfig.settings)).toString('utf8'));
    if (JSON.stringify(previousSettings.cheekTrim) !== JSON.stringify(diagonalEyeCheekTrim)) throw new Error('Previous SE cheek trim changed.');
    for (const direction of directions) for (const name of names) if (!(direction === 'SE' && name === 'rightEye') && JSON.stringify(approvedConfig.frames[direction].features[name]) !== JSON.stringify(originalConfig.frames[direction].features[name])) throw new Error('Previous revision-2 native feature ownership changed.');
    if (JSON.stringify(approvedConfig.headConfig) !== JSON.stringify(originalConfig.headConfig) || JSON.stringify(approvedConfig.headApproval) !== JSON.stringify(originalConfig.headApproval) || directions.some(direction => JSON.stringify(approvedConfig.frames[direction].reference) !== JSON.stringify(originalConfig.frames[direction].reference))) throw new Error('Previous revision-2 anatomy/reference baseline changed.');
  }
  const headBytes = await read(headRoot!, config.headConfig), head = headFrontDiagonalsRepairSchema.parse(JSON.parse(headBytes.toString('utf8')));
  const approval = z.object({ status: z.literal('approved-standing-reference-fit-candidate'), configSha256: hash, bodyOcclusionVerified: z.literal(false), futureBodyFitObligations: z.array(z.string()), fitMeasurements: z.array(z.object({ direction: z.enum(directions), outputSha256: hash })).length(2) }).parse(JSON.parse((await read(headRoot!, config.headApproval)).toString('utf8')));
  if (approval.configSha256 !== config.headConfig.sourceSha256 || head.assetVersion !== 4) throw new Error('Approved revision-4 diagonal anatomy required.');
  const settings = JSON.parse((await read(source!, config.settings)).toString('utf8'));
  if (settings.schemaVersion !== 1 || settings.method !== ('completeEye' in config?'native-reference-features/complete-eye-study':'independent-native-reference-features') || JSON.stringify(settings.frames) !== JSON.stringify(diagonalFaceGeometry)) throw new Error('Independent SE/SW feature geometry changed.');
  if(config.assetVersion===6&&JSON.stringify(settings.browTrim)!==JSON.stringify(diagonalRightBrowTrim))throw new Error('Bounded SE right-brow ownership changed.');
  if (config.assetVersion >= 2 && JSON.stringify(settings.cheekTrim) !== JSON.stringify(diagonalEyeCheekTrim)) throw new Error('Bounded SE lower-lid ownership changed.');
  if ((config.assetVersion === 3 || config.assetVersion === 4) && JSON.stringify(settings.farEyeTrim) !== JSON.stringify(config.assetVersion === 4 ? diagonalFarEyeTrimV4 : diagonalFarEyeTrim)) throw new Error('Bounded SE far-eye ownership changed.');
  if((config.assetVersion===3||config.assetVersion===4)&&(JSON.stringify(settings.farEyeHairOwnership)!==JSON.stringify(diagonalFarEyeHairOwnership)||JSON.stringify(config.hairRepair.original)!==JSON.stringify(head.localFitRepair!.frames.SE!.front)))throw new Error('SE far-eye hair repair must retain bounded same-facing front-hair ownership.');
  let completedStudy:RgbaImage|undefined,completionGuide:RgbaImage|undefined;
  if('completeEye' in config){
    if(JSON.stringify(settings.completeEye)!==JSON.stringify(diagonalCompleteFarEye))throw new Error('Complete SE eye must retain its authored native contour.');
    [completedStudy,completionGuide]=await Promise.all([load(source!,config.completeEye.study),load(source!,config.completeEye.guide)]);
    const iris=(180*1024+598)*4,sclera=(173*1024+609)*4,hiddenIris=(181*1024+594)*4;
    if([iris,hiddenIris].some(i=>completedStudy!.data[i+3]!<240||completedStudy!.data[i]!-completedStudy!.data[i+1]!<100||completedStudy!.data[i+2]!-completedStudy!.data[i+1]!<100)||completedStudy.data[sclera+3]!<240||completedStudy.data[sclera]!<180||completedStudy.data[sclera+1]!<180)throw new Error('Complete SE eye study must supply iris and sclera at its native landmarks.');
    const prompts=JSON.parse((await read(source!,config.completeEye.provenance)).toString('utf8'));
    if(prompts.tool!=='built-in imagegen'||prompts.selected?.output!==config.completeEye.study.source||prompts.selected?.sourceSha256!==config.completeEye.study.sourceSha256||prompts.selected?.inputs?.[0]?.sourceSha256!==config.completeEye.guide.sourceSha256||prompts.selected?.inputs?.[1]?.sourceSha256!==config.frames.SE.reference.sourceSha256)throw new Error('Complete-eye study provenance or same-facing guide changed.');
  }
  const pending: { path: string; image: RgbaImage }[] = [], parts = new Map<string, RgbaImage>(), measurements: { direction: 'SE' | 'SW'; name: typeof names[number]; plane: RenderPlane; side: string; pixels: number; foregroundHairOverlapPixels: number }[] = [];
  const references = new Map<string, RgbaImage>();
  let previousFeature: RgbaImage | undefined;
  for (const direction of directions) {
    const f = config.frames[direction]; if (f.reference.source !== `${direction}.png` || f.reference.sourceSha256 !== head.frames[direction].referenceSha256) throw new Error('Facing reference ownership cannot be substituted or mirrored.');
    const reference = await load(refs!, f.reference); references.set(direction, reference);
    for (const name of names) {
      const item = f.features[name], plane = name.endsWith('Eye') ? 'eyes' : name.endsWith('Brow') ? 'eyebrows' : 'mouth', side = name.startsWith('right') ? 'right' : name.startsWith('left') ? 'left' : 'center';
      const trimmed = config.assetVersion >= 2 && direction === 'SE' && name === 'rightEye', completed='completeEye' in config&&direction==='SE'&&name==='leftEye',browTrimmed=config.assetVersion===6&&direction==='SE'&&name==='rightBrow',farTrimmed = (config.assetVersion===3||config.assetVersion===4) && direction === 'SE' && name === 'leftEye', suffix = completed ? '-v5' : browTrimmed ? '-v6' : farTrimmed ? `-v${config.assetVersion}` : trimmed ? '-v2' : '';
      if (item.source !== `${direction}-${name}${suffix}.png` || item.selection.source !== `${direction}-${name}-mask${suffix}.png` || item.owner !== (completed?'study':'reference') || item.plane !== plane || item.side !== side || JSON.stringify(item.origin) !== JSON.stringify(head.frames[direction].candidateHeadAnchor)) throw new Error('Native facing, physical side, feature plane or anchor changed.');
      const [image, mask] = await Promise.all([load(source!, item), load(source!, item.selection)]), polygon = completed?diagonalCompleteFarEye.polygon:diagonalFaceGeometry[direction][name]; let pixels = 0;
      const oldItem = farTrimmed ? approvedConfig!.frames.SE.features.leftEye : trimmed ? originalConfig!.frames.SE.features.rightEye : undefined, oldMask = oldItem ? await load(source!, oldItem.selection) : undefined;
      const originalEye = oldItem ? await load(source!, oldItem) : undefined;
      if (browTrimmed) previousFeature = await load(source!, previous!.frames.SE.features.rightBrow); else if ((completed && config.assetVersion===5) || farTrimmed) previousFeature = await load(source!, previous!.frames.SE.features.leftEye); else if (trimmed && config.assetVersion === 2) previousFeature = originalEye;
      const xs = polygon.map(p => p[0]), ys = polygon.map(p => p[1]), x0 = Math.floor(Math.min(...xs)), x1 = Math.ceil(Math.max(...xs)), y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
      for (let p = 0; p < 1024 * 1536; p++) { const i = p * 4, x = p % 1024, y = Math.floor(p / 1024), selected = x >= x0 && x <= x1 && y >= y0 && y <= y1 && contains(x + .5, y + .5, polygon);
        let coverage = selected ? 255 : 0;
        if (((trimmed || farTrimmed || browTrimmed) && selected || completed) && x>=x0&&x<=x1&&y>=y0&&y<=y1) {
          let samples = 0; for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (contains(x + (sx + .5) / 4, y + (sy + .5) / 4, (completed ? diagonalCompleteFarEye : browTrimmed ? diagonalRightBrowTrim : farTrimmed ? config.assetVersion === 4 ? diagonalFarEyeTrimV4 : diagonalFarEyeTrim : diagonalEyeCheekTrim).polygon)) samples++;
          coverage = Math.round(samples * 255 / 16);
        }
        const native=completed?completedStudy!:reference,alpha = Math.round(native.data[i + 3]! * coverage / 255);
        if (mask.data.subarray(i, i + 4).some(v => v !== coverage) || image.data.subarray(i, i + 4).some((v, c) => v !== (alpha >= 8 ? c === 3 ? alpha : native.data[i + c] : 0))) throw new Error(`${direction}-${name}: layer/mask must retain only its own native ${completed?'authored study':'reference'} pixels.`);
        if (oldMask && (oldMask.data.subarray(i, i + 4).some(v => v !== (selected ? 255 : 0)) || originalEye!.data.subarray(i, i + 4).some((v, c) => v !== (selected ? reference.data[i + c] : 0)))) throw new Error('Previous SE eye must preserve its native revision-1 ownership.');
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
      const headImage = await stage(`layers/${direction}-head.png`), neck = await stage(`layers/${direction}-neck.png`), originalFront = await stage(`layers/${direction}-front-fit.png`), rear = direction === 'SW' ? await stage('layers/SW-rear-fit.png') : await load(hairRoot!, hair.frames.SE!.rear);
      let front=originalFront;
      if(direction==='SE'&&(config.assetVersion===3||config.assetVersion===4)){
        const releaseMask=config.assetVersion===4?await load(source!,config.hairRepair.eyeReleaseSelection):undefined,rejectedEyeMask=config.assetVersion===4?await load(source!,previous!.frames.SE.features.leftEye.selection):undefined;let releasePixels=0;
        const repair=config.hairRepair,[image,mask,oldEye,oldMask]=await Promise.all([load(source!,repair),load(source!,repair.selection),load(source!,approvedConfig!.frames.SE.features.leftEye),load(source!,approvedConfig!.frames.SE.features.leftEye.selection)]),eye=parts.get('SE-leftEye')!;let selectedPixels=0;
        for(let p=0;p<1024*1536;p++){const i=p*4,x=p%1024,y=Math.floor(p/1024),selected=oldMask.data[i+3]!>0&&eye.data[i+3]!<255&&(contains(x+.5,y+.5,diagonalFarEyeHairOwnership.outer)||contains(x+.5,y+.5,diagonalFarEyeHairOwnership.inner)),alpha=originalFront.data[i+3]!/255,released=Boolean(releaseMask&&eye.data[i+3]===255&&rejectedEyeMask!.data[i+3]!<8&&originalFront.data[i+3]!>=8);
          if(releaseMask&&releaseMask.data.subarray(i,i+4).some(v=>v!==(released?255:0)))throw new Error('SE eye release must retain the recovered native arc.');if(released)releasePixels++;
          if(mask.data.subarray(i,i+4).some(v=>v!==(selected?255:0))||image.data.subarray(i,i+4).some((v,c)=>v!==(released?0:selected?c===3?255:Math.round(originalFront.data[i+c]!*alpha+oldEye.data[i+c]!*(1-alpha)):originalFront.data[i+c])))throw new Error('SE front hair must preserve exact native ownership outside the far-eye strands.');if(selected)selectedPixels++;
        }
        if(config.assetVersion===4&&releasePixels!==config.hairRepair.eyeReleasePixels)throw new Error('SE recovered eye coverage changed.');if(releaseMask)pending.push({path:'masks/SE-eye-release.png',image:releaseMask});
        if(selectedPixels!==repair.pixelCount)throw new Error('SE far-eye hair coverage changed.');front=image;pending.push({path:'masks/SE-eye-hair-ownership.png',image:mask});
      }
      if(direction==='SE'&&'completeEye' in config){
        const guide=blankImage(1024,1536);drawRgba(guide,neck,0,0);drawRgba(guide,headImage,0,0);for(const name of names)if(name!=='leftEye')drawRgba(guide,config.assetVersion===6&&name==='rightBrow'?previousFeature!:parts.get(`SE-${name}`)!,0,0);
        if(sha256(guide.data)!==sha256(completionGuide!.data))throw new Error('Complete-eye guide must retain native accepted anatomy and all other facial features.');
        const foregroundConfig=diagonalFaceReviewSchema.parse(JSON.parse((await read(source!,config.completeEye.foregroundBaseline)).toString('utf8')));
        if(foregroundConfig.assetVersion!==3||JSON.stringify(config.completeEye.foreground)!==JSON.stringify({source:foregroundConfig.hairRepair.source,sourceSha256:foregroundConfig.hairRepair.sourceSha256})||JSON.stringify(config.completeEye.foregroundSelection)!==JSON.stringify(foregroundConfig.hairRepair.selection))throw new Error('Complete eye must remain beneath the retained foreground fringe.');
        const [image,mask,oldEye,oldMask,trimmedEye]=await Promise.all([load(source!,config.completeEye.foreground),load(source!,config.completeEye.foregroundSelection),load(source!,approvedConfig!.frames.SE.features.leftEye),load(source!,approvedConfig!.frames.SE.features.leftEye.selection),load(source!,foregroundConfig.frames.SE.features.leftEye)]);
        let selectedPixels=0;for(let p=0;p<1024*1536;p++){const i=p*4,x=p%1024,y=Math.floor(p/1024),selected=oldMask.data[i+3]!>0&&trimmedEye.data[i+3]!<255&&(contains(x+.5,y+.5,diagonalFarEyeHairOwnership.outer)||contains(x+.5,y+.5,diagonalFarEyeHairOwnership.inner)),alpha=originalFront.data[i+3]!/255;
          if(mask.data.subarray(i,i+4).some(v=>v!==(selected?255:0))||image.data.subarray(i,i+4).some((v,c)=>v!==(selected?c===3?255:Math.round(originalFront.data[i+c]!*alpha+oldEye.data[i+c]!*(1-alpha)):originalFront.data[i+c])))throw new Error('Retained foreground hair changed outside its native ownership mask.');if(selected)selectedPixels++;
        }if(selectedPixels!==foregroundConfig.hairRepair.pixelCount)throw new Error('Retained foreground hair coverage changed.');front=image;pending.push({path:'masks/SE-eye-hair-ownership.png',image:mask});
      }
      const comparisonFront = config.assetVersion===6 ? front : direction === 'SE' && (config.assetVersion === 4 && previous?.assetVersion === 3 || config.assetVersion===5&&previous?.assetVersion===4) ? await load(source!, previous.hairRepair) : originalFront;
      const compose = (features: boolean, withHair: boolean, oldFeature?: RgbaImage) => { const image = blankImage(1024, 1536), planes = new Map<RenderPlane, RgbaImage[]>([['head', [headImage]], ['neck', [neck]]]); if (withHair) { planes.set('hair-front', [features ? oldFeature ? comparisonFront : front : originalFront]); planes.set('hair-rear', [rear]); }
        if (features) for (const name of names) { const plane = config.frames[direction].features[name].plane, layer = direction === 'SE' && name === (config.assetVersion===6?'rightBrow':config.assetVersion >= 3 ? 'leftEye' : 'rightEye') && oldFeature ? oldFeature : parts.get(`${direction}-${name}`)!; planes.set(plane, [...planes.get(plane) ?? [], layer]); }
        for (const plane of DIRECTION_PLANE_ORDER[direction]) for (const layer of planes.get(plane) ?? []) drawRgba(image, layer, 0, 0); return image;
      };
      const previousFit = compose(false, true), fit = compose(true, true), bare = compose(true, false), previousHash = sha256(encodePng(previousFit));
      if (previousHash !== approval.fitMeasurements.find(m => m.direction === direction)!.outputSha256 || previousHash !== baseline.fitMeasurements.find(m => m.direction === direction)!.outputSha256) throw new Error('Actual approved diagonal composition changed.');
      for (const m of measurements.filter(m => m.direction === direction)) { const image = parts.get(`${direction}-${m.name}`)!; for (let i = 3; i < image.data.length; i += 4) if (image.data[i]! >= 8 && front.data[i]! >= 8) m.foregroundHairOverlapPixels++; }
      fitMeasurements.push({ direction, baselineSha256: previousHash, outputSha256: sha256(encodePng(fit)), bareSha256: sha256(encodePng(bare)) });
      for (const [column, image] of [references.get(direction)!, previousFit, fit].entries()) drawRgba(overview, checkerPreview(crop(image), direction), column * 384, row * 440);
      pending.push({ path: `inspection/${direction}-face-fit-comparison.png`, image: faceComparison(direction, [references.get(direction)!, previousFit, fit]) }, { path: `fit/${direction}.png`, image: fit }, { path: `fit/${direction}-bare.png`, image: bare }, { path: `fit/${direction}-approved-baseline.png`, image: previousFit }, { path: `layers/${direction}-head.png`, image: headImage }, { path: `layers/${direction}-neck.png`, image: neck }, { path: `layers/${direction}-front-hair.png`, image: front }, { path: `layers/${direction}-rear-hair.png`, image: rear });
      if (direction === 'SE' && previousFeature && config.assetVersion === 2) pending.push({ path: 'inspection/SE-cheek-fit-comparison.png', image: faceComparison(direction, [references.get(direction)!, compose(true, true, previousFeature), fit]) });
      if (direction === 'SE' && previousFeature && config.assetVersion >= 3 && config.assetVersion <= 5) pending.push({ path: 'inspection/SE-eye-fit-comparison.png', image: faceComparison(direction, [references.get(direction)!, compose(true, true, previousFeature), fit]) }, { path: 'inspection/SE-eye-anatomy-comparison.png', image: faceComparison(direction, [references.get(direction)!, compose(true, false, previousFeature), bare]) });
      if(direction==='SE'&&previousFeature&&(config.assetVersion===4||config.assetVersion===5))pending.push({path:'inspection/SE-eye-close-comparison.png',image:faceComparison(direction,[references.get(direction)!,compose(true,false,previousFeature),bare],{x:580,y:158,width:47,height:38},10)});
      if(direction==='SE'&&previousFeature&&config.assetVersion===6)pending.push({path:'inspection/SE-brow-fit-comparison.png',image:faceComparison(direction,[references.get(direction)!,compose(true,true,previousFeature),fit])},{path:'inspection/SE-brow-close-comparison.png',image:faceComparison(direction,[references.get(direction)!,compose(true,false,previousFeature),bare],{x:526,y:136,width:47,height:28},10)});
    }
    pending.push({ path: 'overview.png', image: overview });
    const report = { schemaVersion: 1, id: config.id, scope: config.scope, assetVersion: config.assetVersion, configSha256: sha256(bytes), status: config.status, published: false, anatomyApproved: false, paletteReady: false, supportedReviewDirections: directions, missingDirections: DIRECTIONS.filter(d => !new Set<string>(directions).has(d)), nativePosition: { x: 0, y: 0 }, comparisonColumns: ['reference', 'approved-revision-4-head-hair', `native-facial-candidate-v${config.assetVersion}`], ...(previousFeature ? config.assetVersion === 6 ? { browComparisonColumns: ['reference', 'revision-5-before-brow-trim', 'revision-6-brow-candidate'] } : config.assetVersion >= 3 ? { eyeComparisonColumns: ['reference', config.assetVersion === 5 ? 'incomplete-extraction-revision-4' : config.assetVersion === 4 ? 'rejected-revision-3' : 'approved-revision-2', `far-eye-candidate-revision-${config.assetVersion}`] } : { cheekComparisonColumns: ['reference', 'revision-1', 'revision-2'] } : {}), ...('completeEye' in config?{authoredCompletedFeatures:['SE-leftEye'],completeEye:config.completeEye,...(config.assetVersion===5?{completionReviewColumns:['reference with original hair','incomplete revision-4 extraction','complete-eye candidate beneath retained foreground fringe']}:{acceptedNativeFeatures:['SE-leftEye'],leftEyeApproval:config.leftEyeApproval})}:{}), inspectionCrops: faceCropRegions, inspectionMagnification: 4, fitMeasurements, measurements, bodyOcclusionVerified: false, futureBodyFitObligations: approval.futureBodyFitObligations, knownReviewIssues: config.knownReviewIssues, outputs: pending.map(p => ({ path: p.path, sha256: sha256(encodePng(p.image)) })), reviewRequired: ['Actual native eye/brow/mouth placement and source ownership', 'Local skin rims and existing fringe occlusion', 'Concealed feature surfaces, independent expressions and materials', 'Other facings, body/clothing, production T-pose, independent pixel artwork and final Step 6C'] };
    for (const p of [...pending.map(p => ({ path: p.path, bytes: encodePng(p.image) })), { path: 'metadata.json', bytes: Buffer.from(JSON.stringify(report, null, 2) + '\n') }]) { const destination = resolve(out, p.path); for (let parent = destination; inside(out, parent); parent = dirname(parent)) { try { if ((await lstat(parent)).isSymbolicLink()) throw new Error('Diagonal face output symlinks are forbidden.'); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; } if (parent === out) break; } await mkdir(dirname(destination), { recursive: true }); await writeFile(destination, p.bytes); }
    for (const [path, before] of inputs) if (sha256(await readFile(path)) !== before) throw new Error('Source changed during diagonal face review.');
    return report;
  } finally { await rm(temporary, { recursive: true, force: true }); }
}
