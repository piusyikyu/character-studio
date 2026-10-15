import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { z } from 'zod';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import { bodyPartsReviewSchema } from './body-parts-review';
import type { BodyPartsReviewOptions } from './body-parts-review';
import { prepareShoulderReview, shoulderReviewSchema } from './body-shoulder-review';
import { checkerPreview } from './inspection';
import { sha256 } from './reference-import';

/** Independently proposed S thigh-root envelopes. Planning geometry, not authored anatomy. */
export const southHipPlanGeometry = {
  coverageSamples: 8,
  right: [[368,727],[368,710],[377,693],[397,676],[425,667],[453,669],[478,681],[498,703],[511,733],[511,735],[491,732],[428,737],[368,729]],
  left: [[513,733],[525,704],[543,681],[571,670],[598,669],[626,679],[643,696],[652,716],[652,729],[652,731],[591,738],[538,734],[513,735]],
} as const;
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const source = z.string().regex(/^(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+$/).refine(p => p.split('/').every(s => s !== '.' && s !== '..'));
const pin = z.strictObject({ source, sourceSha256: hash });
export const hipPlanSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('body.hips.s.plan.v1'), target: z.literal('detailed'), direction: z.literal('S'), sourcePose: z.literal('tpose-study'),
  status: z.literal('blocked-image-generation'), generatedArtProduced: z.literal(false), selectedStudy: z.null(),
  baselineConfiguration: pin, shoulderConfiguration: pin, shoulderApproval: pin, settings: pin, prompts: pin, guide: pin,
  attempts: z.array(z.strictObject({ requestId: z.string().min(1), result: z.literal('output-moderation-rejected'), category: z.literal('sexual') })).length(2),
  published: z.literal(false), productionAnatomyApproved: z.literal(false), concealedJointsApproved: z.literal(false), finalStep6CAccepted: z.literal(false),
});
const inside = (base: string, path: string) => { const p = relative(base, path); return p === '' || (!isAbsolute(p) && p !== '..' && !p.startsWith('../')); };
const missing = (e: unknown) => (e as NodeJS.ErrnoException).code === 'ENOENT';
const pointInside = (x: number, y: number, polygon: readonly (readonly [number, number])[]) => {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!, b = polygon[j]!;
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) result = !result;
  }
  return result;
};

