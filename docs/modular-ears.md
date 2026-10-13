# Step 6C — separate S human ears

## E/W ear/root approval — 2026-10-13

The user approved revision 1 and requested cleanup, a local commit and continued
work. `profiles-v1/review-fit-v1.json` pins accepted E/right and W/left ears,
local ear-free root RGBA, masks and exact approved facial/hair fit hashes.
This is a standing-reference checkpoint; source configs/artwork remain unchanged.
Next separate both native SE/SW ears/collars and bounded ear-free root skin over
accepted diagonal anatomy/facial/hair fits. Preserve all existing source pixels
and anchors; human assembly must reconstruct exactly, while new concealed skin
needs visual review. Other facings/variants, N review, hidden surfaces, materials,
body/clothing, T-pose, independent pixel art and final Step 6C remain unfinished.
Step 6D has not started; earlier selected/pending-approval statements are historical.


## Independent E/W ear/root candidate — 2026-10-13

Commit `2b267ff` records the approved E/W facial checkpoint. Cleanup removed
26 regenerated build files, preserving current reviews and pinned sources.
`ears/human-v1/profiles-v1/authoring.json` is the next unapproved candidate;
export it with `pnpm ears:review:profiles`.

Original E/right and W/left ear/collar RGBA are independently retained in native
E x510–543/y166–212 and W x472–506/y172–220 windows. Origins remain E (558,165),
W (451,176), with all parts drawn at (0,0). Built-in imagegen supplies same-facing
ear-erasure studies from the exact native head guides; `prompts.json` pins
prompts, roles and retained local inputs. Only manually traced interior root
polygons supply study RGBA; original head pixels, alpha and contour remain exact
everywhere else. The initial RGB-only draft retained old colours in partial-alpha
ear-rim pixels and was discarded before review. Current RGBA ownership replaces
those marks with complete study skin. Generated background and all unselected
changes are excluded locally; no global colour key, transforms or source overwrite.

Human-specific retention masks clear the whole ear/collar windows before original
ears draw in the core ears plane. This reconstructs the accepted head RGBA and
full approved facial/neck/front/rear-hair fit exactly, including partial alpha.
Ear-free previews use the full underlay without human retention. Future ear/size/
ancestry variants require their own geometry, compatible attachments and masks.

Review `ears/human-v1/profiles/anatomy-overview.png`: E above W; approved skin /
new ear-free root skin / original ear-collar / reconstructed skin. Column two
contains the new anatomy needing visual review of shade and local joins. Native
6x comparisons are in `inspection/E-root-comparison.png` and the W equivalent.
`overview.png` shows reference / approved facial fit / identical human-ear fit.
Cleanup protects this review and all three current facial reviews. Guide/partition
scripts replay only in scratch. Other ear facings/variants, complete concealed
surfaces, expressions/materials, N review, real body/clothing/hair occlusion,
production T-pose, independent pixel art and final Step 6C remain unfinished.
Step 6D has not started. Earlier selected/pending-approval statements are history.

Validation: asset-validator typecheck, root lint (zero warnings), JavaScript/
declaration build and the profile-ear CLI passed. The existing ear-review file's
new E/W public workflow and cleanup workflow passed (two tests, 71.91 seconds;
unrelated S workflow skipped). They cover actual core composition, complete
local study RGBA, changed partial-alpha ear pixels, preserved outside-mask alpha,
exact accepted head/fit reconstruction, deterministic exports, immutable inputs
and rejection of re-pinned out-of-mask/ear/side edits. An initial unused authoring
variable was fixed. A later test's assumption of alpha 255 for every replaced
pixel was corrected: complete study RGBA may itself retain partial alpha.
All 601 prior artwork/reference hashes and mtimes stay unchanged; only the source
README text changed intentionally. Eleven partition/config outputs and both native
guides replayed byte-for-byte in scratch. All 137 current facial/ear review PNGs
and the S viewer hashes verified. See `profiles-v1/fit-audit.json`. Full app build
and studio browser E2E were not rerun for this offline increment. Generated build
caches are cleared; all current reviews, references and pinned sources remain.


## Next separate E/W ear increment — 2026-10-13

The user approved E/W visible facial revision 1, pinned in
`face/reference-v1/profiles-v1/review-fit-v1.json`, and requested cleanup, a local
commit and continued work. The next bounded increment separates native E/W ears
and attachment collars from accepted `profiles-authoring-v3.json` head anatomy.
New same-facing ear-free scalp/root skin is retained only in local ear windows.
E exposes character-right, W character-left. Human-specific head retention masks
must let the unchanged original ears reconstruct accepted head/skin and complete
facial/hair fits exactly, including partial alpha. Ear-free previews use the full
underlay without the human mask; they need independent contour/root review.
Accepted S and every profile facial/head/neck/hair/nose source remain unchanged.
No ear-size redesign, mirroring, runtime control or publication. Other facings,
variants, concealed surfaces, materials, N anatomy, body/clothing occlusion,
production T-pose, independent pixel artwork and final Step 6C remain unfinished.
Step 6D has not started; earlier next/pending-approval statements are historical.

