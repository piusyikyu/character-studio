# Step 6C — native S facial-feature separation

## S facial fit approval and next front-diagonal increment — 2026-10-13

The user approved revision 11 and requested cleanup, a local commit and continued
work. `face/reference-v1/review-fit-v11.json` pins the accepted S standing-reference
configuration, source layers and native fit hash. This approves the visible S
facial-layer and fringe-depth checkpoint; concealed surfaces, expressions,
materials, other facings, production poses and final Step 6C remain unfinished.
No existing source/config/artwork is rewritten. Regenerable caches are cleaned;
current review outputs, native references and pinned historical sources remain.

The next bounded Step 6C increment separates SE/SW visible facial components from
each direction's own reference and composes them over the accepted
`head/soft-oval-v1/front-diagonals-authoring-v4.json` fits. Preserve accepted S,
SE/SW head/neck/hair sources, nose landmarks and native anchors. Independently
trace features; do not mirror, shift inspection panels or infer approval from
source ownership. The future body-occlusion obligation for abrupt neck/shoulder
hair remains open. A new candidate needs visual approval. Step 6D has not started.
Earlier current/pending-approval statements below are historical.

## Original foreground depth over unchanged brows — revision 11, 2026-10-13

The user found v10 much better and its right brow more natural, but the left
brow appeared solidly over the hair. `review-fit-v10.json` records this remaining
correction and preserves the positive observations without certifying the whole
fit. V10's local fringe attenuation was excessive for the desired depth.

`pnpm face:review` selects `authoring-v11.json`. It keeps every feature layer and
both full brow masks byte-identical to v10, with the same native study and 4x4
coverage. It removes the front-reveal override, restoring the complete original
v5 front hair above the brows. The left tail remains authored beneath that hair,
while its naturally occluded appearance replaces the painted-over overlap.
The actual right-brow region is unchanged. Head/ears/neck/front/rear hair and
all other facial details/folds remain pinned; no new artwork or image transforms.

`inputs/brows-v11/ownership-settings.json` records the unchanged brow contours.
`inputs/restore-s-brow-depth-v11.js` derives the new configuration in scratch,
retaining v10 layer pins. V11 validation rejects re-pinned brow-layer changes;
this is strictly a depth-selection increment. Historical v10 is recomposed with
its own pinned front fit, preserving its exact original comparison hash.
Review **reference / revision 10 / revision 11** in staging
`face/reference-v1/inspection/brow-fit-comparison.png`;
`pnpm face:review:v10` rebuilds the preceding checkpoint. Prior sources, prompts,
mask/config files and feedback records remain required derivation baselines.

Revision 11 needs visual review of the left tail/fringe transition. Positive
feedback on v10's right brow does not imply whole-fit or production approval.
Concealed geometry, variants/facings, materials, body/clothing, T-pose, independent
pixel art and final Step 6C acceptance remain unfinished. Step 6D has not started.

Revision-11 validation: asset-validator typecheck, root lint (zero warnings),
JavaScript/declaration build, default-v11 and historical-v10 CLI exports passed.
The existing face and cleanup integration workflows passed (two tests,
234.02 seconds), covering actual composition with original foreground opacity,
full retained brows, exact right-brow region and preceding/approved fit hashes,
source ownership, determinism and immutable inputs. Current re-pinned brow edits
are rejected; historical v10 out-of-mask front edits remain rejected. Chromium
passed the v10/v11 viewer/native assembly check outside the sandbox due the known
launch restriction. All 547 prior artwork/reference inputs retain hashes/mtimes;
the source README changed intentionally. Forty-four current and 45 historical
PNG hashes plus both viewer hashes verified. The v11 configuration replayed
byte-for-byte in scratch. See `fit-audit-v11.json`. Full application build and
studio E2E were not rerun for this offline depth-only increment. Generated caches
and historical previews are cleared after validation, keeping current review
outputs, native references and all pinned source baselines.

## Fuller bands and exposed clean left tail — revision 10, 2026-10-13

Revision 9 was rejected for a thin right brow and a short left brow with a line
at its tail, pinned in `review-fit-v9.json`. The reference tail contains mixed
fringe/brow pixels and the current front fringe hides some of that endpoint.
The local correction therefore addresses both the bands and actual occlusion.

`pnpm face:review` selects `authoring-v10.json`. A selected S study supplies two
fuller native curves. Its left tail was authored over an opened forehead window
(x539/y153/20x19) to avoid reproducing the crossing fringe line. The source guide
uses the pinned v9 fit and approved head skin; the opened rectangle is discarded
from the final layers. Only the two manually traced brow bands retain study RGB,
with deterministic 4x4 geometric coverage affecting alpha. No source RGB is
resampled; images and native anchors are not moved, scaled or mirrored.

`inputs/brows-v10/ownership-settings.json` also traces a narrow front-reveal
window. Its intersection with the left brow mask attenuates the v5 front hair
alpha: 51 selected coordinates, 27 active hair pixels, 13 removed. The new
`S-front-fit-v10.png` preserves all other native front pixels, so normal core
plane order still places hair above brows. Approved v5 source images remain
unchanged; the current head/ears/neck/rear hair, eyes/mouth/nose and retained
70/56-pixel eyelid folds stay exact. Earlier whole-front-fit invariance statements
apply to previous revisions; this candidate intentionally changes the bounded
left-tail overlap. Approved/rejected comparison fits use their original front.

Review **reference / rejected revision 9 / revision 10** in staging
`face/reference-v1/inspection/brow-fit-comparison.png`. The right mask selects
245 study coordinates (160 full/85 partial coverage); the left selects 306
(222 full/84 partial). These are ownership/coverage counts, not evidence of
anatomical or design approval. `prompts-v10.json` pins all prompts, the selected
guide/study and the reasons/hashes for two discarded studies. Those unselected
PNGs are not retained dependencies. Portable guide/partition scripts in `inputs/`
are replayed only in scratch; `face:review:v9` rebuilds the prior candidate.

