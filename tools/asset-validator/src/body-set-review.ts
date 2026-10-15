import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { z } from 'zod';
import { DIRECTIONS, DIRECTION_PLANE_ORDER } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { checkerPreview } from './inspection';
import { sha256 } from './reference-import';
import { prepareBodyReview } from './body-review';
import { prepareNorthBodyReview } from './body-north-review';
import { prepareFrontDiagonalBodyReview, prepareProfileBodyReview } from './body-profile-review';
import { prepareBackDiagonalBodyReview } from './body-back-diagonal-review';
import { prepareSouthwestClothingReview, southwestClothingReviewSchema } from './body-clothing-review';

export const bodySetFacings = {
  N: { directory: 'body/north-v1', configuration: 'authoring.json', approval: 'review-fit-v1.json', decision: 'approved-independent-n-body-study' },
  NE: { directory: 'body/back-diagonals-v1', configuration: 'authoring-ne-v2.json', approval: 'review-fit-ne-v2.json', decision: 'approved-independent-ne-body-study-and-proportion-refit' },
  E: { directory: 'body/profiles-v1', configuration: 'authoring.json', approval: 'review-fit-v1.json', decision: 'approved-independent-e-profile-body-study' },
  SE: { directory: 'body/front-diagonals-v1', configuration: 'authoring-v2.json', approval: 'review-fit-v2.json', decision: 'approved-independent-se-body-study-with-native-hand-repair' },
  S: { directory: 'body/reference-v1', configuration: 'authoring-v6.json', approval: 'review-fit-v6.json', decision: 'approved-s-body-head-hair-study-fit' },
  SW: { directory: 'body/front-diagonals-v1', configuration: 'authoring-sw-v4.json', approval: 'review-fit-sw-v4.json', decision: 'approved-independent-sw-body-study-and-head-hair-contours' },
  W: { directory: 'body/profiles-v1', configuration: 'authoring-w-v2.json', approval: 'review-fit-w-v2.json', decision: 'approved-independent-w-profile-body-study-with-local-hair-repair' },
  NW: { directory: 'body/back-diagonals-v1', configuration: 'authoring-nw-v1.json', approval: 'review-fit-nw-v1.json', decision: 'approved-independent-nw-body-study-and-posterior-fit' },
} as const;
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const source = z.string().regex(/^(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+$/).refine(p => p.split('/').every(s => s !== '.' && s !== '..'));
const pin = z.strictObject({ source, sourceSha256: hash });
const pack = z.strictObject({ directory: source, configuration: pin, approval: pin });
export const bodySetSelectionSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('body.assembly.review.v1'), target: z.literal('detailed'),
  scope: z.literal('all-eight-whole-body-studies'), published: z.literal(false), paletteReady: z.literal(false),
  frames: z.strictObject({ N: pack, NE: pack, E: pack, SE: pack, S: pack, SW: pack, W: pack, NW: pack }),
  southwestClothingCandidate: pin.extend({ source: z.literal('authoring-sw-v5.json') }).optional(),
  southwestClothingApproval: pin.extend({ source: z.literal('review-fit-sw-v5.json') }).optional(),
  reviewRequired: z.array(z.string().min(1)).min(1),
});
const approvalSchema = z.object({
  direction: z.enum(DIRECTIONS), target: z.literal('detailed'), configuration: source,
  configurationSha256: hash, decision: z.string(), currentStudyFitApproved: z.literal(true),
  bareSha256: hash, fitSha256: hash, published: z.literal(false), productionAnatomyApproved: z.literal(false),
  tposeApproved: z.literal(false), finalStep6CAccepted: z.literal(false),
});
const inside = (base: string, path: string) => { const p = relative(base, path); return p === '' || (!isAbsolute(p) && p !== '..' && !p.startsWith('../')); };
const missing = (e: unknown) => (e as NodeJS.ErrnoException).code === 'ENOENT';

export interface BodySetReviewOptions {
  readonly selectionDirectory: string;
  readonly assetDirectory: string;
  readonly referenceDirectory: string;
  readonly outputDirectory: string;
  readonly selectionFile?: 'review-selection.json' | 'review-selection-v2.json' | 'review-selection-v3.json';
}

