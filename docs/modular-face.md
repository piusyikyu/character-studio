# Step 6C — native S facial-feature separation

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