Revision 10 needs human review of thickness, full visible length, colours, curve
continuity, tail point and local fringe transition. It is uncommitted and remains
an offline standing-reference candidate. Concealed geometry, expressions, other
facings, material maps, body/clothing, T-pose, independent pixel art and final
Step 6C acceptance remain unfinished. Step 6D has not started.

Revision-10 validation: asset-validator typecheck, root lint (zero warnings),
JavaScript/declaration build, default-v10 and historical-v9 CLI exports passed.
The existing face and cleanup integration workflows passed (two tests,
218.21 seconds), covering actual core-plane composition, exact approved/historical
fit hashes, exposed violet tail samples, restored right-band coverage, source
ownership, no changes outside the permitted brow/front masks, determinism and
source immutability. Re-pinned wrong-side brow and out-of-mask front edits are
rejected. Chromium passed the v9/v10 viewer/native assembly check outside the
sandbox due the known launch restriction. All 534 prior artwork/reference inputs
retain hashes/mtimes; the source README changed intentionally. Forty-five current
and 44 historical PNG hashes plus both viewer hashes verified. Eight guide/masks/
layers/config outputs replayed byte-for-byte in scratch. See `fit-audit-v10.json`.
Full application build and studio E2E were not rerun for this offline increment.
Historical previews and build caches are cleared after validation, preserving
current review outputs, native references and every pinned source baseline.

## Continuous right curve and tapered left tail — revision 9, 2026-10-13

Revision 8 was rejected for a sharp transition in the character-right/screen-left
brow and an abrupt character-left/screen-right tail, recorded in
`review-fit-v8.json`. The right's small study patch still created a visible join
with reference pixels; the left's binary contour ended bluntly.

`pnpm face:review` selects `authoring-v9.json`. The right band now retains a
continuous native study curve. The left retains its native reference curve through
a newly tapered endpoint meeting the unchanged foreground fringe. Its generated
study curve was not selected. `inputs/brows-v9/ownership-settings.json` records
both independently traced contours. Four-by-four point coverage of each native
detailed pixel yields the mask value; only source alpha is multiplied by it.
Source RGB and coordinates stay exact. This is detailed-mask edge coverage,
with no image scaling, blur, mirroring or change to pixel-art contracts.

Review **reference / rejected revision 8 / revision 9** in staging
`face/reference-v1/inspection/brow-fit-comparison.png`. The unchanged front hair
provides real occlusion above both brow layers. Approved v5 head/ears/neck/hair,
original eyes/mouth/nose and the 70/56-pixel upper-eyelid folds remain exact.
Source ownership and authored coverage are validated for every native pixel.
`prompts-v9.json` pins the built-in imagegen prompt, native guide and selected
study; its background and every unselected edit are excluded from the layers.
The portable `inputs/partition-s-brows-v9.js` is replayed only in scratch.

`pnpm face:review:v8` rebuilds the rejected prior candidate. All older selected
sources and rejection records remain derivation baselines. Revision 9 needs
human review of the curves, tail taper, thickness, colours and native fringe
joins. Hidden geometry, expressions, other facings, materials, body/clothing,
T-pose, independent pixel art and final Step 6C acceptance remain unfinished.
Step 6D has not started; no commit is authorised for this candidate.

Revision-9 validation: asset-validator typecheck, root lint (zero warnings),
JavaScript/declaration build, default-v9 and historical-v8 CLI exports passed.
The existing face and cleanup integration workflows passed (two tests,
209.46 seconds), covering actual core-plane composition, retained study/reference
RGB with authored alpha coverage, soft tail samples beyond the former endpoint,
excluded crossing stubs, exact rejected-v8/v7/v6 and approved-v5 fit hashes,
unchanged output outside brow masks, determinism, source immutability and
re-pinned wrong-side rejection. Chromium passed the v8/v9 viewer and native
assembly checks outside the sandbox due its known launch restriction.
All 521 prior artwork/reference inputs retain hashes and mtimes; the source
README changed intentionally. The right has 166 selected study pixels with
90 full/76 partial coverage; the left has 258 reference pixels with 176 full/82
partial coverage. Forty-four current and 44 historical PNG hashes plus both
viewer hashes verified. Five source outputs replayed byte-for-byte in scratch.
See `fit-audit-v9.json`. Full application build and studio E2E were not rerun
for this offline S-only increment. Historical previews and build caches are
cleared after verification; the current review and source baselines remain.

## Local brow-junction repair — revision 8, 2026-10-13

Revision 7 was rejected for perpendicular crossing lines at both brows, recorded
in `review-fit-v7.json`. Its expanded reference masks retained flattened fringe
fragments. Revision 8 uses a bounded S study to reconstruct only the crossed
junctions, with independently authored native contour and study-intersection
masks in `inputs/brows-v8/`. The generated background and all other study changes
are excluded. See `prompts-v8.json` for the built-in imagegen prompt, guide and
selected study hashes. No image shifts, scaling, mirroring or colour keys occur.

`pnpm face:review` selects `authoring-v8.json`; review **reference / rejected
revision 7 / revision 8** in staging
`face/reference-v1/inspection/brow-fit-comparison.png`. True foreground hair
composes above the new brow bands. The approved v5 head/ears/neck/hair and native
eye/mouth/nose layers remain byte-identical; the 70/56-pixel upper-eyelid folds
remain on the eye plane. Both junctions use mixed reference/study ownership,
validated at each native pixel against pinned masks. All changes outside the two
brow bands are prohibited, even when source hashes are re-pinned.

The portable `inputs/partition-s-brows-v8.js` is replayed only in an isolated
scratch copy. `pnpm face:review:v7` reproduces the rejected preceding fit; v6/v7
and all approved baselines remain pinned source dependencies. Review actual
junction continuity, local shading and fringe occlusion. Revision 8 is unapproved;
concealed brow surfaces, expressions, other facings, materials, body/clothing,
T-pose, independently authored pixel assets and final Step 6C acceptance remain
unfinished. Step 6D has not started.