## Current approval and ear-size design choice — 2026-10-12

The user approved keeping revision 2's current smaller S ears and requested a
local commit followed by continuation. `review-fit-v2.json` pins the selected
configuration, native layers/masks and actual hair-fit output. This approves
the S standing-reference ear/underlay/fit checkpoint; it does not certify the
other facings, complete body anatomy, production T-pose or final Step 6C.

Ear size is a future character-design choice. Retain the original larger pair
and its revision-1 configuration as another potential authored option, alongside
the approved smaller pair. This records a design lever, without adding a runtime
recipe field, editor control or automatic resampling. Any future size variant
needs its own authored facing coverage and attachment/hair-fit approval.

The next bounded Step 6C increment separates S facial features from their own
reference and reviews eyes, brows and mouth over the approved smaller-ear skin
and existing hair. Additional ear facings/ancestry variants remain unfinished.
The historical pending-approval statements below are superseded by this record.

Commit `545526a` records this approval. The S facial-feature candidate is now
available through `pnpm face:review`; see [modular-face.md](modular-face.md).
The new facial fit awaits its own visual approval.

On 2026-10-13 the authorised separate-face revision 4 prepares a new local
character-left S ear fit against newly authored jaw/neck anatomy. It selects a
complete smaller study ear and visible native reference pixels, retaining the
right ear. This candidate lives under `face/reference-v1/`, awaits approval and
does not replace or revoke this approved ear package. See `modular-face.md`.

## Smaller S ear candidate — revision 2, 2026-10-12

The user rejected the inherited S ears as too large compared with the reference
and requested a correction. Exact reconstruction in revision 1 verified
separation, but did not establish correct ear proportions. The previously
accepted S5 head and hair sources remain unchanged; this new candidate needs
visual approval.

`authoring-v2.json` is now selected by `pnpm ears:review`. The overview shows
**reference / accepted S5 fit with oversized ears / smaller-ear revision 2**.
The anatomy overview shows accepted skin / retained ear-free underlay / new ear
pair / corrected skin. `pnpm ears:review:v1` reproduces the original separation
under `historical-v1/`; its original sources and configuration are retained.

Built-in imagegen independently drew both S ears at native coordinates using
the same-facing reference and a manually drawn outline guide. The first study
retained excessive size and was rejected. The selected second study produces
narrower ears with higher lobes. Only screen-left x424–450/y184–223 and
screen-right x574–599/y184–223 supply new pixels, pinned by
`inputs/S-small-ear-selection-v2.png`. The prior concealed-skin underlay supplies
the rest of each attachment window, avoiding inherited oversized ears and
unnecessary generated changes to the lower cheek contour.

`S-right-ear-v2-masked.png` and `S-left-ear-v2-masked.png` retain those same-side
study/underlay pixels. They include the necessary attachment collars. Physical
side identity, native origins, binary human-head retention mask, neck and both
hair layers stay unchanged. The assembled skin differs only within the two
original ear windows. No image is shifted, rescaled or mirrored; no global colour
key or approved-source overwrite occurs. Unmasked patches and their intermediate
configuration remain as derivation history.

`prompts-v2.json` records exact prompts and input hashes. The guide and partition
scripts write exclusively and should be replayed only in scratch copies. Normal
review consumes retained source assets and verifies local study ownership,
preserved concealed skin, actual core plane composition and the immutable S5
baseline. The existing integration workflow also checks reduced exposed ear
area, both revisions, determinism, input hashes/mtimes and rejection of re-pinned
edits outside their masks.

Review visible ear proportions against the reference, complete bare-ear anatomy,
attachment/contour joins and foreground/rear hair coverage. This is an unapproved
S-only standing-reference candidate. Other facings, ancestry variants, body
occlusion and production T-pose still require independent work. Step 6C remains
unfinished; Step 6D has not started. The sections below describe revision 1.

Revision-2 validation: asset-validator typecheck, root lint (zero warnings),
JavaScript/declaration build, current/historical CLI exports and `git diff --check`
passed. The focused ear and S/N workflows passed (2 passed, 3 unrelated head
workflows skipped; 63.79 seconds). All 344 pre-correction source/reference hashes
and modification times remained unchanged; 30 current/historical staging PNG
hashes verified and five guide/mask/ear/config outputs replayed byte-for-byte in
scratch. Exposed pixels beyond the fixed ear-free scalp changed from 625 to 370
for physical right and 667 to 429 for physical left; these are mask-area checks,
not anatomical landmark measurements. An initial JSON-pin schema mistake caused
one CLI/ear-test failure and was fixed before the successful checks. Full app
build/browser E2E were not rerun. `fit-audit-v2.json` records results and limits.

Local commit `1525979` records the user's NE/NW head/neck and hair-fit approval.
The next bounded increment separates the human ears in the accepted S skin base.
This remains an offline S-only standing-reference candidate, outside the editor's
runtime catalog. The other seven ear facings, ancestry variants, independent
facial features, body/clothing and production T-pose remain unfinished.

## Native source ownership and concealed skin

