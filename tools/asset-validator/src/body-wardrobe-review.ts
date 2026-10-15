import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { isDeepStrictEqual } from 'node:util';
import { z } from 'zod';
import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { RenderPlane } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { bodyPartsReviewSchema } from './body-parts-review';
import type { BodyPartsReviewOptions } from './body-parts-review';
import { prepareShoulderReview } from './body-shoulder-review';
import { constructSouthWardrobe, southWardrobeGeometry, validateWardrobeCoverage, wardrobeClothing, wardrobeLayerNames } from './body-wardrobe';
import type { WardrobeLayers, WardrobeLook } from './body-wardrobe';
import { sha256 } from './reference-import';
const hash = z.string().regex(/^[a-f0-9]{64}$/), source = z.string().regex(/^(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+$/).refine(p => p.split('/').every(s => s !== '.' && s !== '..'));
const pin = z.strictObject({ source, sourceSha256: hash });
export const wardrobeInputsSchema = z.strictObject({ schemaVersion: z.literal(1), id: z.literal('outfit.reference-dress.s.v1'), direction: z.literal('S'), target: z.literal('detailed'), sourcePose: z.literal('tpose-study'), status: z.literal('draft-needs-human-review'),
  baselineConfiguration: pin, shoulderConfiguration: pin, shoulderApproval: pin, study: pin, designGuide: pin, prompts: pin, settings: pin, replay: pin,
  published: z.literal(false), productionAnatomyApproved: z.literal(false), finalStep6CAccepted: z.literal(false) });
export const wardrobeReviewSchema = z.strictObject({ schemaVersion: z.literal(1), id: z.literal('outfit.reference-dress.s.v1'), inputs: pin, layers: z.record(z.enum(wardrobeLayerNames),pin) });
const inside = (base: string, path: string) => { const p = relative(base,path); return p === '' || (!isAbsolute(p) && p !== '..' && !p.startsWith('../')); };
const missing = (e: unknown) => (e as NodeJS.ErrnoException).code === 'ENOENT';

export async function prepareWardrobeReview(options: BodyPartsReviewOptions) {
  const [root, assets, refs] = await Promise.all([options.sourceDirectory,options.assetDirectory,options.referenceDirectory].map(p => realpath(p))), out = resolve(options.outputDirectory), inputs = new Map<string,string>();
  if ([root!,assets!,refs!].some(p => inside(p,out) || inside(out,p))) throw new Error('Wardrobe output and source directories must be disjoint.');
  const outputPaths = ['fit/S.png','fit/S-midriff-high-slit.png','inspection/S-wardrobe.html','metadata.json'];
  for (const name of outputPaths) for (let p = resolve(out,name); ; p = dirname(p)) {
    try { if ((await lstat(p)).isSymbolicLink() || await realpath(p) !== p) throw new Error('Wardrobe output symlinks forbidden.'); } catch (error) { if (!missing(error)) throw error; }
    if (dirname(p) === p) break;
  }
  const read = async (base: string, pin: { source: string; sourceSha256?: string }) => {
    const p = resolve(base,pin.source);
    if (!inside(base,p) || await realpath(p) !== p || !(await lstat(p)).isFile()) throw new Error('Ordinary pinned wardrobe inputs required.');
    const bytes = await readFile(p), digest = sha256(bytes);
    if (pin.sourceSha256 && digest !== pin.sourceSha256) throw new Error('Wardrobe pinned input changed: ' + pin.source);
    inputs.set(p,digest); return bytes;
  };
  const configBytes = await read(root!,{ source: 'authoring.json' }), config = wardrobeReviewSchema.parse(JSON.parse(configBytes.toString('utf8')));
  const manifest = wardrobeInputsSchema.parse(JSON.parse((await read(root!,config.inputs)).toString('utf8')));
  if (manifest.baselineConfiguration.source !== 'body/parts-v1/authoring.json' || manifest.shoulderConfiguration.source !== 'body/shoulders-v1/authoring.json' || manifest.shoulderApproval.source !== 'body/shoulders-v1/review-fit-v1.json') throw new Error('Wardrobe study requires its approved S body and shoulder checkpoints.');
  const baseline = bodyPartsReviewSchema.parse(JSON.parse((await read(assets!,manifest.baselineConfiguration)).toString('utf8')));
  await read(assets!,manifest.shoulderConfiguration);
  const approval = z.object({ direction: z.literal('S'), decision: z.literal('approved-s-concealed-shoulder-root-study'), currentStudyRootsApproved: z.literal(true), configurationSha256: hash, bodySha256: hash, bareSha256: hash, fitSha256: hash }).parse(JSON.parse((await read(assets!,manifest.shoulderApproval)).toString('utf8')));
  if (approval.configurationSha256 !== manifest.shoulderConfiguration.sourceSha256) throw new Error('Wardrobe shoulder approval changed.');
  const settings = JSON.parse((await read(root!,manifest.settings)).toString('utf8'));
  if (settings.method !== 'native-s-covered-wardrobe' || !isDeepStrictEqual(settings.geometry,southWardrobeGeometry)) throw new Error('Wardrobe construction geometry changed.');
  for (const p of [manifest.prompts,manifest.replay,manifest.designGuide]) await read(root!,p);
  const load = async (base: string, pin: z.infer<typeof wardrobeReviewSchema>['inputs']) => decodePng(await read(base,pin));
  const parts = await Promise.all(baseline.parts.map(p => load(resolve(assets!,'body/parts-v1'),p)));
  const study = await load(root!,manifest.study), expected = constructSouthWardrobe(parts[0]!,study);
  const layers = Object.fromEntries(await Promise.all(wardrobeLayerNames.map(async name => [name,await load(root!,config.layers[name])]))) as WardrobeLayers;
  for (const name of wardrobeLayerNames) if (layers[name].width !== 1024 || layers[name].height !== 1536 || layers[name].data.some((v,i) => v !== expected[name].data[i])) throw new Error('Wardrobe native source construction changed: ' + name);
  const scratch = await mkdtemp(resolve(tmpdir(),'character-wardrobe-baseline-'));
  try {
    const actual = await prepareShoulderReview({ ...options, sourceDirectory: resolve(assets!,'body/shoulders-v1'), outputDirectory: scratch });
    if (actual.configSha256 !== manifest.shoulderConfiguration.sourceSha256 || actual.bodySha256 !== approval.bodySha256 || actual.bareSha256 !== approval.bareSha256 || actual.fitSha256 !== approval.fitSha256) throw new Error('Actual approved shoulder/body/head/hair composition changed.');
  } finally { await rm(scratch,{ recursive: true,force: true }); }
  const [body,head,front,rear] = await Promise.all([baseline.wholeBody,baseline.head,baseline.frontHair,baseline.rearHair].map(p => load(assets!,p)));
  const compose = (look: WardrobeLook, withHead: boolean, withHair: boolean) => {
    const clothing = wardrobeClothing(layers,look), coverage = validateWardrobeCoverage(clothing);
    const torso = { ...layers.skinBase, data: layers.skinBase.data.slice() };
    if (look !== 'daily-underwear') drawRgba(torso,layers.skinPatches,0,0);
    const image = blankImage(1024,1536), planes = new Map<RenderPlane,RgbaImage>(baseline.parts.map((p,i) => [p.plane,i === 0 ? torso : parts[i]!]));
    if (withHead) planes.set('head',head!);
    if (withHair) { planes.set('hair-front',front!); planes.set('hair-rear',rear!); }
    // Source ownership is disjoint; undergarments attach above body planes and beneath the outer outfit.
    const under = blankImage(1024,1536); for (const c of clothing) drawRgba(under,c,0,0);
    planes.set('outfit-front',under);
    for (const plane of DIRECTION_PLANE_ORDER.S) { const layer = planes.get(plane); if (layer) drawRgba(image,layer,0,0); }
    return { image, coverage };
  };
  const daily = compose('daily-underwear',false,false).image, dailyFit = compose('daily-underwear',true,true).image;
  if (daily.data.some((v,p) => v !== body!.data[p]) || sha256(encodePng(dailyFit)) !== approval.fitSha256) throw new Error('Separated daily underwear must reconstruct approved S body and hair fit exactly.');
  const looks = ['reference-dress','midriff-high-slit'] as const;
  const pending: { path: string; bytes: Uint8Array }[] = [], measurements: Record<string,unknown> = {};
  for (const look of looks) {
    const bare = compose(look,false,false).image, clothing = wardrobeClothing(layers,look), cloth = blankImage(1024,1536);
    for (const c of clothing) drawRgba(cloth,c,0,0);
    let gaps = 0, visibleLining = 0;
    for (let p = 0; p < body!.data.length; p += 4) {
      if (body!.data[p + 3]! >= 245 && bare.data[p + 3]! < 245) gaps++;
      if (layers.lining.data[p + 3] && clothing[1]!.data[p + 3]! < 250) visibleLining++;
    }
    if (gaps) throw new Error('WARDROBE_BODY_GAP: missing exposed skin at ' + gaps + ' native pixels.');
    if (visibleLining) throw new Error('WARDROBE_UNDERLAYER_PEEK: fit the inner lining behind this slit and neckline.');
    // The waist is independent of modesty regions and must remain native skin in the test case.
    if (look === 'midriff-high-slit') for (let y = 490; y < 526; y++) for (let x = 466; x < 558; x++) {
      const p = (y * 1024 + x) * 4;
      if (cloth.data[p + 3] || bare.data.subarray(p,p+4).some((v,c) => v !== body!.data[p+c])) throw new Error('Midriff test must preserve exposed native belly skin.');
    }
    const { image, coverage } = compose(look,true,true);
    const path = look === 'reference-dress' ? 'fit/S.png' : 'fit/S-midriff-high-slit.png';
    pending.push({ path, bytes: encodePng(image) }); measurements[look] = { coverage, bodyGapPixels: gaps, visibleLiningPixels: visibleLining, bellyVisible: look === 'midriff-high-slit' };
  }
  const page = Buffer.from(`<!doctype html><html lang="en"><meta charset="utf-8"><title>S covered wardrobe study</title><style>body{background:#202124;color:#eee;font:16px system-ui;margin:24px}p{max-width:95ch;line-height:1.5}.panels{display:flex;gap:20px;overflow:auto}figure{margin:0}img{width:512px;height:768px;background:repeating-conic-gradient(#bbb 0 25%,#eee 0 50%) 0/24px 24px}figcaption{padding:12px 0}</style><h1>S wardrobe separation — needs visual review</h1><p>Everyday bra and panties are independent layers and reconstruct the approved body exactly. The fitted gown uses opaque inner bust and high-cut pelvic lining hidden behind the outer garment. The waist may remain exposed independently.</p><div class="panels"><figure><figcaption>Reference gown — retained body/head/hair</figcaption><img src="../fit/S.png" alt="Reference purple dress on approved S T-pose"></figure><figure><figcaption>Midriff + high-slit coverage test</figcaption><img src="../fit/S-midriff-high-slit.png" alt="Cropped bodice and high-slit skirt with native belly exposed"></figure></div><p>The second look is a construction test made by separating the bodice and skirt, not a finished new outfit design. Missing bust/pelvic coverage, visible inner-lining edges and exposed-body gaps fail before export. Review the neckline, slit, hem and exposed skin transitions. Only S is authored; other facings and different openings require their own fitted pieces. No naked preview or complete unclothed body is generated. Gloves and shoes are separate future assets. Step 6C remains open.</p></html>\n`);
  pending.push({ path: 'inspection/S-wardrobe.html', bytes: page });
  const report = { schemaVersion: 1,id: config.id,configSha256: sha256(configBytes),direction: 'S',target: 'detailed',sourcePose: 'tpose-study',status: 'draft-needs-human-review',supportedReviewDirections: ['S'],
    bodySha256: approval.bodySha256,fitSha256: approval.fitSha256,approvedBaselineReconstructed: true,separateUnderwearAuthored: true,skinBelowCoveredAreasAuthored: false,coveredAssembliesOnly: true,measurements,
    published: false,productionAnatomyApproved: false,productionRigApproved: false,footwearCompatibilityApproved: false,finalStep6CAccepted: false,step6DStarted: false,
    outputs: pending.map(p => ({ path: p.path,sha256: sha256(p.bytes) })) };
  for (const [p,digest] of inputs) if (sha256(await readFile(p)) !== digest) throw new Error('Wardrobe source changed during review.');
  for (const file of [...pending,{ path: 'metadata.json',bytes: Buffer.from(JSON.stringify(report,null,2) + '\n') }]) { await mkdir(dirname(resolve(out,file.path)),{ recursive: true }); await writeFile(resolve(out,file.path),file.bytes); }
  return report;
}