Revision-8 validation: asset-validator typecheck, root lint (zero warnings),
JavaScript/declaration build, default-v8 and historical-v7 CLI exports passed.
The existing face and cleanup integration workflows passed (two tests,
205.08 seconds), covering actual core-plane composition, masked study junctions,
correct alpha composition, excluded crossing stubs, exact historical/approved
fits, unchanged output outside brow masks, deterministic export, source
immutability and re-pinned wrong-side rejection. The initial sample assertion
was corrected to account for partially transparent study pixels over skin.
Chromium passed the v7/v8 viewer and native assembly checks; its sandbox launch
failed, then the local check passed outside the sandbox. All 498 prior artwork/
reference inputs retain hashes and mtimes; the source README changed intentionally.
The 160/255-pixel brow layers retain 27/33 study pixels respectively. Forty-four
current and 44 historical PNG hashes plus both viewer hashes verified. Seven
source outputs replayed byte-for-byte in scratch. See `fit-audit-v8.json`.
Full application build and studio E2E were not rerun for this offline S-only
increment. Historical previews and build caches are cleared after verification;
current review images, transparent references and all source baselines remain.

## Brow gap and shortened endpoint correction — revision 7, 2026-10-13

The user rejected revision 6: “NOT approved. The brows are not fully extracted.
Her right brow has a gap while her left brow has been shortened.”
`review-fit-v6.json` pins the rejection and actual fit/config hashes. Its masks
were too tight: the right contour started after reference pixels beside the
fringe, while the left contour stopped before the outer reference junction.

`pnpm face:review` now selects `authoring-v7.json`. Expanded, independently traced
native S masks retain 209 right/screen-left and 329 left/screen-right coordinates;
98/43 respectively overlap foreground hair. Reference pixels at `(459,176)`
and `(547,164)`, absent from the v6 brow layers, now appear unchanged in both
their respective layers and actual assembly. The forehead curves extend through
the existing fringe junctions. No layer shifts, scaling, mirroring, generation
or colour keys are applied. Approved v5 head/ears/neck/hair, original eye/mouth/
nose pixels and both retained eyelid folds remain exact.

Review **reference / rejected revision 6 / revision 7** in
`assets/staging/heroine-v1/face/reference-v1/inspection/brow-fit-comparison.png`.
The source-derived v6 comparison is recomposed at native coordinates and pinned
separately from the approved-v5 baseline; display panels are not moved. Settings
and masks are in `inputs/brows-v7/`, with the scratch-only replay script
`inputs/partition-s-brows-v7.js`. `pnpm face:review:v6` reproduces the rejected
candidate under `historical-v6/`; source v6 and all earlier baselines are retained.

Revision 7 still needs visual approval of the complete visible curves, fringe
ownership and antialiased skin rims. Flattened reference junctions do not certify
complete concealed brow geometry or material separation. Other facings/variants,
body/clothing, concealed hair, materials, T-pose, independent pixel assets and
final Step 6C acceptance remain unfinished. Step 6D has not started.

Revision-7 validation: asset-validator typecheck, root lint (zero warnings),
JavaScript/declaration build, current/default and historical-v6 CLI exports,
the existing face and cleanup integration workflows (two passed, 181.68 seconds),
and the Chromium v6/v7 viewer check passed. Regressions verify the two restored
junction samples in actual composition, exact rejected-v6/approved-v5 fit hashes,
unchanged artwork outside brow masks, retained eyelid folds, deterministic export,
source immutability and re-pinned wrong-side rejection. All 488 prior source/
reference inputs retain hashes/mtimes; the source README changed intentionally.
Forty-four current and 44 historical PNG hashes plus both viewer hashes verified.
Five authoring outputs replayed byte-for-byte in scratch. See `fit-audit-v7.json`.
Full application build and studio E2E were not rerun for this S-only correction.
Historical previews and build caches are cleared after verification; the current
review and native transparent references remain available.

## Current native S eyebrow candidate — revision 6, 2026-10-13

After approving revision 5 and committing its correction/cleanup as `169bd1c`,
the user authorised continued Step 6C work. `pnpm face:review` now selects
`authoring-v6.json`: two independently traced visible eyebrow curves from S's
native reference. There is no new generation, mirroring, shifting, scaling or
colour-key operation. Character-right/screen-left brow has 56 selected pixels,
five overlapped by the foreground fringe; character-left/screen-right has 157
selected pixels with no foreground overlap. These are independently selected
same-facing parts, not a mirrored pair.

The earlier 70/56-pixel pale patches are upper-eyelid folds. They remain exact
and now compose on the `eyes` plane as `rightUpperLidFold`/`leftUpperLidFold`.
The new purple curves compose on `eyebrows`, before foreground hair. Approved
revision-5 head, retention, ears, native nose, neck, front/rear hair, eye layers,
mouth and anchors are unchanged. The approved previous fit hash is required and
verified before export. Source settings and a scratch-only replay script are
in `inputs/brows-v6/` and `inputs/partition-s-brows-v6.js`.

Review **reference / approved revision 5 / revision 6** in
`assets/staging/heroine-v1/face/reference-v1/inspection/brow-fit-comparison.png`.
Its native crop is x435/y148/150×80, magnified 4× for inspection. The overview,
bare anatomy, individual layers/masks and zero-transform head viewer also use
v6. `pnpm face:review:v5` rebuilds the accepted checkpoint under `historical-v5/`;
older sources and commands remain available.

Revision 6 is unapproved. Review the curves, size, placement, skin rims and actual
fringe occlusion. Only reference-visible brow geometry is supplied; concealed
extensions, alternate expressions, palette/material maps and other facings
remain unfinished. This is not final Step 6C acceptance or Step 6D progression.