`assets/source/heroine-v1/ears/human-v1/authoring-v1.json` pins the accepted
`head/soft-oval-v1/authoring-v5.json` and `review-fit-v5.json`. Original head,
neck and accepted S front/rear hair are unchanged.

- `S-right-ear-v1.png` retains 1,331 original RGBA pixels in native
  x422–454/y183–240. Character right is screen-left in S.
- `S-left-ear-v1.png` retains 1,370 original RGBA pixels in native
  x568–602/y183–240. Character left is screen-right.
- Each patch includes the complete existing ear and a small skin attachment
  collar. These are exact same-side S pixels, not a reflection or a new facing.
- `S-head-underlay-v2.png` contains newly authored ear-free scalp/root skin
  in only those two bounded windows. Accepted skin outside them is exact.
- `inputs/S-human-head-retention-v1.png` is the head's retention mask for
  this particular human-ear pair. The separate ear masks pin the same windows.

Built-in imagegen created an ear-erasure study from the accepted S head, then a
local contour refinement from the first ear-free underlay. Exact prompts, input
roles and hashes are in `prompts-v1.json`. Selected study pixels stay at native
coordinates; all generated changes outside the two windows are discarded.
The first underlay/study and config remain as refinement provenance. No approved
source is overwritten, transformed, recoloured or globally keyed.

## Partial alpha and the human-ear retention mask

The accepted skin has partial alpha even inside the ears. Simply drawing an
original ear over newly filled skin would change opacity and RGB. The source
head therefore retains complete concealed skin, while the **human-ear assembly**
clears head coverage within that pair's attachment windows before drawing the
original ears in the core `ears` plane. The composed head matches the accepted
head RGBA exactly; the actual rear/neck/head/ears/front assembly matches the
accepted revision-5 S fit byte-for-byte.

The ear-free preview uses the full head underlay **without** that human-specific
retention mask. It demonstrates retained root skin and the contour with the ears
absent. Future elf/vampire ears need independently authored geometry, compatible
attachments and their own reviewed retention masks. Do not reuse this human mask
for another ear shape or leave it active when the ears are absent.

Full-canvas origins remain `(511,169)`, placing all parts at native `(0,0)`.
The accepted foreground bang and posterior lock keep their existing S depth.
This does not establish T-pose/body compatibility or alter core contracts.

## Inspection

```bash
pnpm ears:review
```

Generated inspection outputs are ignored under
`assets/staging/heroine-v1/ears/human-v1/`:

- `anatomy-overview.png`: accepted skin / ear-free concealed skin / isolated
  human-ear pair / reconstructed human skin. Each column is a native copy of
  x320/y40/384×440, with no source-layer movement or scaling.
- `overview.png`: original reference / accepted S fit / separate-ear S fit.
  The two fit columns are intentionally identical.
- `layers/`, `masks/`, `assembled/` and `fit/`: native transparent source
  counterparts, reconstructed head and ear-free/human assemblies.
- `inspection/`: checker and green previews; labels/backgrounds are applied
  only here. `metadata.json` records exact ownership and output hashes.

Review the ear-free scalp contour, local colour/outline joins and skin beneath
the attachments in the second anatomy column. Inspect each isolated ear and
the actual hair-depth assembly. Exact human reconstruction proves preservation;
it does not approve the new concealed anatomy or ancestry-variant compatibility.

The public API integration workflow recreates S reference staging from immutable
tracked input, checks root-skin retention and removal of original ear protrusions,
native head/ear reconstruction, accepted hair fit, deterministic output and source
hashes/mtimes. It rejects re-pinned ear edits and underlay changes outside the
windows. It adds one meaningful workflow rather than helper/enum unit suites.

`inputs/partition-s-ears-v1.js` writes new files exclusively. Replay it in a
separate scratch copy using retained studies/configuration; seven selected
ear/head/mask/config outputs reproduced byte-for-byte there. Normal review does
not call imagegen or rewrite authoring sources.

The new underlay and separate-ear checkpoint await human approval. Preserve the
accepted abrupt shoulder-hair starts for later inspection with actual same-facing
body/clothing occlusion. N remains an unapproved head draft. Final Step 6C approval
is still required before Step 6D; no production pixel assets are derived here.

## Validation — 2026-10-12

- `pnpm --filter @character-studio/asset-validator typecheck`: passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm ears:review`: passed, including asset-validator JavaScript/declaration
  build. `node tools/asset-validator/dist/ear-review-cli.js` also passed after
  selecting the refined local contour study.
- `pnpm exec vitest run tools/asset-validator/src/ear-review.integration.test.ts tools/asset-validator/src/head-review.integration.test.ts -t 'separate S human ears|authored S/N anatomy'`:
  two workflows passed and three unrelated head workflows skipped; 62.33 seconds.
- All 15 current staging PNG hashes verified. All 328 previously committed
  source/reference hashes and modification times unchanged. Seven selected
  authoring outputs reproduced byte-for-byte in an isolated scratch copy;
  both ear patches and all three masks remained identical through refinement.
- `git diff --check`: passed. `fit-audit-v1.json` pins these results and limits.
  Full application build and browser E2E were not rerun for this offline tool/art
  increment. The new ear work remains uncommitted and unapproved.
