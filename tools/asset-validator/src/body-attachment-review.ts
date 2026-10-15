import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { ANCHORS, anchorSchema } from '@character-studio/core';
import { decodePng } from '@character-studio/render-utils';
import { z } from 'zod';
import { bodyPartsReviewSchema } from './body-parts-review';
import type { BodyPartsReviewOptions } from './body-parts-review';
import { prepareShoulderReview } from './body-shoulder-review';
import { sha256 } from './reference-import';

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const pin = z.strictObject({ source: z.string().regex(/^(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+$/).refine(p => p.split('/').every(s => s !== '.' && s !== '..')), sourceSha256: hash });
const point = z.strictObject({ x: z.number().int().min(0).max(1023), y: z.number().int().min(0).max(1535) });
export const attachmentReviewSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('body.attachments.s.v1'), target: z.literal('detailed'), direction: z.literal('S'), sourcePose: z.literal('tpose-study'), status: z.literal('draft-needs-human-review'),
  nativeSize: z.strictObject({ width: z.literal(1024), height: z.literal(1536) }), baselineConfiguration: pin, shoulderConfiguration: pin, shoulderApproval: pin,
  landmarks: z.array(z.strictObject({ id: anchorSchema, position: point.nullable(), evidence: z.enum(['manual-registration', 'measured-alpha-bound', 'unavailable-concealed']), definition: z.string().min(15).max(240) })).length(ANCHORS.length),
  published: z.literal(false), productionRigApproved: z.literal(false), concealedJointsApproved: z.literal(false), footwearCompatibilityApproved: z.literal(false), finalStep6CAccepted: z.literal(false),
}).superRefine((c, ctx) => {
  if (new Set(c.landmarks.map(p => p.id)).size !== ANCHORS.length) ctx.addIssue({ code: 'custom', message: 'Each semantic anchor needs one candidate or an explicit unavailable entry.' });
  for (const a of c.landmarks) {
    const hip = a.id === 'hip_left' || a.id === 'hip_right';
    if (hip ? a.position !== null || a.evidence !== 'unavailable-concealed' : !a.position || a.evidence !== (a.id === 'ground_baseline' ? 'measured-alpha-bound' : 'manual-registration')) ctx.addIssue({ code: 'custom', message: 'Concealed hips must stay unavailable; remaining native registrations require evidence.' });
  }
});
const inside = (base: string, path: string) => { const p = relative(base, path); return p === '' || (!isAbsolute(p) && p !== '..' && !p.startsWith('../')); };
const missing = (error: unknown) => (error as NodeJS.ErrnoException).code === 'ENOENT';
const escape = (s: string) => s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);