Revision-6 verification: asset-validator typecheck, root lint (zero warnings),
JavaScript/declaration build and current/historical-v5 CLI exports passed. The
existing face and cleanup integration workflows passed (two tests, 174.99 seconds),
covering actual core-plane composition, exact approved v5 fit, retained folds,
native brow ownership, unchanged output outside the brow masks, determinism,
source immutability and rejection of re-pinned wrong-side brow edits. Local
Chromium passed v5/v6 native defaults, unchanged anatomy overlay, opacity/reset,
inspection transforms and actual assembly isolation/change. All 479 earlier
source/reference inputs retain hashes/mtimes; the source README was updated
intentionally. Forty-four current PNGs, 40 historical PNGs and both viewer hashes
verified. Five authoring outputs replayed byte-for-byte in scratch. See
`fit-audit-v6.json`; full application build and studio E2E were not rerun for this
offline S-only increment. Generated caches and historical previews are cleared
after validation, preserving the current review and transparent references.

## Revision-5 approval and reference brow ownership — 2026-10-13

The user approved revision 5 and requested cleanup, commit and continued work.
`review-fit-v5.json` pins the accepted S standing-reference fit without rewriting
the source config/artwork. Complete brows and all production review debt remain
open. Current exports omit redundant `baseline-v3/` copies and duplicate eye/face
comparison aliases; historical commands preserve their previous export sets.

The reference's actual brows are purple curves above the eyes. The old 70/56-pixel
layers labelled brows contain pale upper-eyelid folds instead. The next bounded
increment separates the true reference brow curves and retains those folds with
eye detail. Approved head, ears, neck, hair and native positions stay fixed.

## Current neck-edge correction — revision 5, 2026-10-13

The user authorised continuing after the asset cleanup. `pnpm face:review` now
selects `authoring-v5.json`: a bounded S neck-side ownership correction. The
head/retention, both ears, nose and original eye/brow/mouth layers are exactly
the revision-4 inputs. Native origins and core plane order are unchanged.

A built-in imagegen study supplies 1,524 manually selected same-facing hair
pixels in two independently traced neck-side corridors. This backing composes
behind the existing anatomy, including partially transparent skin edges that
the earlier empty-pixel repair skipped. Twenty-eight generated jaw/skin boundary
pixels are explicitly excluded. The full generated image is not accepted: its
opaque background and changes outside the selected corridors are discarded.
The final layers remain transparent; no shifting, resizing, mirroring or global
colour-key cleanup is used.

The new front-clear mask selects 476 coordinates and removes 217 active pixels
at the proximal selection edges, including five isolated dark/warm fragments.
The new rear layer resets all 109 earlier reference-gap selections to their
original coherent-hair ownership before adding the continuous backing. The
neck resets its 23 scattered reference overrides to the original revision-4
anatomy study. These are the complete permitted changes; all other source
pixels remain exact. The anatomy's continuous dark neck outline is retained.

Review **reference / revision 4 / revision 5** in
`assets/staging/heroine-v1/face/reference-v1/inspection/neck-edge-comparison.png`.
Its native crop is x455/y242/120×76, magnified 4× for inspection. The full face
comparison is `inspection/head-ear-fit-comparison.png`; the overview, actual
layers and zero-transform anatomy/reference viewer also show revision 5.
Both existing bounded cheek-gap diagnostics remain zero; this does not certify
all hair geometry, mask transitions or future body occlusion.

`pnpm face:review:v4` rebuilds the previous checkpoint under `historical-v4/`.
Older version commands and their pinned sources remain available. Selected
study/guide/settings are in `inputs/neck-edges-v5/`, with the exact built-in prompt
and input roles in `prompts-v5.json`. The guide and partition scripts are
`inputs/create-s-neck-backing-guide-v5.js` and
`inputs/partition-s-neck-edges-v5.js`; replay only in a separate scratch copy.
Normal review consumes local pinned inputs and needs no generation service.

Revision 5 is an **unapproved** offline standing-reference candidate. Review the
neck-side shading, hair continuity and skin/alpha joins before another increment.
Complete eyebrows are still unfinished. Other facial/ear variants, materials,
concealed full hair, body/clothing, production T-pose, independent pixel assets
and final Step 6C acceptance remain open. Step 6D has not started. The previous
revision descriptions below are historical.

Revision-5 verification: asset-validator typecheck, root lint (zero warnings),
JavaScript/declaration build, current/default and historical-v4 CLI exports,
the existing face and workspace-cleanup integration workflows (two passed,
132.30 seconds), and the local Chromium v4/v5 viewer check passed. Coverage
includes actual core-plane composition, unchanged head/ears/features, native
backing at partial-alpha skin samples, deterministic output, source preservation
and rejection of re-pinned edits outside the masks. All 464 earlier artwork,
configuration, reference and script files retain hashes/mtimes; the source README
was updated intentionally. Fifty-one current PNGs, 47 historical PNGs and both
viewer hashes verified. Seven authoring/guide outputs replayed byte-for-byte in
scratch. The sampled alpha values changed from 19/40 to 254/253. An initial
test assertion requiring 255 was corrected to accept >=250, preserving native
study alpha. `fit-audit-v5.json` records evidence and review debt. Full application
build/browser E2E were not rerun for this local artwork increment. Generated
historical previews and build caches are cleared after validation; current
review outputs and native reference staging remain available.

## Revision-4 cheek/neck line diagnosis — 2026-10-13

The user found the fit better but flagged the short lines beside the jaw/neck
as possible mask artifacts. Inspection of the actual individual layers confirms
separation defects: the rear-hair repair contains disconnected reference strips,
and partly transparent anatomy-edge pixels still expose checkerboard slits.
The repair's `alpha <8` condition fills empty pixels while skipping anatomy-edge
samples such as `(488,271)` with alpha 19 and `(540,272)` with alpha 40. This does
not restore continuous hair coverage behind those edges. The existing foreground
hair also has abrupt inner selection edges in this region.

Correct the earlier description of all 109 selected rear pixels as hair: the
rear repair also retained warm/red reference neck-edge pixels, including
`(541,280)`, `(542,284)` and `(543,286)`. These pixels belong to anatomy/boundary
review, not a certified hair material. Native reference ownership/deterministic
export checks do not prove correct head/neck/hair ownership. Zero gaps in the two
bounded cheek diagnostics remains true, but those regions end before this neck
transition and exclude partially transparent pixels.