/** Rebuild each independently approved native composition; no runtime assets or new artwork. */
export async function prepareBodySetReview(options: BodySetReviewOptions) {
  const [root, assets, refs] = await Promise.all([options.selectionDirectory, options.assetDirectory, options.referenceDirectory].map(p => realpath(p)));
  const out = resolve(options.outputDirectory), inputs = new Map<string, string>();
  if ([root!, assets!, refs!].some(p => inside(p, out) || inside(out, p))) throw new Error('Body-set output and inputs must be disjoint.');
  for (let p = out; ; p = dirname(p)) {
    try { if (await realpath(p) !== p) throw new Error('Body-set output cannot traverse symlinks.'); break; }
    catch (e) { if (!missing(e)) throw e; }
  }
  for (const path of ['overview.png', 'anatomy-overview.png', 'inspection/body-review.html', 'metadata.json']) for (let p = resolve(out, path); inside(out, p); p = dirname(p)) {
    try { if ((await lstat(p)).isSymbolicLink()) throw new Error('Body-set output symlinks forbidden.'); }
    catch (e) { if (!missing(e)) throw e; }
    if (p === out) break;
  }
  const read = async (base: string, p: { source: string; sourceSha256?: string }) => {
    const path = resolve(base, p.source);
    if (!inside(base, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error('Ordinary pinned body-set inputs required.');
    const bytes = await readFile(path), digest = sha256(bytes);
    if (p.sourceSha256 && digest !== p.sourceSha256) throw new Error('Body-set pinned input changed: ' + p.source);
    inputs.set(path, digest); return bytes;
  };
  const selectionFile = options.selectionFile ?? 'review-selection-v3.json';
  const selectionBytes = await read(root!, { source: selectionFile });
  const selection = bodySetSelectionSchema.parse(JSON.parse(selectionBytes.toString('utf8')));
  const approvals = new Map<(typeof DIRECTIONS)[number], z.infer<typeof approvalSchema>>();
  for (const direction of DIRECTIONS) {
    const selected = selection.frames[direction], expected = bodySetFacings[direction];
    if (selected.directory !== expected.directory || selected.configuration.source !== expected.configuration || selected.approval.source !== expected.approval) throw new Error(direction + ': independently authored selected body pack required.');
    const base = resolve(assets!, selected.directory);
    const config = await read(base, selected.configuration), approval = approvalSchema.parse(JSON.parse((await read(base, selected.approval)).toString('utf8')));
    if (approval.direction !== direction || approval.configuration !== selected.configuration.source || approval.configurationSha256 !== sha256(config) || approval.decision !== expected.decision) throw new Error(direction + ': body approval must match its selected configuration and facing.');
    approvals.set(direction, approval);
  }
  let clothingApproval: z.infer<typeof approvalSchema> | undefined;
  if (selection.southwestClothingApproval) {
    if (!selection.southwestClothingCandidate) throw new Error('SW clothing approval requires an explicit selected configuration.');
    clothingApproval = approvalSchema.parse(JSON.parse((await read(resolve(assets!, 'body/front-diagonals-v1'), selection.southwestClothingApproval)).toString('utf8')));
    if (clothingApproval.direction !== 'SW' || clothingApproval.configuration !== selection.southwestClothingCandidate.source || clothingApproval.configurationSha256 !== selection.southwestClothingCandidate.sourceSha256 || clothingApproval.decision !== 'approved-independent-sw-body-study-and-clothing-colour') throw new Error('SW clothing approval must match the selected revision and facing.');
  }
  if (selection.southwestClothingCandidate) {
    const candidate = southwestClothingReviewSchema.parse(JSON.parse((await read(resolve(assets!, 'body/front-diagonals-v1'), selection.southwestClothingCandidate)).toString('utf8')));
    if (JSON.stringify(candidate.previous) !== JSON.stringify(selection.frames.SW.configuration) || JSON.stringify(candidate.previousApproval) !== JSON.stringify(selection.frames.SW.approval)) throw new Error('SW clothing candidate must retain the individually approved selected baseline.');
  }
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-body-set-'));
  try {
    const overview = blankImage(4096, 3072), anatomy = blankImage(4096, 3072), frames = [];
    for (const [index, direction] of DIRECTIONS.entries()) {
      const selected = selection.frames[direction], expected = bodySetFacings[direction];
      const component = { sourceDirectory: resolve(assets!, selected.directory), assetDirectory: assets!, referenceDirectory: refs!, outputDirectory: resolve(temporary, direction) };
      const report = direction === 'S' ? await prepareBodyReview({ ...component, configFile: 'authoring-v6.json' })
        : direction === 'N' ? await prepareNorthBodyReview(component)
          : direction === 'E' ? await prepareProfileBodyReview({ ...component, configFile: 'authoring.json' })
            : direction === 'W' ? await prepareProfileBodyReview({ ...component, configFile: 'authoring-w-v2.json' })
              : direction === 'SE' ? await prepareFrontDiagonalBodyReview({ ...component, configFile: 'authoring-v2.json' })
                : direction === 'SW' ? selection.southwestClothingCandidate ? await prepareSouthwestClothingReview(component) : await prepareFrontDiagonalBodyReview({ ...component, configFile: 'authoring-sw-v4.json' })
                  : await prepareBackDiagonalBodyReview({ ...component, configuration: direction === 'NE' ? 'authoring-ne-v2.json' : 'authoring-nw-v1.json' });
      const accepted = approvals.get(direction)!;
      const candidate = direction === 'SW' && selection.southwestClothingCandidate;
      const baselineMatches = candidate ? 'baselineConfigSha256' in report && report.baselineConfigSha256 === accepted.configurationSha256 && report.baselineBareSha256 === accepted.bareSha256 && report.baselineFitSha256 === accepted.fitSha256 : report.configSha256 === selected.configuration.sourceSha256 && report.configuration === expected.configuration && report.bareSha256 === accepted.bareSha256 && report.fitSha256 === accepted.fitSha256;
      if (!baselineMatches || report.supportedReviewDirections.length !== 1 || report.supportedReviewDirections[0] !== direction || (candidate && report.configSha256 !== candidate.sourceSha256)) throw new Error(direction + ': actual body composition must match its individual approval or the explicitly selected clothing-only candidate.');
      if (candidate && clothingApproval && (report.bareSha256 !== clothingApproval.bareSha256 || report.fitSha256 !== clothingApproval.fitSha256)) throw new Error('SW clothing composition must match its explicit approval.');
      const [fitBytes, bareBytes] = await Promise.all(['', '-anatomy'].map(suffix => readFile(resolve(component.outputDirectory, `fit/${direction}${suffix}.png`))));
      if (sha256(fitBytes!) !== report.fitSha256 || sha256(bareBytes!) !== report.bareSha256) throw new Error(direction + ': native body files must match their verified composition hashes.');
      const fit = decodePng(fitBytes!), bare = decodePng(bareBytes!);
      if ([fit, bare].some(im => im.width !== 1024 || im.height !== 1536)) throw new Error('Native 1024x1536 body frames required.');
      const x = index % 4 * 1024, y = Math.floor(index / 4) * 1536;
      drawRgba(overview, checkerPreview(fit, direction), x, y);
      drawRgba(anatomy, checkerPreview(bare, direction), x, y);
      const bounds = (im: RgbaImage) => {
        let left = 1024, right = -1, top = 1536, bottom = -1;
        for (let p = 0; p < im.data.length; p += 4) if (im.data[p + 3]! >= 8) {
          const xx = p / 4 % 1024, yy = Math.floor(p / 4096);
          left = Math.min(left, xx); right = Math.max(right, xx); top = Math.min(top, yy); bottom = Math.max(bottom, yy);
        }
        return { left, top, right, bottom };
      };
      frames.push({ direction, configuration: candidate || selected.configuration, approval: candidate && selection.southwestClothingApproval || selected.approval, directory: selected.directory, fitSha256: report.fitSha256, bareSha256: report.bareSha256, approvedBaselineFitSha256: accepted.fitSha256, approvedBaselineBareSha256: accepted.bareSha256, compositionOrder: DIRECTION_PLANE_ORDER[direction], individualFitApproved: !candidate || Boolean(clothingApproval), anatomyBounds: bounds(bare), fitBounds: bounds(fit) });
    }
    const pending = [{ path: 'overview.png', bytes: encodePng(overview) }, { path: 'anatomy-overview.png', bytes: encodePng(anatomy) }];
    const viewer = Buffer.from(bodySetViewer(Boolean(selection.southwestClothingCandidate) && !clothingApproval));
    const report = {
      schemaVersion: 1, id: selection.id, scope: selection.scope, selectionFile, selectionSha256: sha256(selectionBytes), status: 'needs-cross-facing-human-review',
      supportedReviewDirections: DIRECTIONS, individualFitsMatchApprovals: !selection.southwestClothingCandidate || Boolean(clothingApproval), pendingCandidateDirections: selection.southwestClothingCandidate && !clothingApproval ? ['SW'] : [], crossFacingBodySetApproved: false,
      newArtwork: Boolean(selection.southwestClothingCandidate) && !clothingApproval, published: false, paletteReady: false, productionAnatomyApproved: false, bodyOcclusionVerified: false,
      concealedJointsApproved: false, separateUnderwearAuthored: false, footwearCompatibilityApproved: false, tposeApproved: false, finalStep6CAccepted: false, step6DStarted: false,
      grid: { columns: 4, rows: 2, cellWidth: 1024, cellHeight: 1536, directionOrder: DIRECTIONS, sampling: 'native-copy-no-transforms' },
      posteriorFrontalFeaturesHidden: ['N', 'NE', 'NW'], frames, reviewRequired: selection.reviewRequired,
      outputs: pending.map(p => ({ path: p.path, sha256: sha256(p.bytes) })),
      interactiveInspection: { path: 'inspection/body-review.html', sha256: sha256(viewer) },
      storage: 'Two native sheets and one local viewer; component fits are validated in temporary storage and removed afterward.',
    };
    const files = [...pending, { path: report.interactiveInspection.path, bytes: viewer }, { path: 'metadata.json', bytes: Buffer.from(JSON.stringify(report, null, 2) + '\n') }];
    // Validate every destination before writing any output.
    for (const file of files) for (let p = resolve(out, file.path); inside(out, p); p = dirname(p)) {
      try { if ((await lstat(p)).isSymbolicLink()) throw new Error('Body-set output symlinks forbidden.'); }
      catch (e) { if (!missing(e)) throw e; }
      if (p === out) break;
    }
    for (const [path, digest] of inputs) if (sha256(await readFile(path)) !== digest) throw new Error('Body-set input changed during review.');
    for (const file of files) { const path = resolve(out, file.path); await mkdir(dirname(path), { recursive: true }); await writeFile(path, file.bytes); }
    return report;
  } finally { await rm(temporary, { recursive: true, force: true }); }
}

function bodySetViewer(clothingCandidate: boolean) {
  return `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Eight-facing body review</title>
<style>body{margin:20px;background:#202124;color:#eee;font:16px system-ui}label{display:inline-block;margin:0 20px 12px 0}select{font:inherit;padding:5px}#scroll{overflow:auto;max-height:80vh;border:1px solid #666}#view{background-repeat:no-repeat}p{max-width:80ch;line-height:1.5}</style>
<h1>Eight-facing body review</h1>
<p>${clothingCandidate ? 'SW has a clothing colour correction awaiting approval. The other seven fits retain their individual approvals.' : 'Individual studies are approved.'} This combined review awaits approval. Compare proportions, head/neck/hair joins, hands and feet. Each facing retains its authored pose and foot height.</p>
<label>View <select id="mode"><option value="overview.png">With hair</option><option value="anatomy-overview.png">Anatomy</option></select></label>
<label>Facing <select id="direction"><option value="all">All eight</option>${DIRECTIONS.map(d => `<option value="${d}">${d}</option>`).join('')}</select></label>
<label>Zoom <select id="zoom"><option value="0.25">25%</option><option value="0.5">50%</option><option value="1">100% native</option></select></label>
<div id="scroll"><div id="view" role="img" aria-label="Eight-facing body review"></div></div>
<p id="caption"></p>
<script>
const directions=${JSON.stringify(DIRECTIONS)},mode=document.getElementById('mode'),direction=document.getElementById('direction'),zoom=document.getElementById('zoom'),view=document.getElementById('view');
function update(){const scale=Number(zoom.value),index=directions.indexOf(direction.value),all=index<0;view.style.width=(all?4096:1024)*scale+'px';view.style.height=(all?3072:1536)*scale+'px';view.style.backgroundImage='url(../'+mode.value+')';view.style.backgroundSize=4096*scale+'px '+3072*scale+'px';view.style.backgroundPosition=all?'0px 0px':-(index%4)*1024*scale+'px '+-Math.floor(index/4)*1536*scale+'px';const caption=(all?'N / NE / E / SE, then S / SW / W / NW':direction.value)+' — '+(mode.value==='overview.png'?'with hair':'anatomy')+' — '+Math.round(scale*100)+'%';document.getElementById('caption').textContent=caption;view.setAttribute('aria-label',caption);}
for(const input of[mode,direction,zoom])input.addEventListener('change',update);update();
</script></html>\n`;
}