/** A read-only native landmark study. It intentionally cannot produce a complete production anchor table. */
export async function prepareAttachmentReview(options: BodyPartsReviewOptions & { reviewDirectory: string }) {
  const [root, assets, refs, reviews] = await Promise.all([options.sourceDirectory, options.assetDirectory, options.referenceDirectory, options.reviewDirectory].map(p => realpath(p)));
  const out = resolve(options.outputDirectory), inputs = new Map<string, string>();
  if ([root!, assets!, refs!].some(p => inside(p, out) || inside(out, p)) || inside(out, reviews!)) throw new Error('Attachment outputs and source inputs must be disjoint.');
  for (const name of ['inspection/S-attachments.html', 'metadata.json']) for (let p = resolve(out, name); ; p = dirname(p)) {
    try { if ((await lstat(p)).isSymbolicLink() || await realpath(p) !== p) throw new Error('Attachment output symlinks forbidden.'); } catch (error) { if (!missing(error)) throw error; }
    if (dirname(p) === p) break;
  }
  const read = async (base: string, p: { source: string; sourceSha256?: string }) => {
    const path = resolve(base, p.source);
    if (!inside(base, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error('Ordinary pinned attachment inputs required.');
    const bytes = await readFile(path), digest = sha256(bytes);
    if (p.sourceSha256 && digest !== p.sourceSha256) throw new Error('Attachment pinned input changed: ' + p.source);
    inputs.set(path, digest); return bytes;
  };
  const configBytes = await read(root!, { source: 'authoring.json' }), config = attachmentReviewSchema.parse(JSON.parse(configBytes.toString('utf8')));
  if (config.baselineConfiguration.source !== 'body/parts-v1/authoring.json' || config.shoulderConfiguration.source !== 'body/shoulders-v1/authoring.json' || config.shoulderApproval.source !== 'body/shoulders-v1/review-fit-v1.json') throw new Error('Attachment review requires the accepted S configurations.');
  const baseline = bodyPartsReviewSchema.parse(JSON.parse((await read(assets!, config.baselineConfiguration)).toString('utf8')));
  await read(assets!, config.shoulderConfiguration);
  const approval = z.object({ direction: z.literal('S'), decision: z.literal('approved-s-concealed-shoulder-root-study'), configurationSha256: hash, currentStudyRootsApproved: z.literal(true), bodySha256: hash, bareSha256: hash, fitSha256: hash }).parse(JSON.parse((await read(assets!, config.shoulderApproval)).toString('utf8')));
  if (approval.configurationSha256 !== config.shoulderConfiguration.sourceSha256) throw new Error('S shoulder approval does not match the selected configuration.');
  const scratch = await mkdtemp(resolve(tmpdir(), 'character-attachment-review-'));
  try {
    const actual = await prepareShoulderReview({ ...options, sourceDirectory: resolve(assets!, 'body/shoulders-v1'), outputDirectory: scratch });
    if (actual.configSha256 !== config.shoulderConfiguration.sourceSha256 || ['bodySha256', 'bareSha256', 'fitSha256'].some(k => actual[k as 'bodySha256'] !== approval[k as 'bodySha256'])) throw new Error('Actual S body/head/hair shoulder composition changed.');
  } finally { await rm(scratch, { recursive: true, force: true }); }
  const body = decodePng(await read(assets!, baseline.wholeBody)), head = decodePng(await read(assets!, baseline.head));
  const byId = new Map(config.landmarks.map(a => [a.id, a])), at = (id: typeof ANCHORS[number]) => byId.get(id)!.position!;
  const centre = at('waist_center').x;
  for (const a of config.landmarks) if (a.position && a.id !== 'ground_baseline') {
    const { x, y } = a.position, support = a.id === 'head_center' ? head : body;
    if (support.data[(y * 1024 + x) * 4 + 3]! < 128) throw new Error('Attachment candidate must be supported by its approved head/body pixels: ' + a.id);
    if ((a.id.endsWith('_right') && x >= centre) || (a.id.endsWith('_left') && x <= centre)) throw new Error('S physical-side attachment identity is reversed.');
  }
  if (!(at('head_center').y < at('neck_base').y && at('neck_base').y < at('chest_center').y && at('chest_center').y < at('waist_center').y && at('waist_center').y < at('foot_left').y && at('waist_center').y < at('foot_right').y)) throw new Error('S vertical attachment order is invalid.');
  let baselineY = -1;
  for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) if (body.data[(y * 1024 + x) * 4 + 3]! >= 128) baselineY = y;
  if (at('ground_baseline').y !== baselineY || at('foot_left').y >= baselineY || at('foot_right').y >= baselineY) throw new Error('Foot registrations and measured ground baseline disagree.');
  const dependencies = [
    { source: 'parts-v1/fit/S-anatomy.png', sourceSha256: approval.bareSha256, label: 'Approved anatomy + candidate landmarks' },
    { source: 'shoulders-v1/fit/S.png', sourceSha256: approval.fitSha256, label: 'Approved hair fit + same candidate landmarks' },
  ];
  for (const dep of dependencies) await read(reviews!, dep);
  const colour = (id: string) => id.endsWith('_right') ? '#ffac35' : id.endsWith('_left') ? '#32e58c' : '#00d5ff';
  const marks = config.landmarks.map((a, i) => {
    if (!a.position) return '';
    const { x, y } = a.position;
    if (a.id === 'ground_baseline') return `<path d="M0 ${y}H1024" stroke="#fff000" stroke-width="2" stroke-dasharray="10 6"/><text x="12" y="${y - 8}" fill="#fff000">${i + 1} ground baseline</text>`;
    return `<g stroke="${colour(a.id)}" stroke-width="2"><title>${escape(a.id + ': ' + a.definition)}</title><circle cx="${x}" cy="${y}" r="10" fill="none"/><path d="M${x - 15} ${y}h30 M${x} ${y - 15}v30"/><text x="${x + 16}" y="${y - 12}" stroke="#111" stroke-width="3" paint-order="stroke" fill="${colour(a.id)}">${i + 1}</text></g>`;
  }).join('');
  const panels = dependencies.map(dep => {
    const path = relative(resolve(out, 'inspection'), resolve(reviews!, dep.source)).split('\\').join('/');
    return `<figure><figcaption>${escape(dep.label)}</figcaption><svg viewBox="0 0 1024 1536" width="1024" height="1536" role="img" aria-label="${escape(dep.label)}"><defs><pattern id="checker-${dep.source.startsWith('parts') ? 'a' : 'b'}" width="48" height="48" patternUnits="userSpaceOnUse"><path fill="#ddd" d="M0 0h48v48H0z"/><path fill="#aaa" d="M0 0h24v24H0z M24 24h24v24H24z"/></pattern></defs><path fill="url(#checker-${dep.source.startsWith('parts') ? 'a' : 'b'})" d="M0 0h1024v1536H0z"/><image href="${escape(path)}" width="1024" height="1536"/>${marks}</svg></figure>`;
  }).join('');
  const rows = config.landmarks.map((a, i) => `<tr><td>${i + 1}</td><td>${a.id}</td><td>${a.position ? `${a.position.x}, ${a.position.y}` : 'Unavailable'}</td><td>${escape(a.definition)}</td></tr>`).join('');
  const page = Buffer.from(`<!doctype html><html lang="en"><meta charset="utf-8"><title>S attachment candidates</title><style>body{margin:24px;background:#202124;color:#eee;font:16px system-ui}p{max-width:95ch;line-height:1.5}.panels{display:flex;gap:24px;overflow:auto}figure{margin:0}figcaption{padding:12px 0}svg{display:block;flex:none;font:20px system-ui}table{border-collapse:collapse;max-width:1100px;margin:24px 0}td,th{text-align:left;padding:8px;border:1px solid #555}</style><h1>S attachment candidates — needs review</h1><p>Orange: physical right (screen left). Green: physical left (screen right). Cyan: central registrations. Yellow: measured image baseline. Markers use native 1024 × 1536 coordinates. Each number matches the table below.</p><p>These are registration candidates, not anatomical rotation pivots. Hip joints remain unavailable until their concealed geometry is authored. Foot markers identify ankles; the current heel-oriented feet do not establish barefoot or arbitrary shoe compatibility. No complete production rig is exported.</p><div class="panels">${panels}</div><table><thead><tr><th>#</th><th>Landmark</th><th>Native x, y</th><th>Meaning</th></tr></thead><tbody>${rows}</tbody></table><p>The artwork is referenced from the existing approved reviews, without extra PNG copies or source edits. Both panels show identical landmarks. Step 6C remains open.</p></html>\n`);
  const report = { schemaVersion: 1, id: config.id, direction: config.direction, target: config.target, sourcePose: config.sourcePose, status: config.status, configSha256: sha256(configBytes), landmarks: config.landmarks,
    availableCandidates: config.landmarks.filter(a => a.position).length, unavailableAnchors: config.landmarks.filter(a => !a.position).map(a => a.id), baselineAlphaThreshold: 128, measuredBaselineY: baselineY,
    approvedCompositionVerified: true, bodySha256: approval.bodySha256, bareSha256: approval.bareSha256, fitSha256: approval.fitSha256, dependencies,
    completeAnchorTableProduced: false, published: false, productionRigApproved: false, concealedJointsApproved: false, footwearCompatibilityApproved: false, finalStep6CAccepted: false, step6DStarted: false,
    outputs: [{ path: 'inspection/S-attachments.html', sha256: sha256(page) }] };
  for (const [path, digest] of inputs) if (sha256(await readFile(path)) !== digest) throw new Error('Attachment input changed during review.');
  for (const file of [{ path: report.outputs[0]!.path, bytes: page }, { path: 'metadata.json', bytes: Buffer.from(JSON.stringify(report, null, 2) + '\n') }]) { await mkdir(dirname(resolve(out, file.path)), { recursive: true }); await writeFile(resolve(out, file.path), file.bytes); }
  return report;
}