The neck's dark continuous anatomy outline is legitimate; the extra disconnected
purple/warm strips and transparent slits are the defects. Next prepare a new
bounded revision with continuous same-facing hair coverage behind the neck,
appropriate neck-skin ownership and coherent foreground/back hair selections.
Preserve the improved head/ear candidate and all prior sources. No artwork or
masks changed during this diagnosis, and revision 4 remains unapproved.

The two current layers labelled brows contain only small pale/pink strokes
(70/56 active pixels), with zero foreground-hair overlap. They do not provide
complete visible eyebrows; this remains separate facial authoring work rather
than an occlusion fix. The user's observation is recorded without claiming brow
approval or advancing Step 6C.

## Current native head/left-ear fit candidate — revision 4, 2026-10-13

The user authorised the next bounded correction after comparing the three
revision-3 registrations below. `authoring-v4.json` is now selected by
`pnpm face:review`. Comparison 3 (−5°/X−0.245/Y−2.945) guided a new native anatomy
study; no source layer or render plan is rotated, shifted, scaled or mirrored.
All parts retain `(511,169)` origins and compose at `(0,0)` in the existing S
core plane order. This is an unapproved offline standing-reference candidate.

The final built-in imagegen study uses a manually drawn silhouette to author
one jaw contour and continuous upper-neck skin. Its selected head pixels occupy
x435–602/y170–277; neck pixels occupy x478–554/y278–307. Outside those windows,
the revision-3 underlay and neck remain exact. The original native reference nose
is restored in its existing mask, and the five original eye/brow/mouth layers
remain byte-identical. Character-right ear pixels are unchanged. A locally traced
complete character-left ear selects the same-facing study, with 243 visible
reference-owned pixels (including six rim pixels confirmed after composition).
Four reference hair pixels at the ear selection boundary are excluded explicitly.
The new left-ear layer has 638 active pixels; size/root/contour coherence still
requires human review. The earlier approved human-ear source checkpoint is intact.

Seven bounded ownership masks plus an active-ear retention mask preserve the
derivation. Twenty-three manually inspected neck-edge skin pixels retain S
reference RGBA. Front hair restores 352 inspected reference-covered cheek gaps
plus 34 newly exposed strand pixels; rear hair restores 109 inspected neck-side
hair pixels. These are local same-facing ownership corrections. The original
hair files and every unselected RGBA value remain unchanged; no global white-key
operation is used. The two bounded cheek-gap diagnostics now report zero pixels.
This does not certify all hair edges, concealed anatomy, mask transitions or
actual future body/clothing occlusion.

Inspect these current outputs:

- `inspection/head-ear-fit-comparison.png`: reference / revision 3 / revision 4.
- `inspection/head-reference-overlay.html`: revision-4 anatomy over reference;
  start at **zero rotation and X/Y offset**. Revision-3 preview presets are kept
  only in the historical viewer, so the old rotation is not applied twice.
- `inspection/S-head-overlay-closeup.png`, `overview.png`, `anatomy-overview.png`,
  `layers/` and `fit/`: actual native anatomy and composed results.

`pnpm face:review:v3` reproduces the preceding candidate and its three comparison
presets under `historical-v3/`. Versions 1–2 and all earlier source/config/prompt
records remain available. Normal S/N head review still selects v5; separate S
human-ear review still selects its approved v2. The production catalog is unchanged.

`prompts-v4.json` retains all three built-in prompts and local image roles. The
first study missed jaw/ear contours; the second supplied a smaller-ear guide;
the third supplies the selected coherent anatomy. Rejected mask prototypes
showed a double jaw/hard neck join and were superseded before review. Raw studies,
manual guide settings, selected masks and portable guide/partition scripts are
retained in `inputs/alignment-v4/`. Replay the scripts only in a separate scratch
copy. Normal review needs the retained source images, not the generation service
or external generated-image paths.

Review the new jaw/cheek alignment, left-ear size and root, neck joins, facial
skin margins and repaired hair boundaries. The candidate still needs visual
approval. Other facings/expressions/materials, concealed geometry, body/clothing,
production T-pose, independent pixel assets and final Step 6C acceptance remain
unfinished. Step 6D has not started. Older “current” descriptions below are history.

Revision-4 validation: `pnpm --filter @character-studio/asset-validator typecheck`,
`pnpm lint` (zero warnings), `pnpm face:review`, `pnpm face:review:v3` (JavaScript/
declaration builds and both exports), and `pnpm exec vitest run
tools/asset-validator/src/face-review.integration.test.ts
tools/asset-validator/src/ear-review.integration.test.ts` passed: two existing
workflows, 97.20 seconds. Face coverage includes actual core-plane composition,
native ear/neck samples, unchanged right-ear/original features, bounded gap
coverage, deterministic exports and rejection of repinned outside-head/wrong-side
ear edits. Local Chromium passed the native revision-4 viewer and historical
revision-3 comparison/landmark workflows with no browser errors. All 438 prior
source/reference hashes and mtimes remain unchanged. Seventy-nine current/
historical PNG hashes and both HTML hashes verified; 21 guide/settings and
selected asset/config outputs replayed byte-for-byte in isolated scratch.
`git diff --check` passed. Initial tuple-inference type errors and a JSON settings
pin incorrectly using the PNG source schema were fixed before the successful
checks above. Full application build/browser E2E were not rerun. `fit-audit-v4.json`
pins the current candidate and validation scope; it is not an approval record.

## Three alignment comparisons and remaining left-ear fit — 2026-10-12

The user's comparisons separate head tilt/position from the remaining local ear
fit. “Left ear” here means character left, screen-right in S:

| Comparison | Rotation | X offset | Y offset | User's observation |
| --- | ---: | ---: | ---: | --- |
| 1: Rotation only | −5° | 0 | 0 | Jaw fits better; right ear seems to fit, left ear remains misaligned. |
| 2: Chin offset only | 0° | 3.3333 | −3.0000 | Ears align more closely; jaw still needs refitting. |
| 3: Rotation + chin offset | −5° | −0.2450 | −2.9450 | Jaw seems good; left ear still appears incorrectly sized. |