/** Validate a pending authoring checkpoint and paint diagnostics only; never manufacture skin pixels. */
export async function prepareHipPlan(options: BodyPartsReviewOptions) {
  const [root, assets, refs] = await Promise.all([options.sourceDirectory, options.assetDirectory, options.referenceDirectory].map(p => realpath(p)));
  const out = resolve(options.outputDirectory), inputs = new Map<string, string>();
  if ([root!, assets!, refs!].some(p => inside(p, out) || inside(out, p))) throw new Error('Hip-plan outputs and inputs must be disjoint.');
  for (const name of ['inspection/hip-root-plan.png', 'inspection/hip-root-plan.html', 'metadata.json']) for (let p = resolve(out, name); ; p = dirname(p)) {
    try { if ((await lstat(p)).isSymbolicLink() || await realpath(p) !== p) throw new Error('Hip-plan output symlinks forbidden.'); }
    catch (e) { if (!missing(e)) throw e; }
    if (dirname(p) === p) break;
  }
  const read = async (base: string, p: { source: string; sourceSha256?: string }) => {
    const path = resolve(base, p.source);
    if (!inside(base, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error('Ordinary pinned hip-plan inputs required.');
    const bytes = await readFile(path), digest = sha256(bytes);
    if (p.sourceSha256 && digest !== p.sourceSha256) throw new Error('Hip-plan pinned input changed: ' + p.source);
    inputs.set(path, digest); return bytes;
  };
  const bytes = await read(root!, { source: 'authoring-pending.json' }), config = hipPlanSchema.parse(JSON.parse(bytes.toString('utf8')));
  if (config.baselineConfiguration.source !== 'body/parts-v1/authoring.json' || config.shoulderConfiguration.source !== 'body/shoulders-v1/authoring.json' || config.shoulderApproval.source !== 'body/shoulders-v1/review-fit-v1.json') throw new Error('Hip plan requires the accepted S parts and shoulder checkpoint.');
  const baseline = bodyPartsReviewSchema.parse(JSON.parse((await read(assets!, config.baselineConfiguration)).toString('utf8')));
  const shoulder = shoulderReviewSchema.parse(JSON.parse((await read(assets!, config.shoulderConfiguration)).toString('utf8')));
  const approval = z.object({ configurationSha256: hash, direction: z.literal('S'), decision: z.literal('approved-s-concealed-shoulder-root-study'), currentStudyRootsApproved: z.literal(true), bodySha256: hash, bareSha256: hash, fitSha256: hash, rootAssets: z.object({ rightArm: pin, leftArm: pin, rightRetention: pin, leftRetention: pin }) }).parse(JSON.parse((await read(assets!, config.shoulderApproval)).toString('utf8')));
  if (approval.configurationSha256 !== config.shoulderConfiguration.sourceSha256 || !isDeepStrictEqual(shoulder.baselineConfiguration, config.baselineConfiguration) || Object.entries(approval.rootAssets).some(([key, value]) => !isDeepStrictEqual(value, shoulder[key as keyof typeof approval.rootAssets]))) throw new Error('Hip plan must retain the exact approved shoulder sources and baseline.');
  const settings = JSON.parse((await read(root!, config.settings)).toString('utf8'));
  if (settings.method !== 'native-s-hip-root-plan' || !isDeepStrictEqual(settings.geometry, southHipPlanGeometry)) throw new Error('S hip planning contours changed.');
  await read(root!, config.prompts);
  const guide = decodePng(await read(root!, config.guide));
  const [bodyBytes, torsoBytes, rightBytes, leftBytes] = await Promise.all([read(assets!, baseline.wholeBody), ...[0,3,4].map(i => read(resolve(assets!, 'body/parts-v1'), baseline.parts[i]!))]);
  const body = decodePng(bodyBytes!), torso = decodePng(torsoBytes!), legs = [decodePng(rightBytes!), decodePng(leftBytes!)];
  if ([body, torso, ...legs].some(im => im.width !== 1024 || im.height !== 1536) || guide.width !== 1024 || guide.height !== 1024 || sha256(bodyBytes!) !== approval.bodySha256) throw new Error('Accepted native S body and square native-crop guide required.');
  // Verify the guide is an exact crop at (0,512), with only original upper-leg pixels.
  for (let y = 0; y < 1024; y++) for (let x = 0; x < 1024; x++) {
    const p = (y * 1024 + x) * 4, native = ((y + 512) * 1024 + x) * 4;
    const owner = y < 408 ? legs.find(leg => leg.data[native + 3]) : undefined;
    if (guide.data.subarray(p, p + 4).some((v, c) => v !== (owner?.data[native + c] ?? 0))) throw new Error('Hip guide must preserve original upper-leg RGBA without transforms.');
  }
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-hip-plan-baseline-'));
  try {
    const actual = await prepareShoulderReview({ ...options, sourceDirectory: resolve(assets!, 'body/shoulders-v1'), outputDirectory: temporary });
    if (actual.configSha256 !== config.shoulderConfiguration.sourceSha256 || actual.bodySha256 !== approval.bodySha256 || actual.bareSha256 !== approval.bareSha256 || actual.fitSha256 !== approval.fitSha256) throw new Error('Actual approved shoulder/body/head/hair composition must remain exact.');
  } finally { await rm(temporary, { recursive: true, force: true }); }
  const panels = [checkerPreview(body, 'S'), checkerPreview(body, 'S'), checkerPreview(body, 'S')], counts = [0,0];
  for (const [side, polygon] of [southHipPlanGeometry.right, southHipPlanGeometry.left].entries()) for (let y = 667; y < 739; y++) for (let x = 368; x < 653; x++) {
    const p = (y * 1024 + x) * 4;
    if (legs[side]!.data[p + 3] || torso.data[p + 3]! < 245) continue;
    let coverage = 0;
    for (let sy = 0; sy < 8; sy++) for (let sx = 0; sx < 8; sx++) if (pointInside(x + (sx + .5) / 8, y + (sy + .5) / 8, polygon)) coverage++;
    if (!coverage) continue;
    const alpha = .65 * coverage / 64, colour = side === 0 ? [0,200,255] : [255,160,0];
    for (let c = 0; c < 3; c++) panels[side + 1]!.data[p + c] = Math.round(panels[side + 1]!.data[p + c]! * (1 - alpha) + colour[c]! * alpha);
    counts[side]!++;
  }
  if (counts.some(n => n < 2000)) throw new Error('Both planned S thigh roots need nontrivial same-side torso overlap.');
  const overview = blankImage(1152, 192);
  for (const [i, panel] of panels.entries()) {
    const crop = blankImage(384, 192);
    for (let row = 0; row < 192; row++) crop.data.set(panel.data.subarray(((624 + row) * 1024 + 320) * 4, ((624 + row) * 1024 + 704) * 4), row * 384 * 4);
    drawRgba(overview, crop, i * 384, 0);
  }
  const png = encodePng(overview), viewer = Buffer.from(`<!doctype html><html lang="en"><meta charset="utf-8"><title>S hip-root authoring plan</title><style>body{margin:24px;background:#202124;color:#eee;font:16px system-ui}p{max-width:85ch;line-height:1.5}figure{margin:0;overflow:auto}img{width:1152px;max-width:none}figcaption{display:grid;grid-template-columns:repeat(3,384px);margin:8px 0}</style><h1>S hip-root plan — no new artwork</h1><p>The image generator rejected both attempts. These coloured overlays show proposed coverage only. Original anatomy, everyday underwear and the provisional heel-oriented leg/foot study remain unchanged.</p><figure><figcaption><span>Approved S body</span><span>Cyan: physical-right root plan</span><span>Orange: physical-left root plan</span></figcaption><img src="hip-root-plan.png" width="1152" height="192" alt="Approved S body and separately proposed right and left thigh-root coverage"></figure><p>Both roots would need pose masks. This is not generated anatomy, a completed joint or an approved rig. Further artwork is required before root-completion review.</p></html>\n`);
  const report = { schemaVersion: 1, id: config.id, configSha256: sha256(bytes), status: config.status, supportedReviewDirections: ['S'], target: 'detailed', sourcePose: config.sourcePose,
    generatedArtProduced: false, selectedStudy: null, proposedRootPixels: { right: counts[0], left: counts[1] }, plannedGeometryOnly: true, sourceLegsChanged: false, sourceFeetChanged: false, shoulderApproval: config.shoulderApproval,
    bodySha256: approval.bodySha256, bareSha256: approval.bareSha256, fitSha256: approval.fitSha256, approvedCompositionVerified: true, attempts: config.attempts,
    published: false, paletteReady: false, productionAnatomyApproved: false, concealedJointsApproved: false, separateUnderwearAuthored: false, footwearCompatibilityApproved: false, tposeApproved: false, finalStep6CAccepted: false, step6DStarted: false,
    nextRequired: 'Independently authored S proximal-thigh artwork matching the native guide, followed by source construction and actual pose-mask fit review.',
    outputs: [{ path: 'inspection/hip-root-plan.png', sha256: sha256(png) }], interactiveInspection: { path: 'inspection/hip-root-plan.html', sha256: sha256(viewer) } };
  for (const [path, digest] of inputs) if (sha256(await readFile(path)) !== digest) throw new Error('Hip-plan input changed during review.');
  for (const file of [{ path: report.outputs[0]!.path, bytes: png }, { path: report.interactiveInspection.path, bytes: viewer }, { path: 'metadata.json', bytes: Buffer.from(JSON.stringify(report, null, 2) + '\n') }]) { await mkdir(dirname(resolve(out, file.path)), { recursive: true }); await writeFile(resolve(out, file.path), file.bytes); }
  return report;
}