Use comparison 3 as the working **inspection registration** for the next bounded
ear-fit review. The viewer's Reviewed comparison control restores these settings;
its default/reset remains the native zero transform. Rotation is around native
`(520,226)` with independent translation. The supplied screenshots retain only
the transform values, not the clicked landmark coordinates. A zero residual at
one marked chin does not establish jaw/ear fit or approval of the whole assembly.

The evidence suggests that registration accounts for much of the jaw mismatch,
while the left ear needs a local assessment of size, attachment, placement and
visible hair occlusion. Do not infer that both ears need uniform resizing or
that the approved smaller-ear source checkpoint has been revoked. Review the
left ear against its own same-facing reference using the working registration,
then author any confirmed correction as a new bounded revision. Head, separate
features, ear roots, upper neck and hair must ultimately agree in the actual
native assembly; rotating this combined inspection overlay alone cannot certify
that fit. Cheek/hair gaps and overall revision-3 approval remain outstanding.

Validation for retaining these comparisons: asset-validator typecheck, `pnpm lint`
(zero warnings), `pnpm face:review` (JavaScript/declaration build/export), and the
local Chromium viewer smoke check passed. The browser check restores all three
transforms, verifies that they change the actual overlay, and confirms native
reset, assembly isolation and the existing landmark-fit workflow. All 437 prior
source/reference hashes and mtimes and the native assembled face hash remain
unchanged; 32 current PNG hashes and the HTML hash match staging metadata.
The full application build/browser E2E and offline face integration test were
not rerun for this comparison-preset increment; the preceding integration result
below is historical. `alignment-comparisons-review-v3.json` retains the user's
observations and settings separately from the earlier review records.

## Chin landmark and head alignment — 2026-10-12

The user requested head rotation during anatomy/layer alignment, then clarified
that the chin is a point to optimise, **not the only rotation pivot**. Treat it
as one registration landmark alongside visible jaw/cheek landmarks. Do not align
to the horizontal head-layer partition below the actual chin. The user also
flagged the screen-right face contour (character left in S) as less aligned even
after accounting for tilt. This residual remains open; rotation does not approve
or correct local anatomy, concealed contours or missing cheek/hair coverage.

`inspection/head-reference-overlay.html` now has independent rotation and X/Y
translation controls. Mark corresponding reference and candidate points for the
chin and both jaw sides, then choose **Fit marked points**. The fit minimises
squared distance across all completed pairs with equal weights, using rotation
and translation together; it never scales or deforms the head. A single pair
adjusts translation at the selected rotation. Each completed pair reports its
remaining distance in native pixels. Landmark selection is manual: hair can hide
the real skin boundary, so no reference contour is inferred automatically.

Head pixels and their contour receive the same preview transform. The assembled
gap view stays at native coordinates with alignment controls disabled. Reset
returns to zero rotation/translation. These temporary settings are offline
detailed-art diagnostics; they do not add a CharacterRecipe trait, resample source
layers or change pixel rendering. Future extraction/anatomy guides should include
the chin with other same-facing landmarks and preserve native ownership; any
artwork correction still needs a new authored revision and human review.

Validation for this inspection increment: asset-validator typecheck, root lint
(zero warnings), `pnpm face:review` (JavaScript/declaration build and export),
and the existing `face-review.integration.test.ts` workflow passed (59.62 seconds).
A local Chromium smoke check passed opacity/reset, real preview transforms,
native assembly isolation, paired-point fitting, inverse coordinate selection,
nonzero residuals for a deliberately mismatched third point, and preservation of
rotation when fitting only one pair. No browser errors. Mouse-picked landmarks
have display-coordinate precision; synthetic residuals are test evidence, not
measurements of the heroine's anatomy. All 436 pre-existing source/reference
hashes and mtimes, the assembled fit hash, and all 32 staging PNG hashes remain
unchanged. The new viewer HTML hash matches staging metadata. Full application
build and browser E2E were not rerun for this offline inspection change.

## Native reference overlay and cheek-gap inspection

The user flagged cheek-to-hair gaps in revision 3 and requested anatomy directly
over the reference to compare face size. This review-only increment leaves the
selected revision-3 configuration, source artwork and assembled fit unchanged.
`pnpm face:review` now also produces:

- `inspection/S-head-overlay-closeup.png`: actual masked head and retained ears
  over the reference at 50% opacity, with a cyan anatomy contour. The crop is
  native x416/y144/208×164; this preview magnifies it 3× without changing alignment.
- `inspection/S-head-over-reference.png` and `S-head-contour-over-reference.png`:
  full 1024×1536 native overlays. All images compose at `(0,0)`; no comparison
  panel is shifted to align the faces artificially.
- `inspection/head-reference-overlay.html`: self-contained local browser viewer
  with head opacity, contour, reference/reset, gap markers and display zoom.
  The crop canvas remains 208×164 regardless of display zoom. The horizontal
  cyan line below the chin marks the head layer's lower edge, not the jaw.
- `inspection/S-cheek-gap-closeup.png` and `S-cheek-gap-review.png`: magenta marks
  for reference-covered transparency in bounded cheek regions of the actual fit.

The native head overlay excludes separate eyes/brows/mouth and the neck plane;
the head's existing upper-neck stub remains part of its silhouette. Showing the
head over reference hair is intentional for anatomy inspection, not a change to
the real character composition order. Source labels/backgrounds are unchanged.

Within the two cheek review regions, 165 screen-left and 187 screen-right pixels
are covered in the reference but transparent in the current assembly. Sampled
native points `(464,241)`, `(471,248)`, `(566,232)` and `(558,243)` contain purple
hair in the reference, while the candidate head/front/rear layers have no pixels
there. The slimmer head exposed missing hair coverage in the inherited fit.
Review the anatomy overlay before authoring a bounded same-facing hair-fit repair.
These diagnostic regions are not automatic repair/skin masks; other differences
in hair shape and occlusion can also produce marked pixels.

Validation: asset-validator typecheck, root lint (zero warnings), JavaScript/
declaration build and current CLI export passed. The existing face integration
workflow passed in 62.58 seconds, including deterministic added PNGs and immutable
inputs. A local Playwright browser check passed for opacity, reference/reset, gap
markers, canvas geometry and display zoom, with no browser errors. Chromium's
first restricted-sandbox launch was blocked; the same check passed outside that
sandbox. All 435 pre-existing source/reference hashes/mtimes remain unchanged;
32 current PNG hashes and the HTML hash verified. Revision 3's assembled fit hash
is unchanged. Full application build/browser E2E were not rerun.

Revision 3 remains unapproved, with cheek/hair fit still outstanding. This adds
inspection tools and records the feedback; it does not generate new artwork,
alter native masks or advance Step 6C/6D. Older validation counts below describe
earlier exports.

## Current face-proportion correction — revision 3

The user rejected revision 2 and identified a broader/heavier face than the
reference: “this is a face size diff.” `review-fit-v2.json` records this rejection.
Reauthoring eyes on the unchanged head did not address the cheek/jaw mismatch.
The approved S5 and small-ear checkpoints remain preserved as historical sources;
this new facial assembly is an unapproved candidate.

`authoring-v3.json` is now selected by `pnpm face:review`. It restores the exact
revision-1 reference eyes, brows and mouth at their original native coordinates.
A new locally authored head underlay narrows the cheeks/jaw and raises the chin
toward the reference proportions. The original native reference nose is restored
in x504–517/y207–233. Upper skull outside x435–591/y170–277 stays byte-identical
to the accepted ear-free underlay. Neither head nor features are resized or moved.

The first imagegen shape study changed framing and enlarged the head, and was
rejected. A retry uses a native masked silhouette guide and retains only the local
lower-head pixels. A second local study repairs ear-root/upper-neck joins exposed
by the slimmer geometry. New head and neck-fit files hold these selected pixels;
the approved head/neck/ear source files remain unchanged. Nose and feature pixels
come from S's own reference, not another direction. Exact prompts/input roles and
rejected studies remain in `prompts-v3.json` and `inputs/`.

The ear pair keeps its approved native ear pixels and size. New local masks trim
the old cheek attachment collars and retain the same-side ear geometry; a new
head retention mask clears only active ear pixels to avoid doubling partial alpha.
Small-root anatomy and collar joins still require human review. Front/rear hair
is unchanged. Native origins remain `(511,169)`, with all layers at `(0,0)`.

The join study supplies screen-left root skin x436–448/y200–215 and
x436–454/y216–225 (excluding the eye), screen-right root skin x568–583/y200–225,
upper-neck/head skin x478–549/y263–277, and neck skin x478–549/y278–292. All other
neck pixels remain original. Real body/clothing fit is still unverified.

- `inspection/face-size-comparison.png`: reference / rejected revision 2 /
  slimmer-face revision 3 with original features.
- `overview.png`: reference / original approved ear-head-hair baseline /
  current revision 3.
- `anatomy-overview.png`: original approved head / original separated features /
  slimmer bare assembly.
- `pnpm face:review:v1` and `pnpm face:review:v2`: retained rejected revisions
  under their own historical staging directories.

The bare underlay's alpha span at native cheek row y240 changes from 108 to
89 pixels. Reference visible peach spans are affected by hair occlusion and
cannot establish a concealed bare-head contour on their own; the measurements
are geometric checks, not anatomical approval. Inspect face width, jaw/chin,
original feature fit, skin colours, ear roots, upper-neck join and hair coverage.
Do not approve this new candidate from automated checks or prior S5 approval.

Revision-3 validation: asset-validator typecheck, root lint (zero warnings),
current JavaScript/declaration build/export, historical CLI exports and both
face/ear integration workflows passed (56.36 seconds). The face workflow covers
actual planes, reduced cheek width, unchanged original reference features,
native source ownership, approved baseline preservation, deterministic output,
source hashes/mtimes and rejection of re-pinned head edits outside the local mask.
All 405 pre-increment source/reference hashes/mtimes remain unchanged; 60 current
and historical PNG hashes verified. Seventeen guide/head/ear/neck/mask/config
outputs reproduced byte-for-byte in scratch. `git diff --check` passed. An initial
strict optional-property typing error was corrected before successful build and
typecheck. Full application build/browser E2E were not rerun.

This source increment is uncommitted and needs visual approval. Production
anatomy, concealed features, materials, other facings and final Step 6C remain
open; Step 6D has not started. The revision-2 history below is superseded.

## Current eye-fit correction — revision 2

The user rejected revision 1: “overview.png is bad. eye position is not correct.”
Its exact source-coordinate extraction did not fit the separately authored head.
`review-fit-v1.json` pins that rejection. Native pixel ownership alone does not
establish correct anatomical attachment.

`authoring-v2.json` is now selected by `pnpm face:review`. A built-in imagegen
study uses the approved S skin with manual local eye/brow guides as its edit
target, and S's own reference for style. Four new native eye/brow layers retain
only manually selected same-side study pixels. The eye line is more balanced and
the eye shape/placement is authored for the current skull, nose and cheeks.
The generated geometry and brow colour differ from the reference; they require
human review along with position, contours and skin joins. These are authored
features, not relocated reference patches or panel-only display adjustments.

Approved head, small ears, neck, front/rear hair and the revision-1 reference-owned
mouth remain unchanged. Native origins stay `(511,169)` and layers draw at `(0,0)`.
No image shifts, scaling, mirroring or global colour keys are applied. All study
anatomy outside the four feature masks is discarded. The rejected sources,
configurations and extraction history are retained.

- Current `overview.png`: reference / approved ear-head-hair baseline / revision 2.
- `inspection/eye-fit-comparison.png`: reference / rejected revision 1 / revision 2.
- `anatomy-overview.png`: approved head / selected local features / bare assembly.
- `pnpm face:review:v1`: reproduce revision 1 under `historical-v1/`.

`prompts-v2.json` records the exact imagegen prompt and local inputs. The native
guide and partition scripts write exclusively and should be replayed in scratch.
Guide replay consumes the hash-pinned approved head assembly from `pnpm ears:review`;
normal facial review rebuilds its own approved ear baseline and never needs the
generated-image service or previous machine's temporary files.

Revision 2 is an unapproved S-only standing-reference candidate. Concealed eye
surfaces, expressions, materials, other facings, production T-pose and final
Step 6C remain open. The sections below describe the rejected extraction.

Revision-2 validation: asset-validator typecheck, root lint (zero warnings),
`pnpm face:review` JavaScript/declaration build/export, historical CLI export and
both face/ear integration workflows passed (48.11 seconds). The existing face
workflow verifies both versions, actual core planes/foreground depth, native
study ownership, unchanged mouth and approved ear fit, deterministic outputs,
input hashes/mtimes and re-pinned edit rejection. All 389 pre-correction source
files retain their hashes/mtimes, 33 current/historical PNG hashes verified and
ten guide/layer/mask/config outputs replayed byte-for-byte in scratch.
`git diff --check` passed. An initial property-order comparison incorrectly
rejected the unchanged mouth; it was fixed before successful export. Full app
build/browser E2E were not rerun. `fit-audit-v2.json` records results and limits.

Local commit `545526a` records approval of the smaller S human-ear checkpoint.
The original larger pair remains available as a future authored design option;
ear-size controls and automatic resizing are not implemented.

The next bounded increment separates visible eyes, brows and mouth from S's own
reference. `assets/source/heroine-v1/face/reference-v1/authoring-v1.json` pins
the approved ear configuration and approval, same-facing transparent reference,
selected manual polygons and native layers/masks. It stays outside the runtime
catalog and is an unapproved S-only standing-reference fit candidate.

## Source ownership and composition

Five independent transparent full-canvas layers preserve their selected source
RGBA at native coordinates. Character right is screen-left in S.

| Layer | Selected source | Visible pixels | Plane |
| --- | --- | ---: | --- |
| Physical right eye | `S-rightEye-v2.png` | 807 | `eyes` |
| Physical left eye | `S-leftEye-v2.png` | 906 | `eyes` |
| Physical right brow | `S-rightBrow-v2.png` | 70 | `eyebrows` |
| Physical left brow | `S-leftBrow-v2.png` | 56 | `eyebrows` |
| Mouth | `S-mouth-v2.png` | 177 | `mouth` |

Origins stay `(511,169)` and all parts draw at `(0,0)`. There is no mirroring,
shift, resampling, recolouring, colour-key removal or approved-source overwrite.
The first polygons included a small hair fragment at the right brow and excess
skin at the brows. Refined polygons tighten those selections and the left-eye
outer edge. Initial layer/mask/config/settings files remain as provenance.

`inputs/feature-selections-v2.json` supplies the selected manual geometry.
`derivation-v1.json` records immutable reference/import/ear pins and refinement
limits. The portable partition script writes exclusively and should only be
replayed in an isolated scratch copy. Normal review consumes retained sources.

The review API rebuilds the approved ear assembly in temporary inspection
storage, validates its approval hash, and composes the actual core S order:
rear hair, neck, masked head, separate ears, eyes, brows, mouth, foreground hair.
Nine selected right-eye pixels overlap foreground hair; the foreground layer
remains above them. The ear/head/hair baseline is exact before adding features.

These masks retain visible reference features and small local skin margins.
Concealed eyes/brows have not been authored. The source smile is a reference
study, not approved neutral/stern expression coverage. The original nose
highlight stays with the existing head. Independent eye palettes/material maps,
other facings, new expressions and ancestry variants remain unfinished.

## Inspection and approval

```bash
pnpm face:review
```

Ignored staging under `assets/staging/heroine-v1/face/reference-v1/` includes:

- `overview.png`: original S reference / approved smaller-ear head and hair /
  candidate with native facial features.
- `anatomy-overview.png`: approved head / isolated selected features / bare
  head and neck with the candidate features.
- `layers/` and `masks/`: five native transparent feature/mask pairs.
- `fit/`: candidate, bare candidate and unchanged approved ear-fit baseline.

The overview crops are native x320/y40/384×440 copies. Backgrounds and labels
belong only to previews. Inspect eye contours/lashes, brow completeness, mouth
edges, local skin colour joins, facial proportions and actual hair coverage.
Pixel ownership and deterministic composition do not establish anatomical
coherence. This new fit requires human visual approval before continuing to
the next increment; it does not approve other facings or final Step 6C.

## Validation — 2026-10-12

- `pnpm --filter @character-studio/asset-validator typecheck`: passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm face:review`: passed, including JavaScript/declaration build and export.
- `pnpm exec vitest run tools/asset-validator/src/face-review.integration.test.ts tools/asset-validator/src/ear-review.integration.test.ts`:
  both public workflows passed; 36.63 seconds. Coverage includes actual plane
  composition, foreground occlusion, native side ownership, approved ear-fit
  preservation, repeat output equality, input hashes/mtimes and rejection of
  re-pinned feature/selection edits outside permitted ownership.
- All 360 prior source/reference hashes and modification times unchanged;
  all 16 staging PNG hashes verified. Eleven selected layer/mask/config outputs
  replayed byte-for-byte in scratch. `git diff --check`: passed.
- An initial missing explicit layer-array type caused typecheck/declaration-build
  failures. It was corrected before the successful checks above. Full application
  build and browser E2E were not rerun for this offline tool/art increment.

The facial work is uncommitted and awaits approval. Other ear facings, concealed
hair, body/clothing and real shoulder-hair occlusion, materials, production T-pose
and independent pixel artwork remain open. N is still an unapproved head draft.
Step 6C remains unfinished; Step 6D has not started.
