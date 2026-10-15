# Female Character Studio — Project Context and Handoff

## W visible-part approval — 2026-10-15

The user approved the W visible torso/left-arm/left-leg ownership study.
`body/parts-v1/west/review-fit-v1.json` pins the exact configuration, parts and
body/anatomy/hair-fit hashes. Far physical-right limbs remain explicitly
unavailable. This approval covers the native visible cuts and actual static
composition; concealed geometry, separate underwear, production rig and footwear
compatibility remain open. Next: independently traced SE visible-part cuts using
the approved SE revision-2 body/head/hair fit. Step 6C stays open; Step 6D has
not started. Earlier pending W notes below are historical.


## W visible-body-part study — 2026-10-15

Local commit `34adade` records the approved E visible-part study and exact native
fit after generated cleanup (64 files, 1.6 MiB). Its three source PNGs, settings,
replay, approval and all earlier body/head/hair sources remain intact.

The next bounded Step 6C increment is `body/parts-v1/west/`. Three original W
RGBA partitions use independently traced W shoulder/socket and brief-opening
cuts: torso with underwear, near physical-left arm and near physical-left leg.
No E contours or pixels are reflected, scaled or transferred. Far physical-right
arm/leg entries are explicitly occluded/unavailable and have no source PNGs;
full concealed limbs and joint geometry still require authored assets.

`pnpm body:review:parts:west` pins the accepted W revision-2 body/head/hair
configuration and approval. It rebuilds the original fit and composes the actual
five body slots with accepted head/neck/ear/eye/brow/mouth/hair layers in native
core W order. The existing near-hand hair-depth correction and removed red
reference-clothing fragment are preserved. Recomposition must match the accepted
body RGBA and both anatomy/fit PNG hashes exactly. No production catalog changes.

The E-only part loader/validator/geometry modules have been renamed to
`body-profile-parts-review.ts` and `body-profile-parts.ts`, sharing the validation
and native-copy algorithm while retaining separately authored E/W cuts and side
identity. The combined profile integration workflow also checks accepted E output.
Existing E source scripts and hashes remain unchanged.

Review `assets/staging/heroine-v1/body/parts-v1/west/overview.png`: recomposed
anatomy / accepted W fit / actual body-plane fit. Read `parts-overview.png` top
row whole visible body / torso / near left arm, then bottom row unavailable
far right arm / near left leg / unavailable far right leg. Empty review cells
declare missing geometry; no blank substitute asset is authored. Five current
review PNGs and metadata remain, and temporary exports are removed.

W shoulder/thigh cuts await human review and remain uncommitted. Separate
underwear/materials, concealed joints, other facing partitions, production rig
and alternate anatomy remain unfinished. Existing heel-oriented posture stays
provisional and conveys no new barefoot/flat-shoe/other-footwear approval.
Step 6C stays open; Step 6D has not begun. Earlier entries below are historical.


W-part verification: asset-validator typecheck, root lint (zero warnings), ESM/declaration build and both E/W part CLIs passed. The combined profile and cleanup integration workflows passed (3 tests, 91.64 seconds): accepted native E/W composition, exclusive source RGBA ownership, physical-side probes, unavailable far-side geometry, repeated deterministic exports, immutable inputs and rejection of altered side/pixels or foreign-facing W checkpoints. All three W source PNGs replay byte-for-byte; all 1,028 preceding source SHA/mtime pairs remain unchanged. Final cleanup removed 64 regenerated files (1.6 MiB); all 325 current output hashes and both hashed viewers verify. An initial config-file type inference issue was corrected. Full app build and browser E2E were not rerun. See `body/parts-v1/west/fit-audit-v1.json`.

## E visible-part approval — 2026-10-15

The user approved the E visible torso/right-arm/right-leg ownership study.
`body/parts-v1/east/review-fit-v1.json` pins the exact configuration, parts and
body/anatomy/hair-fit hashes. Far physical-left limbs remain explicitly
unavailable. This approval covers the native visible cuts and actual static
composition; concealed geometry, separate underwear, production rig and footwear
compatibility remain open. Next: independently traced W visible-part cuts using
the approved W revision-2 body/head/hair fit. Step 6C stays open; Step 6D has
not started. Earlier pending E notes below are historical.


## E visible-body-part study — 2026-10-15

Local commit `649c597` records the approved SW revision-5 clothing colour and
all-eight review tools after generated cleanup (64 files, 1.6 MiB). All eight
individual fits have explicit approval; the combined sheet remains a study
review rather than production anatomy or rig acceptance.

The next bounded Step 6C increment is `body/parts-v1/east/`. Three native RGBA
partitions select the original E torso with underwear, near physical-right arm
and near physical-right leg. E-specific shoulder/socket and brief-opening cuts
copy original pixels at (0,0), without transformations, colour edits or new art.
The far physical-left arm and leg have no separately recoverable source geometry:
the five semantic entries explicitly mark them occluded/unavailable. No empty
source PNGs or mirrored replacement limbs are created. This study cannot certify
a complete reusable five-part rig; concealed limbs/joints must be authored later.

`pnpm body:review:parts:east` checks exclusive ownership, rebuilds the accepted
E pipeline, then composes the actual five body-plane slots with every original
head, neck, ear, eye, brow, mouth and hair plane in the core E order. Body-only
RGBA and both anatomy/fit PNG hashes must match the accepted E study exactly.
Temporary baseline/part exports are removed. Staging retains five review PNGs
and metadata; cleanup protects only the current declared outputs.

Review `assets/staging/heroine-v1/body/parts-v1/east/overview.png`: anatomy from
parts / accepted E fit / actual body-plane fit. In `parts-overview.png`, read
top row whole visible body / torso / near right arm, then bottom row unavailable
far left arm / near right leg / unavailable far left leg. The two empty review
cells are deliberate declarations of missing geometry, not authored assets.

Shoulder and thigh cut locations await human approval. Underwear stays baked
into the torso; separate garments, skin/material layers, concealed joints, other
facing partitions and the production rig remain unfinished. Existing heel-based
foot posture is unchanged and establishes no new footwear compatibility. Step 6C
stays open; Step 6D has not begun. This new study is uncommitted. Earlier entries
below describe historical candidates and approvals.


E-part validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration build and the current E part CLI passed. The E partition and cleanup integration workflows passed (2 tests, 45.22 seconds), covering actual accepted E composition, exclusive RGBA ownership, physical-side probes, unavailable far-side geometry, deterministic exports, immutable inputs and rejected side/repinned-pixel edits. All three source PNGs replay byte-for-byte; all 1,019 preceding source hashes/mtimes are unchanged. Final cleanup removed 64 regenerated files (1.6 MiB), preserving all 320 current output hashes and both hashed viewers. An initial scratch child-process launch was blocked by the sandbox; in-process replay passed. Full app build and browser E2E were not rerun. See `body/parts-v1/east/fit-audit-v1.json`.

## SW clothing colour approval — 2026-10-15

The user approved the revision-5 lighter cool-grey bra and briefs.
`body/front-diagonals-v1/review-fit-sw-v5.json` records the exact configuration
and native anatomy/fit hashes. Only selected fabric RGB differs from the prior
approved SW study; geometry, alpha, skin, head, hair and other facings are intact.
The current all-eight review uses `body/assembly-v1/review-selection-v3.json`
with an explicit SW revision-5 approval pin; earlier selections remain replayable.
All individual fits are approved. The combined sheet remains a study review;
concealed anatomy, separate garments/materials, footwear compatibility and a
production T-pose rig remain unfinished. Step 6C stays open; Step 6D has not begun.
Next: a native E-facing visible-body-part partition study.


## SW clothing colour consistency — revision 5 — 2026-10-15

The user identified SW underwear as darker/warmer than the other views and
requested a correction. `body/front-diagonals-v1/authoring-sw-v5.json` selects
a fabric-only derivative of the approved SW revision-4 fit. A built-in imagegen
colour study uses the exact accepted SW anatomy and SE colour reference. Its
anatomy, skin, linework and alpha are unselected. Median fabric RGB offsets are
applied to bounded original bra/strap/band and brief material pixels, fading to
zero at dark outlines and retaining the original shade variation.

`SW-body-v5.png` and `SW-clothing-mask-v5.png` retain exact original body alpha
and placement. Every pixel outside the nonzero fabric selection is unchanged.
The corrected bare anatomy is identical to its accepted guide outside that
selection; the layered fit likewise retains its baseline outside-selection hash.
Inside the selection, source-over composition of the original body and approved
front/rear hair must first match the old native fit exactly. Only then are the
new garment colours substituted using the same actual plane order. Head, eyes,
brows, mouth, ears, skin, hair, hands, feet and all other facings stay intact.

`pnpm body:review:front-diagonals:southwest` now selects revision 5. Six current
PNGs and metadata remain in southwest staging; `inspection/SW-clothing-comparison.png`
shows old / corrected fabric, anatomy above and actual hair fit below. The new
`--southwest-v4` CLI flag reproduces the retained approved fit in historical staging.
Keep the selected colour study, exact edit/reference guides, native body/mask,
settings, prompt provenance and scratch-only `recolour-clothing-sw-v5.js`. The
first image attempt was rejected at the output check; the complete-character
retry succeeded. No CLI/API fallback was used.

The all-eight viewer uses versioned `body/assembly-v1/review-selection-v2.json`.
Its baseline frame pins retain all eight individual approvals, with an explicit
unapproved SW clothing candidate. The other seven cells still match approval.
The original `review-selection.json` is retained for exact historical export via
the API selectionFile option. Current metadata/viewer identify SW as awaiting
colour approval; the correction does not silently inherit the old fit approval.

No new body preset, runtime material contract or published catalog is introduced.
Full material maps, separate underwear/limbs, concealed anatomy, production rig,
footwear compatibility and native pixel artwork remain unfinished. The colour
fix and combined review are uncommitted and await approval. Step 6C stays open;
Step 6D has not started. Earlier entries below are historical.

Validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration build, current SW export and the all-eight export passed. Clothing/cleanup workflows passed (2 tests, 1.63 seconds); the repeated all-eight workflow passed (1 test, 171.88 seconds). They verify exact alpha, unchanged skin and all pixels outside the fabric mask, actual native composition, seven unchanged approved cells, determinism and rejected re-pinned skin edits. Chromium verified the updated viewer outside the sandbox. Both derived PNGs replay byte-for-byte; all 1,004 preceding source hashes/mtimes are unchanged. Final cleanup protects the six current SW PNGs and two body-set sheets/viewer; all 315 current output hashes and both viewer hashes verify. Initial reference-pin and rounded-mask-count issues were corrected. Full app build and the app-wide browser suite were not rerun. See `fit-audit-sw-v5.json` and the body-set revision-2 audit.


## Eight-facing body review candidate — 2026-10-15

Local commit `8f2a0b2` records the approved independent NW study after generated
cleanup (60 files, 1.6 MiB). All eight selected whole-body study fits now have
individual approval. The next bounded Step 6C increment consolidates their exact
accepted body/head/hair compositions; it introduces no new artwork or runtime
catalog changes.

`body/assembly-v1/review-selection.json` pins N v1, NE v2, E v1, SE v2, S v6,
SW v4, W v2 and NW v1 configurations and their individual approvals.
`pnpm body:review:all` rebuilds all eight source pipelines in temporary storage,
requires both anatomy and layered fit to match each accepted native PNG hash,
then removes those temporary exports. No source selection or image is replaced.

Current staging at `assets/staging/heroine-v1/body/assembly-v1/` contains only two
4096×3072 sheets, metadata and `inspection/body-review.html`. The native grid is
N / NE / E / SE, then S / SW / W / NW. Every cell stays 1024×1536 at its native
position; no mirroring, resizing, recentering, pose correction or baseline shift.
Checker and yellow labels decorate review sheets only. The viewer switches
hair/anatomy, all facings/a single facing, and 25% / 50% / 100% native zoom.
Browser preview zoom never modifies the source or native sheet pixels.

All individual hashes match approval, including the local S/W/SW head/hair and
eye corrections. Review body build and head-to-body scale, neck/shoulder/hair
roots, physical hand identity and rear-facing feature visibility together. Feet
retain different authored poses/native heights: anatomy bottom rows range from
NE 1448 to SW 1486. This bounds observation does not establish a common ground
baseline or arbitrary footwear compatibility. Any correction needs a new scoped
source version and approval; no existing limb is silently deformed or mirrored.

The combined body set is unapproved/uncommitted. S/N have approved visible-part
partition studies; remaining facings need their own partitions. Complete concealed
joints, reusable anatomy, separate underwear/garments/materials, production rig,
variants and independent native pixel artwork remain unfinished. Step 6C stays
open; Step 6D has not started. Earlier candidate/next-step entries are historical.

Validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration
build and the all-eight native export passed. Two focused integration workflows
passed in 166.02 seconds: every panel matches its individually approved native
export, repeated full rebuild is deterministic, wrong-facing/stale pins and unsafe
outputs fail, and metadata cleanup preserves current sheets/viewer. A Chromium
workflow verified all/isolated NW, anatomy/hair, native/50% zoom, sheet crop and
full-resolution image decode without page errors. Chromium required execution
outside the sandbox because its process startup was blocked inside. Full app
build and the app-wide browser suite were not rerun. Final source/cleanup audit
is in `body/assembly-v1/fit-audit-v1.json`.

Final cleanup removed 63 generated build files (1.6 MiB). All 1,003 preceding source hashes/mtimes remain unchanged; 315 current metadata-declared output hashes and both hashed viewers verify after cleanup. Only the two current native sheets, their viewer and metadata remain in the consolidated staging folder.


## NW body approval and eight-facing review — 2026-10-15

The user approved the independent NW body and posterior head/hair fit.
`body/back-diagonals-v1/review-fit-nw-v1.json` pins its configuration, six current
exports and exact source dependencies. Keep the approved source pack and replay
inputs; cleanup removes only obsolete generated data.

All eight whole-body direction studies now have individual fit approval. Next
consolidate the selected native S/N/E/W/SE/SW/NE/NW body/head/hair compositions for
a cross-facing review, retaining each exact approved local head/hair revision,
physical side identity and natural pose/baseline differences. No mirrored or
rescaled panels, silent substitutions or source-art edits. Consolidated review
requires its own visual approval. Remaining independent part partitions and
concealed joints, separate garments/materials, production anatomy/T-pose,
provisional footwear geometry and native pixel artwork remain unfinished.
Step 6C stays open; Step 6D has not started. Earlier entries are historical.

## Independent NW body candidate — 2026-10-15

Local commit `39fc7ab` records the approved NE revision-2 proportion refit and
requested cleanup (60 generated files, 1.6 MiB). NW is now independently authored
using its own exact accepted head/neck guide and approved N/NE anatomy as build
and style references. It is not a mirrored NE or a collection of foreign-facing
body fragments. Built-in imagegen prompt and native reference pins are saved in
`body/back-diagonals-v1/prompts-nw-v1.json`.

`authoring-nw-v1.json` selects the new native 1024×1536 T-pose study, with ordinary
opaque grey daily bra and full-coverage briefs. Approved NW head/ear and
`NW-rear-v2.png` hair remain exact; eyes, brows, mouth and front hair stay hidden.
Only matching body-covered neck pixels in rows 288–302 transfer ownership.
All 245,582 near-opaque body pixels and all 13,407 checked hand/forearm interiors
retain source RGBA; intrinsic alpha supplies the finger/leg gaps. Native manual
envelopes use no transforms, mirrors, colour keys, white cleanup or global blur.

`pnpm body:review:back-diagonals:northwest` exports six PNGs and metadata to
`assets/staging/heroine-v1/body/back-diagonals-v1/northwest/`. The overview shows
original NW reference / native anatomy / actual retained-hair composition.
`inspection/NW-proportion-comparison.png` shows approved N / approved NE revision 2 /
new NW at identical native panel scale. Hand inspections use actual alpha on
dark/light backgrounds. NE current views and pinned approval stay intact.

Keep the selected study, exact NW head guide, approved NE proportion guide,
body/mask and posed-neck/mask, settings/prompts and scratch-only replay. The
existing identical N proportion guide is reused. Generated head and invisible
background RGB are unselected. Current metadata protects the nested NW review
from cleanup; missing independent inputs fail explicitly rather than using NE.

NW remains unapproved and uncommitted. Review its torso/pelvis/leg orientation,
near physical-left and far physical-right hands, underwear topology, actual
neck/hair joint and inherited hair edges, and provisional feet/sole posture.
Directional whole-body studies do not certify concealed geometry, separate
reusable limbs/garments/materials, a production T-pose rig, arbitrary footwear or
independent native pixel artwork. Step 6C stays open; Step 6D has not started.
Earlier candidate/next-step statements below are historical.

Validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration build and native NW export passed. Five focused integration tests passed in 59.41 seconds, covering both historical NE revisions, independent NW composition, preserved head/hair, complete body/hand alpha, bounded neck ownership, determinism, missing-art rejection and nested-review cleanup protection. Four source outputs replay byte-for-byte; all 989 preceding source hashes/mtimes and approved NE review hashes remain unchanged. Final cleanup removed 60 generated files (1.6 MiB); all 313 current metadata-declared output hashes verify afterward. Initial subset-schema and test-type errors were corrected; no final check remains failed. Full app build and browser E2E were not rerun. NW remains unapproved; see `fit-audit-nw-v1.json`.


## NE body approval — revision 2 — 2026-10-15

The user approved the NE proportion refit and current posterior head/hair fit.
`body/back-diagonals-v1/review-fit-ne-v2.json` pins the configuration, six review
exports and native source dependencies. Both NE revisions and their replay/prompt
inputs remain retained; approved preceding artwork stays unchanged. Requested
cleanup removes regenerable build/obsolete review data, preserving current views.

Next independently author NW using its own accepted head/neck/ear guide and the
approved N/NE body proportions. Keep ordinary opaque daily bra and briefs,
complete native hands, three-quarter-back torso/pelvis/feet and no eyes, brows,
mouth or front hair. Never mirror NE or copy foreign-facing body fragments.
NW requires its own visual review. Concealed geometry, reusable limbs/garments,
material maps, production T-pose, provisional feet and independent pixel assets
remain outstanding. Step 6C stays open; Step 6D has not started. Earlier candidate
statements below are historical.

## NE body proportion refit — revision 2 — 2026-10-15

The user requested NE consistency with the established body build. The current
`body/back-diagonals-v1/authoring-ne-v2.json` selects a new built-in imagegen edit
of revision 1, explicitly guided by the approved native N and SE anatomy exports.
The waist/limbs are more tapered, shading follows the established detailed style,
and ordinary full-coverage briefs sit lower, closer to the N reference waistband.
This remains the same body design, not an additional preset or recipe lever.

Native 1024×1536 placement stays unchanged. The exact accepted NE head/ear and
posterior hair sources remain intact; generated head pixels are unselected.
Only body-covered neck pixels in rows 294–307 transfer ownership, retaining the
closed sloped neck joint. The prior native silhouette and hand envelopes preserve
all 236,841 near-opaque study body pixels and all 11,094 checked hand interiors.
No mirroring, foreign-facing body fragments, scaling, warping, colour key or blur.
The invisible RGB glow below alpha 8 is cleared; source alpha supplies the edges.

`pnpm body:review:back-diagonals` selects revision 2 and exports six PNGs plus
metadata. `inspection/NE-proportion-comparison.png` columns are approved N /
previous NE revision 1 / new NE revision 2 / approved SE, at identical native
panel scale. `overview.png` remains original NE reference / anatomy / actual hair
composition. The CLI's `--northeast-v1` option regenerates historical review in
its own `revision-1/` folder. Keep both source revisions, selected edit/proportion
guides and study, settings, prompt provenance and scratch-only replay scripts.

NE revision 2 awaits visual approval. Review rear-diagonal projection, ordinary
bra/brief topology, hands and foreshortening, neck/hair roots and provisional
foot posture. Source/alpha checks do not establish anatomical coherence or shoe
compatibility. NW remains missing; Step 6C stays open and Step 6D has not started.
Earlier NE candidate statements below are historical.

Validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration build and current NE export passed. Four focused integration tests passed in 43.13 seconds, covering both native revisions, preserved posterior head/hair, body/hand alpha, neck ownership, determinism and cleanup protection. An initial revision-2 probe landed on the newly authored antialiased neck contour; its interior probe and exact edge-alpha check now distinguish that valid edge from a gap. All 975 preceding source hashes/mtimes remain unchanged, all four derived source outputs replay byte-for-byte, and all six current review PNG hashes verify. Full app build and browser E2E were not rerun. NE remains unapproved/uncommitted; see `fit-audit-ne-v2.json`.


## NE proportion review — 2026-10-15

The user flagged the current NE body as significantly fuller than the other
facings. Comparison of all seven current native anatomy exports confirms a
fuller-looking NE silhouette, especially the upper arms and calves, with softer
contours/shading and a broader waist than the front diagonals. The narrowest
near-opaque waist spans are NE 141 px, N 143 px, S 122 px, SE 128 px and SW
128 px. These are projected image widths, not measurements of body circumference;
different facing angles and poses must be considered. Hip spans differ less.

The selected NE generation used only its accepted head/neck guide, with a generic
balanced-build instruction; the original NE design was a comparison reference,
not an input to that selected generation. Native selection retained the study's
body pixels, so this proportion drift originates in the authored study rather
than scaling by the compositor or clipping by its masks. NE needs a proportion
refit using the established body build before approval or progressing to NW.
Retain the accepted head/neck placement and ordinary two-piece underwear. No
artwork was changed or approved in this comparison.

## Independent NE body candidate — 2026-10-14

The previous output-generation blockage is resolved. A new built-in imagegen
study uses only the exact accepted native NE posterior head/neck guide. NE is
independently authored; no foreign-facing body fragments, mirrors or transforms.
The original same-facing standing reference is retained for the review comparison.

`body/back-diagonals-v1/authoring-ne-v1.json` selects the new whole-body T-pose
study with ordinary opaque daily bra and high-waisted full-coverage briefs. The
bra has a posterior band/clasp and two straps. Approved NE head/ear and rear hair
sources remain exact; eyes, brows, mouth and front hair stay absent. Native
body/hand envelopes retain source RGB and alpha, including all 253,975 near-opaque
body interiors and all 11,336 checked hand/forearm interiors. Intrinsic alpha
supplies finger and leg gaps; no white cleanup, colour key or global opacity edit.

The first row-300 body cut exposed a gap at the sloped native NE neck base.
Selection now starts at row 294. Only body-covered source neck pixels in rows
294–307 transfer to the new body, preserving all other head/neck pixels. The
actual core posterior plane order overlays the retained hair on the new body.
This closes the local gap without moving anatomy or inspection panels.

`pnpm body:review:back-diagonals` rebuilds five PNGs and metadata at
`assets/staging/heroine-v1/body/back-diagonals-v1/`: `overview.png` shows reference /
anatomy / actual hair fit, `fit/NE-anatomy.png` and `fit/NE.png` are native RGBA,
and the two inspections show the neck/shoulder fit and hands on dark/light
backgrounds. Replay `partition-study-ne-v1.js` only in scratch. The selected
study, exact head guide, four derived layer/mask outputs, settings and prompt
provenance remain required source inputs. The redundant pending JSON was removed;
failed-attempt details remain in `prompts-ne-v1.json`. No CLI/API fallback was used.

Review rear-diagonal torso/pelvis/leg orientation, physical hand identity and far
finger overlap, bra/brief topology, head/neck/hair roots, inherited hair edges
and provisional foot/sole posture and native endpoint heights. Automated checks
do not establish anatomical coherence or arbitrary footwear compatibility.
NE remains unapproved/uncommitted; NW is not supplied or mirrored. Reusable
concealed geometry, limbs/garments/materials, presets, production T-pose and
independent native pixel artwork remain unfinished. Step 6C stays open; Step 6D
has not started. Earlier pending entries below are historical.


Validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration build and current native NE exports passed. Three focused integration tests passed in 25.71 seconds, including actual source composition, all body/hand interiors, the closed sloped neck joint, deterministic output, foreign-facing/ownership rejection and current-review cleanup protection. Four source outputs replay byte-for-byte; all 964 preceding source hashes/mtimes remain unchanged. Cleanup removed 60 generated files (1.6 MiB); 306 current metadata-declared output hashes verify. Full app build and browser E2E were not rerun. See `body/back-diagonals-v1/fit-audit-ne-v1.json`.

## NE body authoring checkpoint — 2026-10-14

Local commit `30fe9ad` records approved SW revision-4 body/head/hair fit.
Requested cleanup removed 58 generated build files (1.6 MiB), preserving current
reviews and all pinned source/approval records.

The next independently authored NE body used its accepted native rear-facing
head/neck guide and NE reference. Both built-in imagegen attempts were rejected
at the output safety stage. No image was returned, selected or published. The
unused guide copy was removed; prompts, request IDs, native guide pins and resume
constraints are saved in [selected NE provenance](../assets/source/heroine-v1/body/back-diagonals-v1/prompts-ne-v1.json).

The offline NE review schema, native silhouette/neck ownership, CLI and metadata
cleanup support are prepared. Typecheck, lint and ESM/declaration build pass. Two
focused integration workflows pass using a scratch-only synthetic body fixture:
actual posterior composition, hidden facial planes, unchanged approved head,
opaque hand interiors and natural source-alpha gaps/edges, determinism, native
source ownership, rejected foreign-facing head, and protected metadata cleanup.
These checks do not validate anatomy or supply a production asset. Real NE export
fails explicitly while artwork is missing; NW is not supplied or mirrored.

NE generation remains pending; this preparation is uncommitted. The CLI/API
fallback was not invoked: the imagegen skill requires an explicit user request
and a configured `OPENAI_API_KEY`. Approved source art is unchanged. Step 6C
remains open; Step 6D has not started. Earlier next-step entries are historical.


## SW body and head/hair approval — 2026-10-14

The user approved revision 4 and requested generated-data cleanup, a local commit
and the next Step 6C increment. `body/front-diagonals-v1/review-fit-sw-v4.json`
pins its configuration, six current exports, complete far eye, repaired head/hair
layers and unchanged body/posed-neck sources. Approval covers this current SW
study and fit; the all-eight standing head selection and preceding approved
source art remain intact. All 10,482 checked native hand interiors remain retained.

Next author the independent NE three-quarter-back body, with its own approved
head/ear/neck guide and same-facing NE reference, ordinary opaque daily bra and
panties, complete hands, and no eyes/brows/mouth or front hair. NW follows its own
review and independent authoring; no mirroring or foreign-facing body fragments.

Concealed geometry, reusable limbs/garments/materials, provisional heel-based feet,
production T-pose and independent native pixel artwork remain outstanding. Carry
forward the from-scratch per-asset authoring note and alternate-hairstyle ear
proportion review debt. This approval stays within Step 6C; Step 6D has not started.
Earlier candidate/pending statements below are historical.


## SW head and hair contour quality — revision 4 — 2026-10-14

The user requested smoother SW head/hair edges and repair of transparent gaps,
while retaining the improved body and eyes. `body/front-diagonals-v1/authoring-sw-v4.json`
is the current candidate. Five bounded regions repair the jaw/chin, visible jaw
outline, fringe, near neck lock and rear strand beneath the chin. A local head
study supplies skin; SW's own intact reference supplies visible jaw and hair
contours. A new rear hair study supplies the concealed under-chin strand.

The tiny rear repair was painted from an enlarged 64×96 native crop, with an
explicit 16× guide. Premultiplied area sampling returns it to that exact window;
only 42×29 native rear pixels can change. This is detailed-art authoring and does
not produce or validate pixel-target artwork. Existing parts retain native placement.
Native 4×4 contour coverage and bounded interior joins preserve opacity; no global
blur, white cleanup, colour keys, mirroring or whole-part deformation.

Both eye sources, brows/mouth, ear, body/mask, posed neck, underwear, hands, legs
and feet retain revision-3 sources. Approved artwork and the all-eight head
selector remain unchanged. Current anatomy changes only in the marked jaw region;
front/rear hair changes only in their local masks. Earlier configurations remain
pinned derivation inputs; revision 4 remains unapproved and uncommitted.

`pnpm body:review:front-diagonals:southwest` selects revision 4. Current
`inspection/SW-eye-hair-comparison.png` columns are reference / revision 3 /
revision 4, with anatomy above the actual layer composition. Native `fit/SW.png`
and `fit/SW-anatomy.png` are the review exports. Historical CLI flags
`--southwest-v1`, `--southwest-v2` and `--southwest-v3` remain available.
Replay `partition-quality-sw-v4.js` only in scratch; keep the two selected
studies, head/rear guides, nine layer/mask outputs, settings and prompts as source
inputs. Discarded generation attempts are not repository dependencies.

Step 6C stays open; Step 6D has not started. Concealed geometry, variants/materials,
production T-pose, provisional heel-based feet and independent pixel assets still
require their own work and approval. Earlier SW entries below describe historical
selections. Final validation is recorded in `fit-audit-sw-v4.json`.


Final revision-4 validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration build, current SW / historical SW revision 3 / current SE exports passed. Historical facing/composition and cleanup checks passed (3 tests, 344.03 seconds); final rear-patch checks passed (2 tests, 41.08 seconds). Nine source outputs replay byte-for-byte; all 945 preceding source hashes/mtimes are unchanged. Cleanup removed 65 generated files (6.6 MiB), then 301 metadata-declared outputs were hash-verified. Full app build and browser E2E were not rerun. Initial probe-coordinate and unused replay-helper failures were corrected; no final check remains failed.

## SW hair fit on retained eye/body — revision 3 — 2026-10-14

The user said the revision-2 eyes are better and requested hair fitting at three
marked locations. `review-eye-sw-v2.json` records retaining that eye/body while
the hair remains a candidate. This is scoped feedback, not final Step 6C approval.

`body/front-diagonals-v1/authoring-sw-v3.json` selects a new local hair study
against the actual revision-2 native assembly. Only the far-eye fringe edge,
chest lock and neck/shoulder boundaries receive changes. Four local ownership
regions select same-facing study hair or erase detached fragments. The chest lock
now has a continuous rounded end; the dangling shoulder crescent/triangle are
removed; the fringe joins the far-eye edge. Native 4×4 mask coverage and a bounded
six-row parent-strand blend retain smooth detail without image transforms,
mirroring, broad colour keys or global white cleanup. Generated anatomy/body,
background glow and unmarked hairstyle edits stay unselected.

Bare anatomy is byte-identical to revision 2, including both eyes, head/ear/neck,
brows/mouth, body/mask, posed neck, ordinary bra/panties, all 10,482 checked hand
interiors, legs and feet. All 931 preceding source hashes/mtimes remain unchanged.
Earlier revisions and approved head/hair records are retained as baselines; the
new hair does not silently replace the all-eight head selection or runtime catalog.

`pnpm body:review:front-diagonals:southwest` now selects revision 3. Current
`inspection/SW-eye-hair-comparison.png` shows reference / revision 2 / revision 3,
with identical bare anatomy above actual layered hair fit. `overview.png` shows
reference / native anatomy / candidate fit. Historical `--southwest-v2` and
`--southwest-v1` CLI flags remain available. Replay
`partition-hair-fit-sw-v3.js` only in scratch. The selected study, native guide,
local masks/settings/provenance and six new source outputs remain derivation inputs.

Current SW hair fit is unapproved and uncommitted. Review strand continuity,
fringe/eye occlusion, root joins and alpha edges in the actual assembly. Remaining
inherited edges, concealed geometry, variants/materials, production T-pose,
footwear compatibility and independent pixel artwork remain open. Step 6C is
unfinished; Step 6D has not started. Earlier SW selections below are historical.

Validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration
build, current SW / historical SW revision 2 / current SE exports passed. Existing
actual-composition and cleanup workflows passed (2 passed, 7 skipped; 300.71
seconds), checking identical bare anatomy and eye/body pins, native study hair
ownership/highlights, exact preservation outside masks, hand interiors,
determinism and rejection of re-pinned foreign hair edits. All 931 preceding
source hashes/mtimes remain unchanged; six source outputs replay byte-for-byte
in scratch. Full app build and browser E2E were not rerun. See
`body/front-diagonals-v1/fit-audit-sw-v3.json`.


## SW purple eye/curl correction — revision 2 — 2026-10-14

The user considers the SW body generally good but identified purple blobs around
the physical-right/far eye and foreground hair. This qualifies the body-study
feedback; it does not approve the old eye/hair fit.
`body/front-diagonals-v1/review-body-sw-v1.json` records that distinction.

Inspection traced the eye blob to reference hair retained in the facial
extraction, and the curl blobs to broad foreground ownership masks. A new
built-in imagegen study authors the complete SW right eye, including geometry
usually concealed by bangs. The first study enlarged the head and was discarded;
the selected second study retains native framing. Only 480 locally selected eye
pixels enter the candidate. All other generated anatomy/glow is discarded.

Two bounded foreground windows reconstruct curl contours using only SW's own
reference RGB with 4×4 mask coverage; a small rear mask removes the marked
shoulder fragment. No mirroring, artwork transforms, global colour keys or
broad white cleanup. Bright strand highlights and all hair outside these windows
remain retained. Source head/ear/neck, other eye, brows, mouth, body/mask, posed
neck, underwear, legs/feet and all 10,482 checked hand interiors remain exact.
Previous approved head/hair records and revision-1 derivation inputs stay intact.

`authoring-sw-v2.json` is now selected by
`pnpm body:review:front-diagonals:southwest`. Its six current PNGs include
`inspection/SW-eye-hair-comparison.png`: reference / revision 1 / revision 2,
with bare anatomy above actual hair composition. Historical SW revision 1 is
reproducible with the CLI `--southwest-v1` flag. Authoring scripts replay only
in scratch. The corrected facial/hair candidate is scoped to this body review;
it has not silently replaced the accepted all-eight head selection.

Review the complete far eye, strand taper/openings and local transitions.
Remaining inherited head/hair edges and anatomical seams are not certified clean.
Corrected SW fit remains unapproved and uncommitted. General body feedback does
not certify reusable geometry, garments/materials, production T-pose, footwear
compatibility, independent pixel art or final Step 6C. Step 6D has not started.
Earlier SW revision-1 selection/pending-generation entries below are historical.

Validation for SW revision 2: asset-validator typecheck, root lint (zero
warnings after removing an unused replay helper), ESM/declaration build, current
and historical SW exports and current SE export passed. The existing composition
and cleanup workflows passed (2 passed, 7 skipped; 256.93 seconds), including
actual corrected facial/hair planes, retained highlights, unchanged body/hand
interiors, unchanged pixels outside masks, deterministic output, source immutability
and rejected re-pinned out-of-mask hair edits. All 915 preceding source hashes/
mtimes stay exact; eight final guide/layer/mask outputs replay byte-for-byte in
scratch. Full app build and browser E2E were not rerun. See `fit-audit-sw-v2.json`.


## Independent SW body candidate — 2026-10-14

The generation blockage below is resolved. A new built-in imagegen study supplies
SW's own body using only the accepted native SW head guide and same-facing SW
reference. No SE/E/W/S/N body pixels or mirrored anatomy supply this candidate.
`body/front-diagonals-v1/authoring-sw-v1.json` selects it separately from approved
SE revision 2. `pnpm body:review:front-diagonals:southwest` exports five PNGs
and metadata under `assets/staging/heroine-v1/body/front-diagonals-v1/southwest/`.
Normal `pnpm body:review:front-diagonals` continues to select SE revision 2.

The body uses ordinary opaque bra/panties and native T-pose study framing. Local
body/hand envelopes select SW study pixels; native alpha supplies finger gaps and
contours. All 10,482 near-opaque hand pixels retain exact source RGBA in the body
and alpha in the actual anatomy export. Generated head/background stay unselected.
Accepted head/ears/eyes/brows/mouth and source hair retain native anchors/pixels;
only a new posed-neck derivative transfers coverage in rows 294–316 where the
body supplies skin. Replay `partition-study-sw-v1.js` in scratch only.

Review `overview.png` (reference / anatomy / actual hair fit), the native
`fit/SW-anatomy.png` and both joint/hand comparisons. Inherited angular front-hair
ends remain exposed near neck/chest; current source hair was preserved and is not
certified clean. Review projected torso/pelvis, far-hand finger overlap, near
physical-left/far physical-right arm identity, neck transitions and provisional
heel-raised feet. Automated checks do not certify anatomy or footwear.

SW remains unapproved and uncommitted. NE/NW bodies, concealed geometry, reusable
limbs/garments/materials, presets, production T-pose and independent pixel artwork
remain unfinished. Step 6C is open; Step 6D has not started. Earlier pending
generation statements are historical; selected prompt/provenance now lives in
`assets/source/heroine-v1/body/front-diagonals-v1/prompts-sw-v1.json`.

Validation for SW: asset-validator typecheck, root lint (zero warnings),
ESM/declaration build, SW and current SE CLI exports passed. The extended existing
E/W/SE/SW actual-plane and cleanup workflows passed (2 passed, 7 skipped;
205.59 seconds). All 904 preceding heroine source hashes/mtimes are unchanged;
four new source outputs replay byte-for-byte in scratch. Full app build and
browser E2E were not rerun. See `fit-audit-sw-v1.json`.

## SW body authoring checkpoint — 2026-10-14

Local commit `07d2ddd` records the approved SE body and revision-2 native
hand fit. Requested cleanup removed 58 regenerable build files (1.5 MiB),
retaining the current reviews and pinned derivation baselines.

The next independent SW body study was attempted using SW's accepted native head
and same-facing reference with ordinary opaque bra and panties. Both built-in
imagegen attempts were rejected at the tool's output safety stage. No generated
output, selected SW body, masks or review candidate exists. The unused guide copy
was removed. That blockage is resolved by the later candidate above. Its selected prompt and
provenance are retained in `body/front-diagonals-v1/prompts-sw-v1.json`.

All preceding source artwork remains unchanged. SW authoring remains the next
bounded increment within Step 6C; NE/NW bodies, reusable geometry/materials,
footwear compatibility and independent pixel artwork remain unfinished. Step 6D
has not started. This pending-authoring checkpoint is uncommitted.

## SE body and native hand revision-2 approval — 2026-10-14

The user approved the corrected SE study and authorized cleanup, a local commit
and the next bounded Step 6C increment.
`body/front-diagonals-v1/review-fit-v2.json` pins the selected
`authoring-v2.json`, anatomy/fit exports and local hand-repair inputs. All five
current review PNG hashes and the configuration hash were verified. Revision-1
source/config and selected generated study remain required derivation baselines.

Approval covers the current SE whole-body study and intact native hands. It does
not certify concealed geometry, reusable limbs/garments, remaining hair edges,
heel-raised footwear compatibility, production T-pose, native pixel artwork or
final Step 6C. Step 6D has not started. Existing focused validation below remains
applicable; full application build and browser E2E were not rerun.

Next independently author the SW body using its own accepted native head and SW
reference, with ordinary daily bra and panties. Preserve the approved SE and
other facings. Keep complete hand interiors from the first SW selection and
review actual native head/neck/body/hair composition before human approval.
Earlier pending SE statements below are historical and superseded.

## SE native hand-export correction — revision 2 — 2026-10-14

The user briefly approved SE revision 1, then reported partly transparent hands
in the native `fit/SE-anatomy.png` before any approval commit or next increment.
The generated study had intact hands; the exported hand masks erased finger/palm
interiors that the reduced overview and sparse sample checks missed. Treat that
approval as qualified by this feedback. No SE commit or SW work has occurred.

Current review selects `body/front-diagonals-v1/authoring-v2.json`. This repair
retains SE's own native study RGB and alpha inside two bounded hand windows.
Manually selected envelopes enclose the complete hands; the study's native alpha
supplies finger contours and spaces, instead of narrow paths through the fingers.
All 8,247 near-opaque source hand pixels retain their exact RGBA, including
2,521 interiors previously erased or attenuated by the masks. Boundary
antialiasing remains; no opaque paint, colour key, generated anatomy, shifts,
scaling or mirrors are used. Body/mask bytes outside the hand windows, posed neck,
head/ears/eyes/brows/mouth, hair, underwear, legs and feet remain unchanged.
Original revision-1 source/config and the selected study remain pinned baselines.

`pnpm body:review:front-diagonals` now exports revision 2 to the same staging
folder, including the corrected standalone native `fit/SE-anatomy.png` and actual
hair fit. `inspection/SE-hand-alpha-comparison.png` compares native study /
revision-1 export / revision-2 export for both hands on dark and light backgrounds;
4× nearest-neighbour enlargement is inspection-only. The historical `--v1` CLI
flag reproduces revision 1 separately. Replay `partition-hands-v2.js` only in
scratch. Cleanup preserves current metadata-declared outputs and source baselines.

The existing composition workflow now checks all near-opaque hand interiors
against the source and the actual anatomy export, plus exact immutability outside
the hand windows. Corrected revision-2 visual approval is pending; commit and next
body increment remain on hold. Remaining anatomical/edge review debt, high-heel
footwear limitations, from-scratch asset authoring, production T-pose and native
pixel work remain open. Step 6C is unfinished; Step 6D has not started. Earlier
SE selections and approval statements below are historical.

Validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration
build and current/historical SE exports passed. The existing E/W/SE actual-plane
and cleanup workflows passed (2 passed, 7 skipped; 171.44 seconds), including all
8,247 near-opaque hand interiors in both source and native anatomy export, exact
non-hand body preservation, determinism and rejected re-pinned outside edits.
Initial test adapter/conditional/error-message expectations were corrected. All
905 preceding source/reference files retain their hashes and mtimes, excluding
the intentional source README update. Both new source outputs replay byte-for-byte
in scratch; all 37 current review PNG hashes verify. App build and browser E2E
were not rerun. See `body/front-diagonals-v1/fit-audit-v2.json`. The corrected
revision remains uncommitted pending visual approval.

## Independent SE body candidate — 2026-10-14

Local commit `c144bd7` records the approved W revision-2 body/hair study and its
scoped approval. Cleanup removed 55 regenerable files (1.5 MiB), retaining all
current reviews and required source baselines. The next bounded Step 6C increment
is `body/front-diagonals-v1/`, initially SE only. Its built-in imagegen study uses
SE's own native approved head guide and SE standing reference. No E/W/S/N body
pixels, mirrored artwork or cross-facing anatomy fragments supply this study.

The selected body has ordinary opaque daily bra and panties and a three-quarter
T-pose projection. Near physical-right arm is screen-left; far physical-left arm
is screen-right. Review shoulders/chest/pelvis orientation, arm foreshortening,
hands/thumbs, knees and feet. No rendered image or automated check proves coherent
anatomy, production T-pose or general footwear compatibility. Far and near feet
have different native endpoint heights and retain provisional heel-raised posture;
review sole contact/baseline before accepting compatible footwear or rig anchors.

Generated head and glow are unselected. Manually traced native body/hand silhouettes
use 4×4 mask coverage without contour dilation or colour-key cleanup. Initial
far-cup/toe clipping was corrected before this checkpoint. The accepted SE
head/ear/eyes/complete brows/mouth and retained front/rear hair use their exact
native coordinates. A new pose-neck derivative transfers only rows 274–297 where
the selected body supplies skin; original source artwork is untouched. The shared
offline facial-body reviewer verifies SE's independently authored ear/head pack,
existing approval hashes and actual SE core-plane composition. E/W commands and
source configs remain pinned. Scratch-only `partition-study-v1.js` replays the
four body/mask/pose-neck outputs; source inputs are retained locally.

`pnpm body:review:front-diagonals` selects `authoring.json` and exports four PNGs
plus metadata under `assets/staging/heroine-v1/body/front-diagonals-v1/`.
`overview.png` shows same-facing reference / new anatomy / actual layered hair fit.
`inspection/SE-neck-shoulder-comparison.png` shows the native joint crop. Cleanup
protects all metadata-declared current outputs. `prompts-v1.json` retains the
built-in prompt and provenance; the historical external generated-image path
is not a dependency. Review local silhouette transitions and inherited hair noise
or abrupt starts against the actual body. This whole-body study does not author
concealed reusable limbs, separate garments/skin/materials or complete hair.

The SE candidate remains unapproved and uncommitted. SW/NE/NW body studies,
body presets, full reusable geometry/materials, production T-pose and independently
authored native pixel assets remain unfinished. The existing high-heel foot and
from-scratch asset-authoring notes are retained. Step 6C is open; Step 6D has not
started. Earlier W/SE statements below are historical.

Validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration
build, SE CLI and accepted E/W exports passed. The extended existing E/W/SE
actual-plane and cleanup workflows passed (2 passed, 7 skipped; 145.27 seconds),
covering both SE eye planes, native body/neck/face ownership, hand/toe samples,
deterministic output, immutable inputs and rejection of re-pinned body/neck/hair
edits outside permitted ownership. The existing N body/parts workflow also passed
during the broader shared-helper check. The first SE test compositor incorrectly
overrode one eye; it now accumulates both. All 894 preceding source/reference
files retain hashes and mtimes, excluding the intentional source README update.
Four selected outputs replay byte-for-byte in scratch; all 36 current PNG hashes
verify. Full app build and browser E2E were not rerun. See the local fit audit.
Final cleanup removed 58 regenerable files (1.5 MiB), preserving all current
PNGs and source baselines; dry run finds zero remaining obsolete outputs.
The current candidate is unapproved and uncommitted.

## W revision-2 body/hair study approved — 2026-10-14

The user approved the current W study, including the exposed hand and removal
of the marked red clothing fragment, and requested cleanup, a local commit and
continued Step 6C work. `body/profiles-v1/review-fit-w-v2.json` pins its scoped
approval. E/S/N source artwork and approvals remain unchanged. Revision 1 is a
required derivation baseline; cleanup removes regenerable outputs only.

The next bounded increment independently authors the SE full-body modesty study
from its own accepted native head/face/hair and same-facing reference. Preserve
ordinary opaque bra/panties, physical side identity and native composition.
Current profile studies do not supply complete concealed far-side limbs; no
mirroring or cross-facing anatomy fragments may fill SE. The high-heel foot
limitation, future footwear alternatives and from-scratch asset-authoring note
remain in force. Concealed geometry, separate clothing/materials, remaining body
facings, production T-pose and independent native pixel art are unfinished.
Step 6C stays open; Step 6D has not started. Earlier pending W notes below
are historical.

## W hair/hand revision 2 pending review — 2026-10-14

The user rejected W revision 1 because foreground hair hid the near hand/thumb
and the lower hair retained a red reference-clothing fragment. Revision 2 uses
`body/profiles-v1/authoring-w-v2.json`. Two local manually traced masks transfer
the upper-back hair to the rear plane and discard only the clothing fragment.
Native hair RGB/highlights are retained; no generated artwork, mirroring,
scaling, shifts or global colour key is used. Body, posed neck and all facial
layers remain byte-identical to revision 1. Accepted E sources/approval and the
normal E command remain unchanged. This changes actual source-plane composition.

`pnpm body:review:profiles:west` now selects revision 2 in the existing `west/`
staging folder. Inspect `overview.png`, `inspection/W-neck-shoulder-comparison.png`
and `inspection/W-hair-fit-comparison.png` (revision 1 / revision 2).
The historical `--west-v1` CLI flag reproduces pinned revision 1 separately;
its source config/art and required head/hair derivation baselines remain intact.
`partition-hair-w-v2.js` is scratch-only. Revision 2 remains unapproved and
uncommitted. Remaining inherited hair/mask transitions, arm anatomy, concealed
geometry, materials, production T-pose and independent pixel artwork stay open.
The existing heel-foot and from-scratch authoring notes still apply. Step 6C is
unfinished; Step 6D has not started. Earlier W selections below are historical.

Validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration
build and current W revision-2, historical W revision-1 and accepted E exports
passed. The extended existing E/W actual-plane and cleanup workflows passed
(2 passed, 7 skipped; 105.03 seconds). They cover visible hand depth, the discarded
clothing fragment, determinism, input immutability and rejection of re-pinned
body/neck/hair edits outside bounded ownership. Two invalid initial test sampling
points were corrected to actual opaque artwork. All 884 pre-repair source/reference
files retain hashes and mtimes. Four repair outputs replay byte-for-byte in
scratch; all 32 current PNG hashes verify. Cleanup removed 60 regenerable files
(4.3 MiB), retaining current previews and all source baselines. Full app build
and browser E2E were not rerun. See `fit-audit-w-v2.json`; visual approval is pending.

## Independent W profile body candidate — 2026-10-14

Local commit `aec7031` records the approved E whole-body study. Cleanup removed
55 regenerable files (1.5 MiB), preserving source baselines and current reviews.
The next Step 6C increment independently authors W in the same profile pack,
using only its own native head guide and W reference. Ordinary opaque grey bra
and full-coverage panties provide modesty coverage. No E pixels or mirrors are
used. The normal E command, configuration, source and scoped approval stay pinned.

`authoring-w-v1.json`, `prompts-w-v1.json` and `selections-w-v1.json` retain the
new native study and manual body/hand contours. Generated head pixels are
unselected. A new pose-neck derivative transfers coverage only at rows 306–316
where the selected body supplies skin. Accepted head/ear/eyes/complete brows/mouth
and native front/rear hair retain their original coordinates and source pixels.
No shifts, scaling, rotation, panel movement or broad colour key is used.
Replay `partition-study-w-v1.js` only in scratch.

`pnpm body:review:profiles:west` exports four PNGs and metadata separately under
`assets/staging/heroine-v1/body/profiles-v1/west/`. Review `overview.png`:
reference / new anatomy / actual native W hair fit. The close join/hand comparison
is `inspection/W-neck-shoulder-comparison.png`. Composition uses the established
W plane order, retaining separate facial layers and exact approved body-free fit.

The W candidate is unapproved and uncommitted. Inspect the near physical-left
arm projection, palm/thumb/fingers, occluded far right arm/leg, neck/shoulder
transition and chest/pelvis proportions. Inherited hair has abrupt ends near the
upper back/hand and remaining edge noise; this study does not certify reusable
concealed hair or production body occlusion. Feet remain provisional heel-based
studies. Future shoes may require discrete independently authored leg-and-foot
variants; general footwear, flat-shoe and barefoot compatibility remain open.
Separate limbs/garments, concealed anatomy, materials, remaining facings/presets,
production T-pose and independently authored native pixel artwork remain open.
Step 6C is unfinished; Step 6D has not started. Earlier pending notes below
are historical. See `body/profiles-v1/fit-audit-w-v1.json` for current verification.

Validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration
build and current W/accepted E CLI exports passed. The existing E/W actual-plane
composition and cleanup workflows passed (2 passed, 7 skipped; 65.27 seconds),
including deterministic output, source immutability and rejection of re-pinned
outside-mask body/neck changes. All 873 preceding source/reference files retain
their hashes and mtimes, excluding the intentional source README text update.
Four W authoring outputs replay byte-for-byte in scratch, and all 31 current
body/part/head-sheet PNG hashes verify. Final cleanup removed 55 regenerable
files (1.5 MiB); dry run finds zero remaining obsolete generated files. Full app
build and browser E2E were not rerun. W remains uncommitted pending visual review.

## E profile body study approved — 2026-10-14

The user approved the current E anatomy/head/hair review and requested cleanup,
a local commit and continued Step 6C work. `body/profiles-v1/review-fit-v1.json`
pins the E configuration, body/pose-neck selections and actual anatomy/fit hashes.
Existing E artwork, native head/face/hair and S/N approvals stay unchanged.
This accepts the E whole-body study only. Concealed far-side anatomy, independent
limbs/garments, production T-pose and general footwear compatibility remain open.

The next bounded increment independently authors W using its own accepted native
head/hair and same-facing reference, with ordinary opaque bra/panties and profile
arm projection. Never mirror E to fill W. Retain the high-heel-specific foot
limitation and future leg-and-foot variants for other shoes. Use a new W config
and studies; the accepted E config/source and normal E command stay pinned.
Remaining body facings/presets, concealed geometry, materials and native pixel
artwork remain unfinished. Step 6C is open; Step 6D has not started. Earlier
pending statements below are historical.

## Independent E profile body candidate — 2026-10-14

Local commit `2e7b183` records the approved N visible-pixel parts and the user's
footwear limitation. The note is also saved in Codex memory: current feet are
made for high heels; different shoe types may need extra leg-and-foot parts.
Future barefoot/flat-shoe/general footwear compatibility remains unapproved.
Cleanup removed 53 regenerated files (1.5 MiB), preserving accepted source and
current reviews. Previous sources/approvals and the from-scratch authoring note
remain intact.

The next Step 6C increment is `body/profiles-v1/`, initially E only. A built-in
imagegen study independently authors the side-facing body in ordinary opaque
grey bra and full-coverage panties. Near right-arm projection is strongly
foreshortened, and the far left arm/leg is largely occluded. Human review must
verify the T-pose projection, visible hand/thumb, chest/pelvis alignment and
hidden-side coherence; image existence/checks do not establish correct anatomy.
W is missing and must be independently authored later, never mirrored from E.

The exact accepted native E guide, head/ear/eye/complete brow/mouth and front/rear
hair remain sourced from the approved head/face packs. Generated head pixels are
unselected. A manual native silhouette selects body/hand pixels below y300;
a new pose-specific lower neck transfers coverage only at rows 300–310 where the
body supplies skin. Approved neck source and face pixels stay unchanged. No
images or preview panels are shifted, scaled, rotated or mirrored, and no broad
white/color key is used. Authoring replay runs only in scratch.

`pnpm body:review:profiles` exports four PNGs and metadata under
`assets/staging/heroine-v1/body/profiles-v1/`. `overview.png` shows reference /
new E anatomy / actual layered E hair fit. Inspect the neck/shoulder/hand crop in
`inspection/E-neck-shoulder-comparison.png`. Actual composition uses
`DIRECTION_PLANE_ORDER.E` with separate retained facial planes and native (0,0)
positions. Body-free fit matches the accepted E head/hair hashes exactly.

Feet retain provisional heel-compatible posture, including raised heel and
forefoot/toe contact. This is not general footwear acceptance or a fixed rig
baseline. Record shoe-specific leg/foot alternatives as future authoring work.
The whole-body study still includes underwear and near-arm pixels on one body
plane; full concealed joints, separate skin/limbs/garments and palette maps remain
unfinished. Inherited E hair edge noise and local transitions also need review.
Other facings/presets, production T-pose and independently authored pixel assets
remain open. The new E candidate is unapproved and uncommitted. Step 6C remains
unfinished; Step 6D has not started. Earlier pending statements are historical.

E-study verification: asset-validator typecheck, root lint (zero warnings), ESM/declaration build and `body:review:profiles` passed. The new E body workflow, existing N body/parts workflow and cleanup workflow passed (3 passed, 6 unrelated head/S workflows skipped; 71.76 seconds), covering actual retained facial/hair planes, unchanged accepted body-free E head fit, local neck ownership, native hand/heel/toe samples, future footwear debt, deterministic output, immutable inputs and rejection of re-pinned foreign body/neck edits. All 861 preceding source/reference hashes and mtimes stay unchanged, excluding the intentional source README edit; four authoring outputs replay byte-for-byte in scratch, and 27 new/accepted PNG hashes verify. Full app build and browser E2E were not rerun. Anatomy, profile T-pose projection and heel-based feet require visual review. The E candidate remains unapproved and uncommitted. Post-validation cleanup removed 55 regenerated files (1.5 MiB), kept all 27 checked PNGs and accepted inputs, and left zero obsolete generated files.

## N parts approved; future footwear variants — 2026-10-14

The user approved `body/parts-v1/north/` and requested cleanup, a local commit
and continued Step 6C work. `review-fit-v1.json` pins the five native parts and
actual accepted fit hashes. Existing artwork and prior approvals stay unchanged.

The user explicitly noted that the current feet are made for high heels and
may not be valid for future designs. Extra leg-and-foot parts may be needed
for different kinds of shoes. Treat the current S/N foot posture as a provisional
heel-based study, not a general barefoot or flat-shoe foundation. Before future
shoe designs are accepted, review same-facing foot/ankle posture, leg attachment,
sole contact, ground baseline and shoe compatibility. Author discrete versioned
leg/foot alternatives when needed; preserve side identity and independently
authored facings/targets. Do not silently deform approved legs/feet. This is
recorded design/review debt, not a request to change the accepted feet now or
a new CharacterRecipe/rig contract. The authoring-from-scratch preference remains.

The next bounded increment is an independently authored E profile body study,
with the accepted native E head/hair and ordinary opaque daily bra/panties.
A profile T-pose requires foreshortened arm/hand projection; do not turn the S
body sideways or copy its horizontal screen-space arms. Its foot posture remains
a provisional study pending shoe-specific review. Concealed joints, separate
garments/materials, other facings, production T-pose and native pixel art remain
unfinished. Step 6C is open; Step 6D has not started. Earlier pending statements
below are historical.

## Native N body-part candidate — 2026-10-14

Local commit `c270185` records the approved independent N full-back body study,
its scoped approval and actual head/hair review tooling. Cleanup removed 52
regenerated files (1.5 MiB), keeping accepted source and current reviews.

The next bounded Step 6C increment is `body/parts-v1/north/`. Five transparent
native 1024×1536 layers retain the accepted N body's exact visible RGBA: torso,
physical right/left arms and physical right/left legs. Separate N contours follow
its own shoulder/hip geometry; S cuts or S anatomy are not mirrored/reused.
In N, character-right is screen-right. Right limbs use the existing back limb
planes and left limbs the front limb planes in this scoped static study. This
is not a new global rig/depth contract or an approved attachment model.

`pnpm body:review:parts:north` consumes the pinned accepted N configuration and
`body/north-v1/review-fit-v1.json`, validates source ownership and side identity,
then composes through `DIRECTION_PLANE_ORDER.N` at native (0,0). It must reproduce
the accepted body-only, anatomy and hair fit exactly, including the accepted
pose-specific neck. Posterior hair retains its established N depth; no frontal
hair, eyes, brows or mouth are added. Normal S commands retain their existing
configuration and PNG outputs; both independently authored part profiles use
the same deterministic review exporter with explicit S/N selection.

Review `assets/staging/heroine-v1/body/parts-v1/north/overview.png`: recomposed
anatomy / accepted N body fit / actual five-plane N fit. In `parts-overview.png`,
read cells left to right: top row whole body / torso with underwear /
character-right arm; bottom row character-left arm / character-right leg /
character-left leg. Only previews contain checkerboard and yellow N labels.

Visible-pixel cuts remain study geometry. Torso retains posterior bra/panties
and upper thigh skin; complete concealed shoulder/hip joints, discrete rig
anchors, separate underwear/skin and palette maps need later authoring/review.
Other body facings/presets, complete hair, production T-pose and native pixel
artwork remain open. The new N part candidate is unapproved and uncommitted.
Step 6C remains unfinished; Step 6D has not started. Earlier pending statements
below are historical.

N-part verification: asset-validator typecheck, root lint (zero warnings), ESM/declaration build, the new N part CLI and existing S part CLI passed. The extended S body, N body and cleanup workflows passed (3 passed, 5 unrelated head workflows skipped; 136.48 seconds). They cover actual same-facing plane composition, preserved accepted anatomy/head/neck/hair fit, native physical-side samples, exclusive ownership, deterministic output, immutable inputs and rejection of altered side identity or re-pinned foreign part pixels. All 850 preceding source/reference hashes and mtimes stay exact, excluding the intentional source README edit; five selected outputs replay byte-for-byte in scratch, and 23 current new/accepted PNG hashes verify. Existing S part PNGs retain their prior hashes. Full app build and browser E2E were not rerun. The new N cuts remain pending visual approval and uncommitted. Post-validation cleanup removed 53 regenerated files (1.5 MiB), kept all 23 checked PNGs and accepted inputs, and left zero obsolete generated files.

## N full-back body study approved — 2026-10-14

The user approved `body/north-v1/` and requested cleanup, a local commit and
continued Step 6C work. `review-fit-v1.json` pins the exact configuration, native
body/pose-neck selections and actual anatomy/hair fit hashes. This accepts the
current independent N study with everyday bra/panties and its two-row neck
attachment. Approved original N head/neck/hair, S body and S parts stay unchanged.
The next bounded increment partitions the accepted N body into five native
visible-pixel torso/arm/leg layers and verifies actual N-plane recomposition.
Concealed joints, separate clothing, rig anchors/materials, remaining facings,
production T-pose and independent pixel artwork remain unfinished. Step 6C is
open; Step 6D has not started. Earlier pending statements are historical.

## Independent N body anatomy candidate — 2026-10-14

Local commit `8212716` records the approved five-part S visible-pixel study,
its scoped approval and actual-composition tooling. Cleanup removed 50 generated
build files (1.5 MiB), preserving accepted sources and current reviews.

The next Step 6C increment is `body/north-v1/`: an independently generated N /
full-back T-pose body study. It uses ordinary opaque grey daily bra and full-
coverage panties, with a posterior back band/clasp and shoulder straps. No S
anatomy pixels, mirroring, scaling, rotation or source shifts are used. The
accepted N head and neck supply the native guide; generated head pixels are
unselected. Manual native body/hand contours retain only same-facing study RGBA
below y312 and reject background glow. Scratch replay writes new files only.

The standing N neck had a bottom outline exposed against the new upper back.
A new pose-specific neck derivative transfers coverage only at rows 312–313,
where the selected body supplies skin. Original head/neck, hair, ear variants
and approvals remain unchanged. Body-free composition still matches the approved
posterior head/hair fit exactly; the actual body composition uses this bounded
neck attachment. Skin transitions and anatomical coherence still need review.

`pnpm body:review:north` builds four PNGs and metadata under
`assets/staging/heroine-v1/body/north-v1/`. `overview.png` shows same-facing
standing reference / new anatomy / actual layered hair fit. Review shoulders,
neck shading, back-view hands/thumbs, bra/panty topology, leg proportions and
heel baseline, including `inspection/N-neck-shoulder-comparison.png`.
The actual `DIRECTION_PLANE_ORDER.N` draws posterior hair after the body;
eyes, brows, mouth and frontal hair remain absent. No display-panel alignment
changes are used. Existing S body and part commands retain their accepted inputs.

This is an unapproved, uncommitted whole-body modesty study, not fully concealed
skin, separate underwear/limbs, production T-pose or a new runtime catalog.
Manual contour edges, inherited N hair noise, concealed geometry, rig anchors,
materials, other body facings/presets and independent native pixel artwork remain
open. Step 6C is unfinished; Step 6D has not started. Earlier pending statements
below are historical.

N-study verification: asset-validator typecheck, root lint (zero warnings), ESM/declaration build and `body:review:north` passed. The native N body workflow and extended cleanup workflow passed (2 passed, 6 unrelated head/body workflows skipped; 14.09 seconds), covering actual posterior hair order, hidden frontal features, exact retained body-free approved head fit, bounded pose-neck ownership, native hand/heel samples, deterministic exports, immutable inputs and rejection of re-pinned body/neck edits or wrong-facing hair. All 838 preceding source/reference hashes and mtimes remain unchanged, excluding the intentional source README edit. Four selected authoring outputs replay byte-for-byte in scratch, and 18 new/accepted review PNG hashes verify. Initial metadata-reader and occlusion-witness errors were corrected; no checks remain failing. Full app build and browser E2E were not rerun. The N candidate remains uncommitted pending visual approval. Post-validation cleanup removed 52 regenerated files (1.5 MiB), preserved all 18 checked PNGs and accepted sources, and left zero obsolete generated files.

## S body-part study approved — 2026-10-14

The user approved `body/parts-v1/` and requested cleanup, a local commit and
continued Step 6C work. `review-fit-v1.json` pins the exact native five-part
configuration and actual body/anatomy/hair fit hashes. Existing source pixels
stay unchanged. This accepts the visible-pixel S study only; concealed joints,
separate garments, material maps, production anatomy and final T-pose approval
remain open. The next bounded increment authors an independent N / full-back
body T-pose study in ordinary opaque bra and panties, with the accepted native
N head/hair fit. It must not mirror S or borrow S anatomy pixels. Step 6C remains
unfinished and Step 6D has not started. Earlier pending statements are historical.

## Native S body parts and actual plane review — 2026-10-14

Local commit `6802004` records the approved revision-6 S body/head/hair study,
its scoped approval, the requested future authoring note and retained derivation
inputs. Cleanup removed 47 regenerable build files (1.5 MiB), preserving current
reviews and all required source baselines.

The next bounded Step 6C increment is `body/parts-v1/`. Five transparent native
1024×1536 layers retain the accepted body's exact visible pixels: torso, both
arms and both legs. `pnpm body:review:parts` validates the pinned revision-6
configuration and approval, exclusive ownership and side identity, then uses
`DIRECTION_PLANE_ORDER.S` at native (0,0) positions. Actual recomposition must
match the accepted body-only, anatomy and head/hair fit pixels exactly. The
normal `body:review` selection remains the approved revision 6.

In S, character-right is screen-left. The right arm/leg use the existing back
limb planes, and the left arm/leg use the front limb planes; this is a scoped S
study allocation, not a new global side/facing contract. No mirroring, image
transforms, replacement artwork or production catalog publication occurs.

Review `assets/staging/heroine-v1/body/parts-v1/overview.png`: recomposed anatomy /
accepted revision-6 fit / actual five-plane fit. In `parts-overview.png`, cells
read left to right: top row recomposed body / torso / character-right arm;
bottom row character-left arm / character-right leg / character-left leg.
Source pixels remain native; checkerboard and direction labels are preview-only.

These are visible-pixel study cuts, not completed reusable joints or rig anchors.
The torso still owns the underwear and upper thigh skin; full concealed shoulder/
hip surfaces and separate clothing require later authoring. Other facings, body
presets, complete hair, material maps, production T-pose and independently
authored pixel artwork remain open. The new part review is unapproved and
uncommitted. Step 6C is unfinished and Step 6D has not started.
Earlier pending statements below are historical.

Part-study verification: asset-validator typecheck, root lint (zero warnings), ESM/declaration build and `body:review:parts` passed. The extended existing body workflow and cleanup workflow passed (2 passed, 5 unrelated workflows skipped; 95.82 seconds), covering actual five-plane composition, native left/right samples, deterministic exports, immutable inputs and rejection of re-pinned foreign part pixels or altered side identity. All 827 preceding source/reference hashes and mtimes remain unchanged, excluding the intentional source README edit. Five source outputs replay byte-for-byte in scratch, and 14 current PNG hashes verify (new parts, accepted body fit and accepted head sheets). Full app build and browser E2E were not rerun. The new part study awaits visual review; accepted artwork remains exact. Post-validation cleanup removed 50 regenerated files (1.5 MiB), kept all 14 checked PNGs and inputs, and found no remaining obsolete generated files.

## S body/head/hair revision 6 approved — 2026-10-14

The user approved the current S body/head/hair fit and requested cleanup, a local
commit and continued Step 6C work. `body/reference-v1/review-fit-v6.json` pins the
accepted configuration and actual bare/assembled hashes. Accepted source artwork
stays unchanged. This is an offline S layering-study checkpoint, not production
anatomy, full T-pose acceptance, native pixel approval or final Step 6C acceptance.

The exact requested future authoring note is:

> eventually we may want to create asset by asset from scratch when given a design to avoid this masking problem as long as the layering system works.

Keep that preference in future asset work. Preserve the project and its existing
approvals; complete independently authored parts from a supplied design remain a
future option. The next bounded increment separates this accepted S body study
into torso and left/right arm/leg layers, using the established render planes and
native positions, with exact actual recomposition. Joint/concealed geometry and
separate underwear remain later authoring work. Step 6D has not started.
Earlier pending-approval statements below are historical.

## Final bounded S curl-spill pass — revision 6, 2026-10-14

The user identified three colour patches outside the curl outlines in revision 5
and requested one more cleanup pass before moving on. `review-fit-v5.json`
records that feedback against the exact candidate. `pnpm body:review` now selects
`authoring-v6.json`: three hand-traced 8×8 antialiased native masks move those
pixels from the front hair plane into the rear, where the actual body occludes
them. Strand RGB, bright highlights and native framing are retained. No new hair
is generated, globally blurred, colour-keyed, shifted, scaled or mirrored.

The qualified revision-4 body/neck, face, ordinary two-piece underwear and
proportions remain exact. Previous versions and approvals stay unchanged. Review
`inspection/S-curl-edge-comparison.png` (reference / v5 / v6); magnification is
4× for inspection only. `pnpm body:review:v5` rebuilds the preceding candidate.
Source masks/settings, provenance and the scratch-only replay script retain the
bounded derivation. Residual inherited noise and concealed geometry remain open;
this final local pass does not certify the whole hairstyle or production anatomy.

The user treats the current extracted artwork as a test of the layering system.
For a future supplied design, consider authoring each complete modular asset
independently from scratch: head/neck/ears/features, front/rear hair, torso/limbs,
underwear and clothing. Include concealed surfaces from the outset. Verify real
composition order, native attachments, occlusion, compatible geometry and exports
before accepting the resulting asset package. Retain independently authored
facings and target-specific pixel artwork; no mirroring or detailed downscaling.
This is a recorded future authoring preference, not a project restart or a new
runtime recipe/catalog contract. Existing approvals and source studies are kept.

The next work should address layering/asset construction within Step 6C after this
bounded review; do not extend the curl-polish loop without new user direction.
No source publication, local commit, final Step 6C acceptance or Step 6D advance
is implied. Earlier selections and pending statements are historical.

## Qualified S body approval and curl-edge revision 5 — 2026-10-14

The user mostly approved revision 4, with a nitpick that both shoulder curls look
pixelated. `review-fit-v4.json` pins the exact configuration and assembled/bare
hashes, accepting this local S body/neck study while leaving the curl edges open.
This is not production anatomy, a final T-pose or final Step 6C acceptance.

Native inspection found binary ownership-mask stair steps around the curls and
openings. `pnpm body:review` now selects `authoring-v5.json`: manually rounded
0.75-native-pixel corners and 8×8 subpixel coverage replace those hard boundaries.
Original same-facing hair RGBA supplies both planes; no new hair is generated.
The body, neck, face, ordinary bra/panties and proportions remain revision-4 exact.
Prior source layers and approvals stay unchanged. Bright highlights are retained;
no RGB blur, global colour key, image shifts, scaling or mirroring are applied.

Review `inspection/S-curl-edge-comparison.png`: reference / qualified v4 / v5.
This sheet magnifies native crop pixels 4× with nearest-neighbour sampling solely
for inspection; the actual source layers and native 1024×1536 fit are unscaled.
The regular body comparison also shows reference / v4 / v5. Rebuild v4 through
`pnpm body:review:v4`; all earlier source baselines remain required dependencies.
`settings-v5.json`, `provenance-v5.json` and the scratch-only authoring script
retain the deterministic local mask derivation. Inherited native artwork/mask
noise remains; this bounded correction does not certify the whole hairstyle.

The new curl edges need visual approval. Everything remains uncommitted and
unpublished. Other body facings/presets, concealed geometry, material maps,
production T-pose and independently authored pixel artwork remain open.
Step 6C is unfinished; Step 6D has not started. Earlier selections are historical.

## S body revision 4 — local neck shading, 2026-10-14

The user flagged the remaining lower-neck shadow in revision 3. A new native
head/neck/shoulder-only study softens the screen-right red stripe and angular
pale throat wedge. `pnpm body:review` selects `authoring-v4.json`; the current
body comparison shows reference / revision 3 / revision 4. Rebuild the preceding
candidate through `pnpm body:review:v3`.

Only skin RGB inside a feathered native neck mask changes. Alpha silhouettes,
shoulder height, body proportions, face/skull, hair and ordinary separate bra/
panties remain exact. Prior body revisions and the accepted standing head
source stay unchanged. One early study was too subtle; a subsequent full-body
edit was rejected by the image tool. The final study uses only the native upper
cutout. Prompts and replay scripts retain the selected local derivation.

Review the actual neck/hair fit and shading transitions before approval. This
candidate is uncommitted and unpublished. Production anatomy, all body facings,
materials, true T-pose, independent pixel art and final Step 6C remain unfinished;
Step 6D has not started. Body-proportion options are recorded separately below
as possible authored presets; no new design controls are implemented.
Earlier selections are historical.

## Future body proportion design options — 2026-10-14

The user noticed the T-pose study's body proportions differ from the standing
reference and requested recording this as a possible future character-design
option; this is not an objection to those proportions or approval of the body.
The clothed standing reference and independently authored T-pose body are
different studies, and clothing/pose also affect apparent silhouette. Revision 3
only changed the bounded neck/shoulder region: waist, hips, abdomen, panties,
legs and other pixels outside the joint mask remain revision-2 pixels.

Consider authored body presets that vary torso/waist length, shoulder breadth,
chest proportions and waist/hip balance after the base anatomy is reviewed.
Document each variant's native anchors and compatible clothing/hair fit across
all independently authored facings and both targets. Preserve head identity and
ground baseline deliberately. Existing MVP scope remains two discrete body
presets; this note does not implement continuous deformation, new recipe fields,
UI controls, extra presets or production artwork. No global scaling of one
flattened study and no detailed-to-pixel downscaling.

## S body revision 3 — one neck/shoulder joint, 2026-10-14

The user identified lower shoulders and two neck/clavicle joins in revision 2.
Native skin-edge samples at x410/x610 were 17/21 pixels below the standing
reference. The accepted head guide retained a standing clavicle base, while the
body study painted another below it. Hair-only repair had left both in place.

`pnpm body:review` now selects `body/reference-v1/authoring-v3.json`.
A new local same-facing study raises those sampled shoulders by 12/13 pixels,
closer to the reference but still 5/8 pixels lower; standing and T-pose contours
are not certified identical. A pose-specific head derivative retains the face,
skull and upper neck, then retires the old clavicle base. One locally authored
neck/shoulder transition replaces it. The approved standing head source remains
byte-identical. Original hair RGB is repartitioned around the raised shoulders;
no artwork or display panels are shifted, scaled, rotated or mirrored.

The native joint mask preserves revision-2 body pixels outside its bounds,
including bra cups below the repair, abdomen, panties, legs and far arms/hands.
Manual skin contours exclude generated glow. New skin/strap/deltoid and hair
transitions need human visual approval. This pose-specific body-free assembly
is deliberately different from the accepted standing head/hair checkpoint;
its separate hash is recorded without changing standing approval records.

Review `inspection/S-neck-shoulder-comparison.png` (reference / new anatomy /
actual hair fit) and `inspection/S-body-fit-comparison.png` (reference / v2 / v3).
`pnpm body:review:v1` and `pnpm body:review:v2` rebuild the retained baselines.
Prompts, native guides, masks and scratch-only replay scripts are retained.
All three body studies remain unapproved, unpublished and uncommitted.
Other facings/presets, concealed geometry, materials, production T-pose,
independent pixel art and final Step 6C remain open; Step 6D has not started.
Earlier selections below are historical.


## S body revision 2 — everyday underwear and hair/chest repair, 2026-10-14

The user rejected the horizontal hair/chest joint and requested ordinary separate
bra and panties, covering the important parts without nudity. Use plain opaque
everyday two-piece underwear for anatomy modesty views; do not substitute a
swimsuit, unitard or connected bodysuit unless explicitly requested.

`body/reference-v1/authoring-v2.json` is now selected by `pnpm body:review`.
A same-facing local imagegen study supplies only the manually selected native
torso/pelvis repair. All body pixels outside that mask and the accepted S
head/neck/face/ears remain exact. Existing source versions stay unchanged.
Binary native contours put the concealed shoulder/collar hair and background
inside curl openings behind the actual body, while retaining original foreground
curl silhouettes and recovering their same-facing tips. No hair RGB is generated,
recoloured, moved, scaled or mirrored. Body-free head/hair composition remains
identical to the standing-reference checkpoint.

Review the new actual layered result and local skin/curl/mask transitions before
approval. Revision 1 remains a pinned derivation baseline, not approved body art;
rebuild its historical view with `pnpm body:review:v1`. Both body revisions remain
unpublished and uncommitted. Separate clothing/limb geometry, material maps, other
facings/presets, true production T-pose, independently authored pixel artwork and
final Step 6C remain open. SE/SW body occlusion and alternate-hairstyle ear-size
obligations are carried forward. Step 6D has not started.


## Next Step 6C candidate — S body study, 2026-10-14

Commit `5cdf0bb` records approved complete brows and the qualified standing-reference
head checkpoint after generated-data cleanup. The next uncommitted S-only body
study is in `body/reference-v1/`, with an exact native approved head/neck guide,
retained hair, same-facing reference, local study, manual masks and prompt record.
`pnpm body:review` shows reference / anatomy / actual hair fit at native coordinates.
Review body proportions and shoulder/neck attachment before other facings or
production limb/clothing decomposition. The neutral opaque underlayer is study
coverage, not completed torso skin, starter clothing or palette-ready geometry.

The new actual fit exposes an inherited hard horizontal foreground-hair band at
the neck/shoulder window. It remains unresolved and cannot certify production
T-pose compatibility. Use the anatomy column for body review; a later bounded
hair/body ownership correction must be a new version with visual approval.
Existing head and hair source pixels remain exact. SE/SW body occlusion and
alternate-hairstyle ear-size debt are carried forward. Step 6C is unfinished;
Step 6D has not started. See [modular-body.md](modular-body.md).


## Complete brow and standing-reference head checkpoint approved — 2026-10-14

The user approved the six complete E/SE/SW/W brows and current layered fit,
requested generated-data cleanup and a local commit, and authorized continuing.
`face/reference-v1/brows-v1/review-fit-v1.json` pins the selected native sources,
configuration and actual assembled/bare hashes. The consolidated selection now
pins that approval. `head/assembly-v1/review-fit-v1.json` records qualified
acceptance of the updated all-eight standing-reference sheets, preserving the
known bare-ear size discrepancy and future body/clothing occlusion obligations.
Neither record approves production anatomy, T-pose or final Step 6C.

All eight current fits must match their selected approvals; prior derivation
baselines remain retained. Approved S brows, all eyes (including the complete SE
left eye), anatomy and native anchors remain exact. The three review sheets are
unchanged by recording approval. Earlier pending statements below describe the
pre-approval state.

Next begin a bounded S body/shoulder anatomy study inside Step 6C, using the
accepted native head/neck and reference proportions as fixed guides. Review the
neck/shoulder join, torso/limb proportions and actual hair depth before expanding
to other independently authored facings or fitted clothing. A new study does not
certify production T-pose compatibility or resolve the SE/SW hair/body obligation.
Concealed facial/hair geometry, other hairstyles/ear variants, expression/ancestry
variants, material maps and independently authored pixel artwork remain open.
Step 6C is unfinished; Step 6D has not started.


Approval verification — 2026-10-14: validator typecheck, root lint (zero warnings), ESM/declaration build and both current review CLIs passed. The existing all-eight head, complete-brow and cleanup workflows passed (3 passed, 7 unrelated workflows skipped; 354.11 seconds), including rejection of a re-pinned brow approval with incorrect native fit hashes. All 710 preceding inputs retain their hashes/mtimes; 261 current PNGs, the S viewer and 30 scratch replay outputs verify. Cleanup removed 45 generated build files (1.4 MiB), preserving all required source and current reviews. Full app build and browser E2E were not rerun.


## Complete independent brows — E/SE/SW/W, 2026-10-14

The user questioned pale/short brows on the bare sheet and authorized correction.
Inspection identified incomplete reference extractions and brow pigment still
carried by front hair. A new `face/reference-v1/brows-v1/` pack independently
authors six complete coloured brows: the near E/right and W/left profile brows,
and both physical sides in SE/SW. S's accepted fuller brows remain unchanged.

Each facing uses its own exact native bald guide, accepted eyes/mouth/anatomy and
same-facing reference. Built-in imagegen supplies four complete brow studies;
manual contours select native RGB with 4x4 alpha coverage. Changed generated
anatomy, eyes, skin haze and all unselected pixels are discarded. Three same-facing
hair studies supply only locally selected RGB on existing E/SE/SW strands; their
new glow/face-window alpha is discarded. Original hair alpha is retained on those
strands. Separate masks remove exposed brow bridges and local pale remnants.
W front hair stays exact. No global colour key, image transform or mirrored facing.

`authoring.json`, `selections.json`, `prompts.json`, retained local studies/guides
and portable guide/partition scripts record ownership and derivation. Replay
scripts only in scratch. `pnpm face:review:brows` exports native layer/mask/fit
outputs and reference / preceding / candidate comparisons, including bare views.
The all-eight selector applies this pending pack through actual head/ear/facial/
hair composition. E/SE/SW/W are now candidates; previous standing-reference
approvals and baseline fits remain intact. N/NE/S/NW fits and every eye, including
the accepted complete SE left eye, head/neck/ears/rear hair and native anchor stay
unchanged. Genuine fringe draws above the complete brows and occludes their tails.

Review brow colour, curve, thickness, full bare geometry, taper and local hair
joins. Raw hair studies still contained unwanted haze/connector traces; they are
not whole-layer replacements. The first scratch masks left a dotted SE bridge
and SW pale remnant; widened local masks address those before source selection.
Only selected native pixels enter the result. This candidate is uncommitted and
needs human visual approval. Existing edge noise, alternate-hairstyle ear sizes,
body/clothing occlusion, variants/materials, T-pose and independent pixel artwork
remain open. Step 6C is unfinished; Step 6D has not started.

Validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration
build and brow/whole-head CLIs passed. The complete-brow and cleanup workflows
passed (2 passed, 3 unrelated face workflows skipped; 44.38 seconds), covering
actual core-plane composition, unchanged eyes/anatomy outside brow neighbourhoods,
complete coloured study ownership, native anchors, real foreground depth,
determinism, immutable inputs and rejection of re-pinned out-of-mask brow/hair
edits. The existing all-eight head workflow passed (1 passed, 4 unrelated head
workflows skipped; 350.21 seconds), including actual reconstructed ear/head/facial/
hair composition and retained baseline approvals. All 710 prior source/reference
hashes and mtimes remain exact. Thirty guide/partition outputs replay byte-for-byte
in scratch. All 261 current review PNG hashes and the S viewer verify. Final
cleanup removed 45 generated build files (1.4 MiB), preserving ten current reviews
and all selected source inputs. No app build/browser E2E was rerun. The first
strict optional-field typecheck issue and guide PNG compression mismatch were
corrected; see `brows-v1/fit-audit.json` for evidence. Human visual approval of
these four candidates remains pending; no commit was made for this increment.


## Head consistency review after SE approval — 2026-10-13

Local commit `df8f887` records the approved complete SE eye and revision-6 brow
fit, all required derivation files and the initial consolidated review tools.
Cleanup removed 42 regenerated files (1.4 MiB); selected source/reference artwork
and current review outputs were retained.

The next Step 6C increment attaches `review-fit-v6.json` to the retained SE
selection in `head/assembly-v1/review-selection.json`. `pnpm head:review:all`
verifies both the original separate-ear baseline and the accepted SE facial fit,
including its exact native assembled and bare hashes. All eight selected fits now
have individual approval records; no SE candidate is still pending. The three
compact sheets reuse the same native images without artwork edits or transforms.

Review `head/assembly-v1/overview.png`, `anatomy-overview.png` and
`reference-overview.png` for shared identity, facing and skull/jaw/neck/ear
proportions. Individual approval does not establish the full cross-facing checkpoint.
The known SE/SW bare-ear size difference remains an alternate-hairstyle obligation,
and abrupt neck/shoulder hair starts still require the actual future body/clothing
composition. Concealed brow/facial/hair surfaces, variants/materials, production
T-pose and independent pixel artwork remain unfinished. Cross-facing review is
pending before body authoring; final Step 6C is open and Step 6D has not started.
This next review update is uncommitted. Earlier pending SE entries are history.

Validation of this review update: asset-validator typecheck, root lint (zero
warnings), ESM/declaration build and the current all-eight CLI passed. The existing
all-eight head workflow passed (1 passed, 4 unrelated head workflows and the
unmatched cleanup workflow skipped; 327.83 seconds). Cleanup passed separately
(1 passed; 0.238 seconds). Coverage verifies eight individual approvals, retained
original ear/head baselines, accepted SE assembled/bare hashes, native panel
placement, deterministic repeat export and immutable source hashes/mtimes.
Re-pinned stale SE configuration approvals and approvals for the wrong facing
are rejected. All 710 prior source/reference hashes and mtimes, all eight native
full/bare/reference panels and all three sheet hashes remain exact. All 222
current review PNG hashes and the retained S viewer verify. Final cleanup removed
42 generated build files (1.4 MiB); no selected or pinned source imagery was removed.
No new artwork was authored. Full app build/browser E2E and the facial workflow
were not repeated for this review-only change. See `head/assembly-v1/fit-audit.json`.
The cross-facing visual checkpoint remains pending; the review update is uncommitted.


## SE revision-6 fit approval — 2026-10-13

The user approved the local right-brow repair, requested removal of unneeded
files and a local commit, and authorized the next Step 6C increment.
`face/reference-v1/front-diagonals-v1/review-fit-v6.json` pins the accepted
SE standing-reference fit, completed revision-5 left eye, selected sources and
native full/bare hashes. The original SW approval and all source imagery remain
unchanged. Rejected revisions 3/4 remain required pinned derivation baselines.

Next complete the all-eight head consistency review with this SE approval
attached to the selected revision-6 fit. Individual standing-reference approvals
remain distinct from the cross-facing checkpoint and production acceptance.
Review shared identity, skull/jaw/neck/ear proportions and actual hair depth before
body authoring. Carry forward alternate-hairstyle ear-size and real body/clothing
occlusion obligations, concealed brows/hair, variants/materials, production poses
and independent pixel artwork. Step 6C is unfinished; Step 6D has not started.
Earlier pending revision-6 statements below describe the pre-approval history.

## SE eye approval and local brow correction — 2026-10-13

The user accepted the completed SE physical-left eye from facial revision 5.
`face/reference-v1/front-diagonals-v1/review-left-eye-v5.json` pins that feature
approval only. The reported physical-right brow line comes from a pale skin strip
inside the original reference extraction. Revision 6 trims only that brow's local
alpha boundary; the accepted full eye, its foreground hair and nine other facial
features remain unchanged. The default facial command and consolidated head
selector now select `authoring-v6.json`. Review `SE-brow-fit-comparison.png`
(reference / revision 5 / revision 6) before approval. See modular-face.md for the
native ownership details. Concealed brow geometry, body/clothing occlusion,
variants/materials, production T-pose and independent pixel artwork remain open.
This is an uncommitted correction within Step 6C; Step 6D has not started.

Current checks passed: typecheck, lint, validator ESM/declaration build, facial
and all-eight head CLIs, the existing SE/SW facial workflow (284.73 seconds) and
cleanup workflow. All 702 prior input hashes/mtimes and 222 current review PNG
hashes verify; seven other fits stay exact. See `fit-audit-v6.json` for command
evidence and scope. Full head-set test/app build/browser E2E were not repeated.

> Purpose: This file transfers the **requirements and decisions** from a ChatGPT planning conversation into the WSL2/VS Code Codex development workflow. It is project context, **not** proof that any implementation is complete. Review actual repository files and tests before assuming a feature exists.

## Complete SE character-left eye — revision 5, 2026-10-13

The user clarified the requirement: author a proper complete physical-left/far
eye even where hair conceals it, just as concealed ear anatomy was authored.
Extraction cleanup cannot supply missing geometry. The revision-3/4 mask-only
approach misunderstood this requirement and is superseded; neither is approved.
This principle applies to reusable anatomy and facial features under other hair
styles, not only the currently visible reference fragments.

`face/reference-v1/front-diagonals-v1/authoring-v5.json` selects a new independent
SE complete-eye study from built-in imagegen. The exact native guide composes the
accepted head/neck and four retained SE features while omitting the partial far
eye. The same-facing reference guides identity/style, not a mirrored eye or a
part from another direction. `prompts-v5.json` records the exact prompt and two
pinned input roles; both guide and selected study are retained locally in `inputs/`.
The study supplies the full iris, sclera, pupil/glints, corners and continuous
lids. A manually traced contour retains native generated RGBA with 4x4 coverage
and a small skin rim. Study haze, changed brows/near eye and all unselected anatomy
are discarded. There are no image transforms or approved-source overwrites.

The complete transparent eye is an independent `eyes` layer. The retained
revision-3 foreground hair draws above it through the actual SE core plane order,
covering the concealed inner iris naturally. Revision 4's experimental eye-reveal
cuts are not selected. The bald anatomy shows the full eye without hair. The
approved near-eye cheek correction, eight other facial features, SW and six other
facings, head/neck/nose/ear/rear-hair sources and native anchors stay unchanged.
Previous revisions remain required derivation/comparison inputs. Guide and
partition scripts replay only in scratch.

`pnpm face:review:front-diagonals` now selects revision 5; `:v4` reproduces the
incomplete preceding extraction separately. Inspect `SE-eye-anatomy-comparison.png`
and `SE-eye-fit-comparison.png` in the current `inspection/` directory: original
reference / incomplete revision 4 / newly authored full-eye candidate. The enlarged
`SE-eye-close-comparison.png` uses native crop x580/y158/47x38 at 10x. The eight-
facing selector pins pending SE revision 5; prior separate-ear approval commands
remain on their recorded facial revision 2. This is uncommitted and requires human
review of full eye shape/perspective/style, lid/skin transitions and actual hair
coverage. Other concealed facial geometry, expressions/materials, body/T-pose,
independent pixel art and final Step 6C remain open. Step 6D has not started.

Validation: asset-validator typecheck, root lint (zero warnings), JavaScript/
declaration build and current facial/head-set CLIs passed. The existing SE/SW
facial integration workflow passed (217.27 seconds; 2 unrelated workflows skipped),
including complete authored iris/sclera/lash samples, concealed iris retained in
the bare head, actual foreground alpha blending, real core composition, unchanged
near eye/SW, deterministic exports, immutable inputs and out-of-mask rejection.
Head-set/cleanup workflows passed (2 passed, 4 unrelated head workflows skipped;
325.29 seconds). The initial occlusion assertion incorrectly expected opaque
255 at a retained fringe sample with alpha 254; the test now verifies the actual
source-over result and does not alter artwork. All 693 prior source/reference
hashes and mtimes remain exact. Five guide/partition outputs replay byte-for-byte
in scratch. All 223 current review PNG hashes verify. The eye retains 627 selected
native study pixels; 262 lie under near-opaque foreground hair. Seven other full/
bare fits and all eight reference panels are unchanged. Full app build/browser
E2E were not rerun. See `front-diagonals-v1/fit-audit-v5.json`. Human review remains
pending; the new complete eye has not been committed or approved.


## SE far-eye shape recovery — revision 4, 2026-10-13

The user rejected revision 3: its marked far-eye contour did not retain the
reference shape. The manual trim had cut the lower-left visible iris/lid arc.
`face/reference-v1/front-diagonals-v1/authoring-v4.json` restores that local curve
from the original SE reference pixels at native coordinates. It derives from
revision 3, retaining revision 2 as the approved facial/ear baseline. Revision-3
source imagery, masks, settings and authoring script stay byte-identical.

A new 34-pixel eye-release mask removes foreground coverage from the recovered
opaque eye arc in the revision-4 front-hair layer. The restored native eye owns
those pixels. A separate bounded mask keeps the removed outer strand/fringe in
hair ownership. Every other front-hair pixel retains the original approved source;
there are no image transforms or broad colour operations. Nine other facial
features, including the approved near-eye cheek correction, and all other facings
remain unchanged. Replay `restore-se-far-eye-v4.js` only in scratch.

The default `pnpm face:review:front-diagonals` selects revision 4; `:v3` reproduces
the rejected predecessor separately. The two face comparisons now show reference /
rejected revision 3 / revision 4 in bare and assembled views. Inspect
`inspection/SE-eye-close-comparison.png` for a 10x native-copy close-up of the
same eye (reference / rejected bare / candidate bare). The eight-facing selector
explicitly pins the pending revision-4 SE candidate. Existing approved separate-ear
commands remain pinned to revision 2. Human approval of the eye contour and hair
transition is pending. Concealed eye/brow geometry and final Step 6C remain open;
Step 6D has not started. This correction is uncommitted.

Validation: asset-validator typecheck, root lint (zero warnings), JavaScript/
declaration build and the current facial/head-set CLIs passed. The existing
SE/SW facial workflow passed (153.17 seconds; 2 unrelated workflows skipped),
including recovered native eye samples, the 34-pixel foreground release, real
composition, unchanged near eye/SW, deterministic exports and rejection of
re-pinned out-of-mask edits. Head-set/cleanup workflows passed (2 passed,
4 unrelated workflows skipped; 329.18 seconds). All 683 prior source/reference
hashes and mtimes remain exact, including revision 3; seven authoring outputs
match scratch byte-for-byte. All 224 current review PNG hashes verify. The
new mask restores 49 previously omitted eye pixels, changes alpha at 63 native
coordinates relative to revision 3, and retains 246 eye pixels in total. Seven
other full/bare fits and all eight reference panels remain exact. Full app build
and browser E2E were not rerun. See `front-diagonals-v1/fit-audit-v4.json`.
This source checkpoint still requires visual approval.


## SE far-eye ownership correction — 2026-10-13

The user rejected the SE eye in the consolidated hair-free anatomy sheet.
Inspection of the native layers found reference fringe and a downward outer hair
strand inside `SE-leftEye.png` (physical left/far eye, screen-right). Facial
revision 3 in `face/reference-v1/front-diagonals-v1/authoring-v3.json` traces the
visible eye boundary with 4x4 alpha coverage. Retained iris/lash RGB and coordinates
stay native. The approved revision-2 near-eye cheek correction and all nine other
facial features remain pinned and exact; SW is unchanged.

A bounded same-facing ownership mask restores removed fringe/outer-strand pixels
in `SE-front-hair-v3.png`, using their original reference colour beneath the
unchanged original foreground hair. This prevents an introduced gap in the
assembled hairstyle. Original front hair is exact outside that mask. Head, neck,
nose, ears, rear hair, anchors and prior approved artwork/configurations remain
unchanged. The replay script runs only in scratch. This is visible feature
separation; it does not complete the eye concealed by the fringe or diagonal brows.

`pnpm face:review:front-diagonals` selects revision 3; `:v2` and `:v1` reproduce
pinned preceding fits. Inspect `inspection/SE-eye-anatomy-comparison.png` and
`SE-eye-fit-comparison.png`: reference / approved revision 2 / candidate revision 3.
The consolidated selector explicitly pins the pending SE candidate. Its component
validators still check all eight approved baselines, then compose the new SE from
actual layers; the other seven fit hashes stay exact. Approval records and the
approved ear pipeline continue to select facial revision 2. Both current sheets
and the SE correction require human review. No commit, production publication,
final Step 6C acceptance or Step 6D advancement is implied.

Validation for this correction: asset-validator typecheck, root lint (zero
warnings), JavaScript/declaration build, current facial CLI and head-set CLI
passed. The existing SE/SW facial workflow passed (154.10 seconds; 2 unrelated
workflows skipped), and the all-eight head/cleanup workflows passed (2 passed,
4 unrelated head workflows skipped; 329.49 seconds). All 675 protected prior
source/reference hashes and mtimes remain exact; six authoring outputs match
scratch byte-for-byte. All 222 current review PNG hashes verify, including the
updated three head-set sheets. The other seven full/bare fits and eight reference
panels are exact. The eye mask changes 384 coordinates; 306 local hair-owned
coordinates preserve their prior assembled colour. Only 61 assembled SE pixels
change. Full app build/browser E2E were not rerun. See facial `fit-audit-v3.json`.
The correction remains uncommitted and awaits visual approval.


## Consolidated eight-facing modular head review — 2026-10-13

Commit `63ece36` records approved N ear/root separation after cleanup of
36 regenerated files (1.4 MiB). All selected head fits now have individual
standing-reference approvals. The next bounded Step 6C checkpoint is an offline
cross-facing review using `head/assembly-v1/review-selection.json` and
`pnpm head:review:all`. It pins five selected source packages and their approval
records: S facial revision 11; E/W, SE/SW, NE/NW and N separate-ear packages with
their current underlying anatomy/facial/hair revisions. S includes its later jaw,
left-ear, neck and brow/fringe corrections; the older standalone S ear package
does not replace those current facial fits. No source artwork is authored or edited.

The existing component validators rebuild actual native compositions in isolated
temporary staging; each of all eight full fits must match its own approval hash.
The temporary exports are removed after generating only three compact contact
sheets under `head/assembly-v1/`: `overview.png` (assembled),
`anatomy-overview.png` (hair-free skin plus visible facial layers), and
`reference-overview.png` (each original same-facing reference). Every sheet uses
4 columns x 2 rows in N, NE, E, SE / S, SW, W, NW order. Cells are native 384x440
crops at x320/y40; no scaling, shifting, rotation, mirroring or panel-specific
alignment. Direction labels/checkers belong only to previews. Native images and
anchors remain unchanged; no duplicate full-canvas fits are retained in this pack.

N/NE/NW keep eyes, brows, mouth and frontal fringe hidden. The hair-free sheet
exposes inherited gaps/fragments in diagonal brows previously concealed by the
current fringe. These are existing visible-reference extractions, not complete
concealed facial geometry. Cross-facing bare-ear size differences, residual hair
noise and local transitions remain review debt; current hairstyle approval does
not certify other hairstyles. The user's SE/SW ear-size concern and actual future
body/clothing occlusion of abrupt neck/shoulder hair starts are carried unchanged.

Review the assembled/reference sheets for shared identity, facing and current
visible fit; use the anatomy sheet to assess hidden geometry and proportions.
Individual approvals stay valid. The consolidated head-set consistency checkpoint
awaits visual review, is uncommitted and is not a runtime catalog or final Step 6C.
Body/clothing anatomy and production T-pose framing/compatibility remain future
work, along with concealed geometry, variants, expressions/materials and independent
pixel artwork. Step 6D has not started. Older pending/selected entries are history.

Validation: asset-validator typecheck, root lint (zero warnings), JavaScript/
declaration build and `pnpm head:review:all` passed. Initial new selector validation
incorrectly reused the runtime PNG-only path schema for JSON/folder pins; fixed
with a private relative-path parser, without changing runtime contracts or source
files. The new public workflow in the existing head-review test file and expanded
cleanup workflow passed (2 tests, 270.26 seconds; 4 unrelated head workflows
skipped). They verify all eight approval hashes, native panel placement, hidden
posterior features, deterministic re-export, immutable sources, inherited review
obligations and rejection of swapped facing/stale re-pinned approval/unsafe output.
All 675 prior source/reference hashes and mtimes remain exact; source README text
changes intentionally. All 220 current review PNG hashes and the S viewer verify.
Final cleanup removes 42 regenerated files (1.4 MiB), preserving nine current
reviews and all pinned source dependencies. See `head/assembly-v1/fit-audit.json`.
Full application build and studio browser E2E were not rerun for this offline
review-only increment. No helper/default/unit-test suites were added.


## N ear approval and consolidated head checkpoint — 2026-10-13

The user approved separate N ears/root skin and requested cleanup, a local commit
and continued Step 6C work. `ears/human-v1/north-v1/review-fit-v1.json` pins the
selected sources/configuration and exact native human head/hair fit. Approved
imagery remains unchanged. This approves the standing-reference ear/root checkpoint,
not complete production anatomy or compatibility with other hairstyles.

Next consolidate the selected S/N/E/W/SE/SW/NE/NW head, facial and ear fits into
one offline eight-facing review, validating each against its own approval record.
Reuse retained source validators and real plane composition; preserve current
native images and hidden posterior features. Compare assembled and hair-free
anatomy across facings before body authoring. This is a head-module consistency
checkpoint, not final Step 6C or runtime publication. The noted SE/SW bare-ear
size discrepancy and actual body/clothing occlusion of abrupt hair starts remain
open. Concealed geometry, variants/materials, full body/clothing, production T-pose
and independent pixel assets remain unfinished. Step 6D has not started; older
pending-approval statements below are historical.


## Separate N human-ear/root candidate — 2026-10-13

Commit `7cf808e` records the approved N revision-1 full-back anatomy and its
dedicated review after cleanup of 34 generated files (1.3 MiB). The next bounded
Step 6C candidate is `ears/human-v1/north-v1/authoring.json`; export with
`pnpm ears:review:north`. Physical left is screen-left and right screen-right
in N. Both original ear/collar patches retain their own native RGBA. Original
head, neck, hair, anchors and all other approved facings remain unchanged.

Built-in imagegen supplies one independently authored N ear-erasure study from
the exact native approved head guide. `north-v1/prompts.json` pins the complete
prompt, local input roles and selected study. Only manually traced same-facing
scalp/root contours within left x420–463/y181–243 and right x562–604/y181–243
retain study RGB/alpha with 4x4 coverage. The selected exterior is cleared; faint
study pixels below the inherited 8/255 threshold remain transparent. Generated
halo/background and all unselected changes are excluded. No transformations,
mirroring, global colour key or accepted-source overwrite.

Four native pixels at interior/top/bottom window boundaries join selected study
skin to original skin using exact source-over alpha rounding. Contour-edge alpha
uses the study alone so old ear-rim colours are excluded. Original RGBA remains
exact outside both windows. A human-specific retention mask clears those windows
before both original ears draw in the core ears plane, reconstructing the approved
head and posterior neck/rear-hair fit exactly. Ear-free previews use the complete
underlay without human retention. Guide/partition scripts replay only in scratch.

Review `ears/human-v1/north/anatomy-overview.png`: approved bare skin / new
ear-free roots / original ear-collars / reconstructed human skin. Column two is
new and needs approval of outline, shade and local transitions. A native 4x root
comparison is in `inspection/N-root-comparison.png`. `overview.png` compares
reference / approved posterior fit / identical separate-ear fit. Eyes, brows,
mouth and frontal fringe remain hidden. Current rear hair covers all head pixels;
this does not approve cross-facing sizes or alternative hairstyles.

Asset-validator typecheck, root lint (zero warnings), JavaScript/declaration build
and the new CLI passed. The existing ear-review file's new N public workflow plus
cleanup workflow passed (2 tests, 26.12 seconds; 4 unrelated S/E/W/SE/SW/NE/NW ear
workflows skipped). They check actual plane order, complete native reconstruction,
ear removal/root samples, own-study RGB, deterministic exports, immutable sources,
rejection of re-pinned out-of-window/ear/side edits and protected current reviews.
All 658 prior source/reference hashes and mtimes remain exact; source README text
changes intentionally. Nine partition/config outputs and one guide replay byte-
for-byte in scratch. All 217 current PNG hashes and the S viewer verify. Final
cleanup removes 36 regenerated files (1.4 MiB), preserving eight reviews and all
pinned sources. See `north-v1/fit-audit.json`. Full app build and studio browser
E2E were not rerun for this offline increment. This candidate is uncommitted and
unapproved. Earlier pending/selected statements below are historical.

The SE/SW bare-ear size discrepancy remains an alternate-hairstyle review debt,
alongside actual body/clothing occlusion of abrupt neck/shoulder hair. Both are
carried into the current review. Complete concealed geometry, ancestry/size
variants, expressions/materials, full body/clothing, production T-pose, independent
pixel artwork and final Step 6C remain unfinished. Step 6D has not started.


## N anatomy approval and next separate full-back ears — 2026-10-13

The user approved the dedicated N full-back anatomy review and requested cleanup,
a local commit and continued Step 6C work. `head/soft-oval-v1/north-review-fit-v1.json`
pins the unchanged revision-1 N head/neck, selected `authoring-v5.json`, hair
approval and native fit. This standing-reference checkpoint covers bare skull,
embedded human ears, nape and neck; it does not establish production poses or
other-hairstyle fit. Current rear hair covers all 24,270 head pixels.

Next separate both N human ears/collars and locally author complete ear-free scalp
roots beneath them, preserving approved skull/neck/hair and native anchors.
Physical left is screen-left and right screen-right in this full-back facing.
Human retention must reconstruct the original head and accepted fit exactly;
new concealed skin needs visual approval. Keep eyes, brows, mouth and frontal
fringe hidden. The SE/SW cross-facing bare-ear size concern and future body/hair
occlusion checks remain open. Variants, concealed geometry, materials, full body/
clothing, production T-pose, independent pixel art and final Step 6C remain open.
Step 6D has not started; earlier pending N approval statements are historical.


## Dedicated N full-back anatomy review — 2026-10-13

Commit `af5a206` records approved NE/NW ear/root revision 1 after removal of
34 regenerated files (1.3 MiB). Next review the retained N anatomy on its own:
`pnpm head:review:north` selects the unchanged N frame in `authoring-v5.json`.
The artwork remains `N-master-v1.png`, `N-head-v1.png`, `N-neck-v1.png`.
No new generation, source-image/mask edits, transforms or mirrored facings.
Origins remain head (510,175), neck (510,288), with every part drawn at (0,0).
The inherited 8/255 alpha normalization is unchanged. The scoped export avoids S
artwork dependencies; existing paired commands and their image outputs remain intact.

Review `head/soft-oval-v1/north/overview.png`: reference / bare head-neck skin /
actual accepted-hair fit. Inspect column two for full-back skull/nape shape,
both ear proportions and neck transitions. Eyes, brows, mouth and frontal fringe
are hidden. Hair covers all 24,270 head pixels, so the assembly cannot establish
anatomy or alternate-hairstyle compatibility. N was never approved with S or NE/NW
and remains unapproved; both ears remain embedded pending separation after this
visual gate. Report coverage is specific to N, not repository-wide coverage.

Fourteen N inspection PNGs are protected by cleanup alongside six facial/ear
reviews. `head/soft-oval-v1/north-fit-audit-v1.json` pins inputs, outputs and
outstanding obligations. Future alternate-hairstyle checks for unequal bare SE/SW
ear sizes and actual body/clothing occlusion of abrupt hair starts remain open.
Variants, concealed geometry, expressions/materials, body/clothing, production
T-pose, independently authored pixel art and final Step 6C remain unfinished.
Step 6D has not started. This review implementation is uncommitted; N visual
approval is pending. Earlier pending/next statements below are historical.

Validation: asset-validator typecheck, root lint (zero warnings), JavaScript/
declaration build and `pnpm head:review:north` passed. The existing expanded S/N
and cleanup workflows passed: 2 tests, 74.91 seconds, 3 unrelated head workflows
skipped. They verify exact N equivalence to paired review, native depth and source
ownership, N-only outputs/preview, no S master dependency, deterministic exports,
invalid-scope rejection and preservation of current reviews. All 656 prior source/
reference hashes and mtimes remain exact; source README text changes intentionally.
All 201 current PNG hashes and the S viewer verify. Final cleanup removes another
34 generated files (1.3 MiB), preserving seven reviews and pinned sources. Full
application build and studio browser E2E were not rerun for this offline increment.


## NE/NW ear approval and next N anatomy review — 2026-10-13

The user approved the independent NE/NW near-ear/root checkpoint and requested
cleanup, a local commit and continued Step 6C work. Approval is pinned in
`ears/human-v1/back-diagonals-v1/review-fit-v1.json`, including local studies,
masks, source/config hashes and unchanged posterior human-fit outputs. All
approved source artwork/configurations and derivation baselines stay unchanged.
The future alternate-hairstyle check for unequal bare SE/SW ear sizes and the
body-occlusion obligations for abrupt neck/shoulder hair remain open.

Next review the existing independently authored N full-back head/neck draft and
its actual accepted-hair composition on their own. N was never covered by S or
NE/NW anatomy approval. Inspect skull/nape shape, both ear proportions and neck
transition with eyes, brows, mouth and frontal fringe hidden. Prepare a dedicated
N review from retained sources before changing its anatomy or separating ears;
no new generation is needed just to recover this pending visual gate.
Other variants, concealed geometry, materials, actual body/clothing, production
T-pose, independent pixel artwork and final Step 6C remain unfinished. Step 6D has
not started; older selected/pending-approval statements below are historical.


## Independent NE/NW near-ear/root candidate — 2026-10-13

Local commit `8e3c16d` records qualified SE/SW near-ear/root approval after
32 regenerated build files (1.3 MiB) were removed. Its approval record preserves
the user's concern about unequal bare SE/SW ear sizes: current reference hair
conceals the difference, but future shorter/open-ear hairstyles need cross-facing
proportion, attachment and actual exposure review. No size redesign is made now.

The next bounded Step 6C candidate is
`ears/human-v1/back-diagonals-v1/authoring.json`, exported by
`pnpm ears:review:back-diagonals`. NE/right and NW/left near ears/collars retain
original native RGBA; opposite ears are explicitly hidden and unauthored.
Baselines are the approved independent posterior heads in
`head/soft-oval-v1/back-diagonals-authoring-v1.json` and their approval record.
Origins stay NE (581,162), NW (447,158), with all images drawn at (0,0).
Eyes, brows, mouth and frontal fringe remain hidden. N remains an unapproved draft.

Built-in imagegen independently supplies same-facing ear-erasure studies from
exact accepted native head guides. Local `prompts.json` retains prompts/input
roles and selected local PNG pins. Retention is bounded to interior windows
NE x604–640/y145–217 and NW x411–441/y148–213. Both ears lie inside the existing
skin silhouette, so every original outer contour, nape/neck and out-of-window RGBA
pixel remains exact. No image transformations, mirroring, global key or accepted
source overwrite. Generated halo/background and all unselected changes are excluded.

The first rectangular study-only draft showed shade joins in close-ups and was
refined before review. A four-native-pixel alpha coverage transition composites
unpainted study RGB over the original same-facing skin at window boundaries, using
the shared compositor's exact source-over rounding. Complete ear marks lie inside
full study coverage; no blur/resampling is used. Human-specific retention clears
the entire window before original ear/collar RGBA draws in the core ears plane,
reconstructing the accepted head and full posterior neck/rear-hair fit exactly.
Ear-free previews use the complete underlay without human retention.

Review `ears/human-v1/back-diagonals/anatomy-overview.png`: NE above NW;
approved skin / new ear-free roots / original ear-collar / reconstructed skin.
Column two needs visual approval of shade, faint root marks and local transitions.
Native 6x root comparisons are in `inspection/NE-root-comparison.png` and its
NW counterpart. `overview.png` shows reference / approved posterior fit /
identical separate-human-ear fit. Current hair heavily covers the ears; this does
not establish compatibility with other hairstyles or correct cross-facing sizes.

Asset-validator typecheck, root lint (zero warnings), JavaScript/declaration build
and the new CLI passed. Focused ear/cleanup integration workflows passed: two
tests, 41.26 seconds, three unrelated S/E/W/SE/SW ear workflows skipped. They cover
actual core plane order, hidden frontal layers, native alpha joins, exact accepted
head/fit reconstruction, determinism, immutable inputs, rejection of re-pinned
out-of-window/ear/side edits and preservation of all current reviews through cleanup.
An initial test assertion incorrectly expected the word "different" in the recorded
"differ" feedback; it now compares the complete inherited review obligations with
the authoritative SE/SW approval. Initial new-module naming errors were corrected
before the final passing checks.

All 635 prior source/reference hashes and mtimes stay unchanged; only the source
README text changes intentionally. Eleven partition/config outputs and two guides
replay byte-for-byte in scratch. All 187 current facial/ear PNG hashes and the S
viewer verify. The final cleanup removes 34 regenerated files (1.3 MiB), preserving
six current reviews and all pinned source dependencies. See the new local
`back-diagonals-v1/fit-audit.json`. Authoring scripts replay only in scratch.
Full application build and studio browser E2E were not rerun for this offline
increment. This new candidate is uncommitted and unapproved.

N anatomy/ears, complete concealed far-ear/hair geometry, ancestry/size variants,
expressions/materials, actual body/clothing occlusion, production T-pose,
independently authored pixel artwork and final Step 6C remain unfinished.
Both future body-occlusion and alternate-hairstyle ear-size obligations remain
open and are carried into the current review. Step 6D has not started; older
selected/pending-approval statements below are historical.


## Qualified SE/SW ear approval and hairstyle review debt — 2026-10-13

The user approved the diagonal near-ear/root checkpoint, requested cleanup and a
local commit, and noted that the bare SE/SW ears have different apparent sizes.
`ears/human-v1/front-diagonals-v1/review-fit-v1.json` pins the selected config,
sources and unchanged accepted head/facial/hair fit hashes. SE and SW anatomy ears differ in apparent size in the bare-head review. Current reference hair conceals this discrepancy; approval does not establish compatibility with alternate hairstyles. Before shorter/open-ear hairstyles or ear-size variants are accepted, compare native ear proportions, attachment and exposure across independently authored facings and review the actual layered fit. If exposed differences look incoherent, author versioned corrections rather than silently scaling or mirroring approved ears.

This concern remains open. It does not revoke approval of the current reference
hair fit or authorize an ear-size redesign now. Existing body-occlusion obligations
remain open. Next inspect and separate independently authored NE/NW near ears
with bounded ear-free roots, preserving their approved posterior anatomy/hair
checkpoint and native anchors. Both must hide eyes, brows, mouth and frontal fringe.
N remains an unapproved anatomy draft. Other variants, concealed surfaces, materials,
body/clothing, production T-pose, independent pixel art and final Step 6C remain
unfinished; Step 6D has not started. Earlier pending-approval statements are history.


## Separate SE/SW near-ear and root candidate — 2026-10-13

Commit `3dd1436` records approved E/W ear/root revision 1 after cleanup of
29 regenerated build files. The next bounded Step 6C candidate is
`ears/human-v1/front-diagonals-v1/authoring.json`, exported by
`pnpm ears:review:front-diagonals`. Inspection of the accepted diagonal heads
shows only SE's character-right and SW's character-left near ear. The far ears
are explicitly hidden; complete concealed far-ear geometry remains unfinished.
This supersedes the earlier proposed two-ear scope without inventing anatomy.

Original near-ear/collar RGBA stays at native anchors SE (554,164), SW (454,175).
Built-in imagegen supplies independently authored ear-free studies from each
exact same-facing guide. Only local ear windows retain study RGB/alpha through
manually traced scalp contours with deterministic 4x4 coverage; exterior pixels
inside the windows are cleared. Original RGBA stays exact elsewhere. Generated
background and all unselected edits are discarded locally. No mirroring, image
transforms, global colour key or approved-source overwrite. Study transparency
at contour edges is retained; it is not forced into opaque skin.

Human-specific retention clears the whole ear/collar window before original ears
draw, reconstructing exact accepted heads and full approved facial/neck/hair fits.
Native SE/SW nose ownership, all existing S/E/W sources and future abrupt
neck/shoulder hair body-occlusion obligations stay intact. Ear-free previews use
the full underlay without human retention. Review
`ears/human-v1/front-diagonals/anatomy-overview.png`: SE above SW; approved skin /
ear-free root skin / original ear-collar / reconstructed skin. Column two is new
and needs visual approval of contour, shade and local transitions. Native 6x root
comparisons are in inspection/. All facial and E/W/SE/SW ear reviews are protected
by cleanup. Authoring guides/partition replay only in scratch. The candidate is
uncommitted/unapproved. Remaining back-facing ears, hidden geometry, variants,
N review, expressions/materials, body/clothing, production poses, independent
pixel art and final Step 6C remain open. Step 6D has not started.


## E/W ear approval and next SE/SW increment — 2026-10-13

The user approved independent E/W ear/root revision 1 and requested cleanup,
a local commit and continued Step 6C work. Approval is pinned in
`ears/human-v1/profiles-v1/review-fit-v1.json`, including source/configuration
and actual human/ear-free fit hashes. Approved source imagery/configs and all
required derivation baselines remain unchanged.

Next separate both physical ears/collars for each independently authored SE/SW
head and author bounded same-facing ear-free root skin. Native human retention
must reconstruct accepted diagonal heads and full approved facial/neck/hair fits
exactly, including partial alpha. Preserve nose ownership, S/E/W approvals,
all framing and the future body-occlusion obligation for abrupt shoulder hair.
New concealed root anatomy needs its own visual approval. No ear-size redesign,
mirroring or runtime publication. Other ear facings/variants, hidden geometry,
N anatomy, expressions/materials, body/clothing, production poses, independent
pixel art and final Step 6C remain open; Step 6D has not started. Earlier current/
pending-approval statements below are historical.


## Independent E/W human-ear/root candidate — 2026-10-13

Commit `2b267ff` preserves approved E/W facial revision 1 after cleanup of
26 regenerated build files. The next Step 6C candidate is
`ears/human-v1/profiles-v1/authoring.json`, exported by
`pnpm ears:review:profiles`. Independent E/right and W/left original ears/collars
retain native anchors, framing and pixels. Same-facing built-in imagegen studies
supply ear-free skin only inside manually traced interior root masks. Original
head RGBA and contour stay exact elsewhere; human retention masks reconstruct
accepted heads and full facial/hair fits exactly. The initial RGB-only attempt
left partial-alpha ear-rim colours and was discarded before review; current
ownership retains complete study RGBA. No global key, resampling or mirroring.

Review `ears/human-v1/profiles/anatomy-overview.png`: E above W; approved skin /
ear-free roots / original ear-collar / reconstructed skin. New concealed skin is
in column two and awaits visual approval of colour and joins. Local 6x comparisons
are in inspection/. Prompts, guides, selected studies and scripts remain local;
authoring replays only in scratch. Cleanup preserves this review and all three
current facial reviews. The increment is uncommitted/unapproved. Other ear
facings/variants, complete hidden geometry, expressions/materials, N anatomy,
real body/clothing occlusion, production poses, independent pixel assets and final
Step 6C remain open. Step 6D has not started; earlier current statements are history.


## E/W facial approval and separate-profile-ear increment — 2026-10-13

The user approved E/W facial revision 1 and requested generated-data cleanup,
a local commit and continued Step 6C work. The approval is pinned in
`face/reference-v1/profiles-v1/review-fit-v1.json`, including native feature/mask
sources, physical side visibility, accepted profile anatomy and actual fit hashes.
This is a visible standing-reference checkpoint, not final production approval.
The selected artwork/configurations and required derivation history remain intact.

Next separate the E/W human ears and their attachment collars from the accepted
same-facing head anatomy, with locally authored ear-free scalp/root skin beneath
them. E uses the character-right ear; W uses the character-left. Preserve every
accepted head/neck/hair/nose/facial source and reconstruct the accepted actual fit
exactly through native human-specific retention masks. The ear-free contour and
root skin need their own visual review. No mirroring, image transforms, ear-size
redesign or runtime catalog publication. Other ear facings/variants, concealed
geometry, N anatomy, body/clothing, production poses, independent pixel art and
final Step 6C remain open. Step 6D has not started. Earlier current/pending-approval
statements below are historical.

## Independent E/W facial-layer candidate — 2026-10-13

Commit `61acfb7` records approved SE/SW facial revision 2, its cheek-tint trim,
approval pins and required derivation history. Generated-data cleanup removed
24 regenerated build files; current reviews and all source/reference dependencies
were preserved. No additional obsolete source imagery was found.

The next Step 6C candidate is `face/reference-v1/profiles-v1/authoring.json`.
`pnpm face:review:profiles` validates six independent native reference-owned
eye/brow/mouth layers over approved `head/soft-oval-v1/profiles-authoring-v3.json`.
E exposes character-right eye/brow, W character-left; the opposite eye/brow are
explicitly hidden. Origins stay E (558,165), W (451,176), with all images drawn
at (0,0). Manually traced 4x4 contour coverage changes alpha only, without RGB
painting, scaling, image movement or mirroring. The visible ear, native nose/chin,
head/neck/front/rear hair and accepted S/SE/SW sources remain unchanged.

Review staging `face/reference-v1/profiles/overview.png`: E above W, columns
reference / approved anatomy-hair / facial candidate. The `inspection/` directory
holds E/W native 4x comparisons. Partition authoring is replayed only in scratch;
the initial W masks were refined there before review to retain complete eye/mouth
detail and exclude a fringe fragment. Cleanup preserves all three current facial
reviews. This increment is uncommitted and unapproved. Hidden feature geometry,
expressions/materials, other ear facings, N anatomy review, body/clothing occlusion,
production T-pose, independent pixel assets and final Step 6C remain unfinished.
Step 6D has not started. Earlier current-selection statements are historical.

## SE/SW facial approval and profile increment — 2026-10-13

The user approved SE/SW facial revision 2 and requested cleanup, a local commit
and continued work. `face/reference-v1/front-diagonals-v1/review-fit-v2.json`
pins the accepted configuration, feature/mask sources and actual fit hashes.
This approves the visible standing-reference facial checkpoint, including the
SE cheek-tint trim; source configs and artwork remain unchanged. Historical
revisions, masks and reference dependencies remain required baselines.

The next bounded Step 6C increment separates E/W visible eyes, brows and mouth
from each profile's own reference over accepted `profiles-authoring-v3.json`
head/neck/hair anatomy. Keep physical side identity, native framing, nose and
ear ownership. Inspect the actual layers and composition, preserve S/SE/SW and
do not mirror a profile. New profile features need visual approval. Body
occlusion, concealed surfaces, expressions/materials, N anatomy review, production
T-pose, independent pixel art and final Step 6C remain open. Step 6D has not started.
Earlier current/pending-approval statements below are historical.

## SE right-eye cheek correction — 2026-10-13

The user found the diagonal facial candidate otherwise good but asked to remove
the shade under SE's character-right/near eye. Its reference extraction included
a broad rosy cheek patch. Feedback is retained in
`face/reference-v1/front-diagonals-v1/review-fit-v1.json` without inferring final
approval. `pnpm face:review:front-diagonals` selects `authoring-v2.json` in that
folder: a manually traced lower-lid contour removes the cheek tint through native
4x4 alpha coverage. The unchanged approved head supplies the underlying skin;
no painting, mirroring, image movement or resampling occurs.

Eye RGB/detail, the nine other facial layers, the entire SW fit, approved
head/neck/nose/hair and approved S revision 11 remain exact. Review reference /
revision 1 / revision 2 in staging
`face/reference-v1/front-diagonals/inspection/SE-cheek-fit-comparison.png`.
`face:review:front-diagonals:v1` exports the pinned prior candidate separately.
The authoring script is replayed only in scratch. New visual approval is pending;
future body occlusion, complete concealed geometry, expressions/materials, other
facings, production T-pose, independent pixel artwork and final Step 6C remain
open. Step 6D has not started. Earlier current-selection paragraphs are historical.

## Independent SE/SW facial-layer candidate — 2026-10-13

Local commit `e590858` records the approved S revision-11 facial/fringe fit,
its approval record and required brow derivation baselines. Cleanup before that
commit found no remaining regenerable files. The S source and default review
configuration remain unchanged.

The next Step 6C candidate is
`face/reference-v1/front-diagonals-v1/authoring.json`. Ten native transparent
feature layers and binary masks independently select each facing's visible
right/left eyes, right/left brows and mouth from its own approved reference.
SE uses origin (554,164), SW (454,175); every layer draws at (0,0). Physical
right is screen-left in these front diagonals: the near eye in SE and far eye
in SW. No mirroring, image transforms, anatomy edits or new generation occur.
Ears remain embedded in the accepted diagonal head bases.

`pnpm face:review:front-diagonals` validates the retained layers and rebuilds
actual native composition over `head/soft-oval-v1/front-diagonals-authoring-v4.json`.
The head/hair baselines must match their approval hashes before adding features;
existing nose/head/neck/front/rear pixels remain exact. True foreground hair
occludes the facial layers in the core direction-specific order. The source
partition script is replayed only in an isolated scratch copy.

Review staging `face/reference-v1/front-diagonals/overview.png`:
SE above SW, with reference / approved anatomy-hair / new face candidate.
Native 4x face comparisons are in `inspection/SE-face-fit-comparison.png` and
`inspection/SW-face-fit-comparison.png`. Current S and SE/SW review outputs are
both preserved by `assets:clean`. Historical exports/build caches are removable;
all pinned sources and native reference dependencies remain protected.

This pair is uncommitted and unapproved. Review actual eye/brow/mouth placement,
reference skin rims, forehead/fringe ownership and baseline face proportions.
Visible reference shapes do not certify complete concealed surfaces, neutral/
stern expressions or material maps. The existing future body-occlusion obligation
for abrupt neck/shoulder hair remains unchanged and unverified. Other facings/
ears, full body/clothing, production T-pose, independent pixel assets and final
Step 6C acceptance remain open; Step 6D has not started.

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

## Left brow behind original fringe — revision 11, 2026-10-13

The user found revision 10 much better and the right brow more natural, but
flagged the left brow as appearing solidly over the hair. `review-fit-v10.json`
records positive observations and the remaining depth correction, without
claiming whole-fit approval. Its 27-pixel foreground attenuation caused the
left tail to appear painted onto the fringe despite correct plane order.

`pnpm face:review` now selects `authoring-v11.json`. Both exact v10 brow layers,
masks, native study and coverage are retained. The reveal override is removed,
restoring byte-identical approved-v5 foreground hair and normal opacity above
the complete left curve. The actual right-brow region stays exact to v10.
There is no new artwork generation, layer movement or source-pixel edit.

Review staging `face/reference-v1/inspection/brow-fit-comparison.png`:
reference / revision 10 / revision 11. `face:review:v10` reproduces the preceding
candidate with its own attenuated front fit. All source baselines remain pinned.
Revision 11 is uncommitted and awaits visual approval of left-tail occlusion.
This stays within Step 6C; production review debt and final acceptance remain
open. Step 6D has not started. Earlier current-selection entries are historical.

## Fuller brows and local left-tail ownership — revision 10, 2026-10-13

The user rejected v9: the character-left/screen-right brow remained much shorter
than the reference with a line at its end, and the character-right/screen-left
brow was too thin. `face/reference-v1/review-fit-v9.json` pins that rejection.
The old left tail crop contained a fringe outline, and foreground hair still
occluded part of the tail. A brow mask alone could not reveal that missing length.

`pnpm face:review` now selects `authoring-v10.json`: fuller independently traced
native study brow bands, with a clean left tail authored over a temporarily
opened forehead guide. The temporary window and all unselected study edits are
discarded. A separate intersection mask attenuates foreground hair alpha only
at the left tail (27 active pixels, 13 removed), preserving composition order.
This creates a new front fit; approved v5 source files stay unchanged. The current
head/ears/neck/rear hair, eyes/mouth/nose and eyelid folds remain exact. Native
coordinates and RGB ownership stay pinned; only authored mask coverage affects
alpha. Two unsuitable studies were discarded without retaining their PNGs.

Review staging `face/reference-v1/inspection/brow-fit-comparison.png`:
reference / rejected revision 9 / revision 10. `face:review:v9` reproduces the
preceding candidate. Revision 10 is uncommitted and needs human review of brow
thickness/length, shading, tail point and the small fringe junction. Step 6C
and all production review debt remain open; Step 6D has not started. Earlier
current-selection statements below are historical.

## Brow transition and tail taper — revision 9, 2026-10-13

The user found revision 8 much better but rejected its abrupt character-left
(screen-right) tail and sharp character-right (screen-left) transition.
`face/reference-v1/review-fit-v8.json` pins that feedback and the native fit.
The right reference/study splice and left hard mask endpoint were still visible.

`pnpm face:review` now selects `authoring-v9.json`. The complete right brow band
uses one coherent same-facing study curve, without an internal source splice.
The left retains native reference pixels and tapers through the true fringe
junction. Independently traced masks use deterministic 4x4 geometric coverage
for soft detailed-pixel alpha edges; source RGB is never resampled or moved.
The generated left curve was not selected. Approved v5 anatomy/hair/features and
upper-eyelid folds remain exact. All unselected study changes are discarded.

Review staging `face/reference-v1/inspection/brow-fit-comparison.png`:
reference / rejected revision 8 / revision 9. `face:review:v8` reproduces the
preceding candidate. Revision 9 is uncommitted and needs visual approval of the
curves, taper, shading and actual hair occlusion. Step 6C remains open; Step 6D
has not started. Earlier current-selection statements below are historical.

## Rejected brow crossing lines and local revision-8 repair — 2026-10-13

The user rejected revision 7: “Still not approved. There are lines at the brows
right now. Fix it.” `face/reference-v1/review-fit-v7.json` pins the rejection.
The expanded v7 masks copied fringe outlines crossing the brows from the flattened
reference. Exact source ownership was insufficient to establish correct semantic
ownership; trimming alone would again truncate the curves.

`pnpm face:review` now selects `authoring-v8.json`. Independently traced native
brow-band masks exclude the perpendicular stubs. A local generated S study supplies
only the two small junction patches; all other brow pixels retain reference
ownership. Native coordinates and actual foreground-hair occlusion are preserved.
Approved v5 head/ears/neck/hair, eyes/mouth/nose and upper-eyelid folds remain exact.
The study's background and all unselected generated changes are discarded.

Review staging `face/reference-v1/inspection/brow-fit-comparison.png`:
reference / rejected revision 7 / revision 8. `face:review:v7` reproduces the
rejected checkpoint. Revisions 6 and 7 are retained as pinned derivation baselines.
Revision 8 remains uncommitted and awaits human visual approval. This is still
Step 6C; concealed geometry, variants/facings and production review debt remain
open. Step 6D has not started. Older current-selection statements are historical.

## Rejected partial brows and revision-7 correction — 2026-10-13

The user rejected v6 for incomplete extraction: a gap in the character-right
(screen-left) brow and a shortened character-left (screen-right) curve.
`face/reference-v1/review-fit-v6.json` pins that rejection. Its masks were too
tight; previous assertions about correctly separated visible brows do not imply
complete extraction or approval.

`pnpm face:review` now selects `authoring-v7.json`, with widened native reference
contours through both fringe junctions. The existing approved-v5 anatomy/hair,
original eyes/mouth/nose and retained eyelid folds are unchanged. The new comparison
shows reference / rejected v6 / v7; `face:review:v6` reproduces the preceding fit.
The native missing samples `(459,176)` and `(547,164)` are restored in the actual
assembly. No artwork transforms or new generation were needed.

Review the current `face/reference-v1/inspection/brow-fit-comparison.png` in
staging. Revision 7 is uncommitted and unapproved. Junctions/skin rims, concealed
brow geometry, other variants/facings and all production review debt remain open.
This stays within Step 6C; Step 6D has not started.

## Native S eyebrows over approved fit — revision 6, 2026-10-13

Commit `169bd1c` records the approved revision-5 S neck-side fit and cleanup;
33 generated files (2.4 MiB), including 11 duplicate/obsolete previews, were
removed without deleting pinned source baselines. The next bounded candidate
is `face/reference-v1/authoring-v6.json`, selected by `pnpm face:review`.

It adds S's actual purple reference brow curves at native coordinates and
retains the old pale brow-labelled patches as upper-eyelid folds on the eye
plane. Approved head/ears/neck/hair, original eyes/mouth/nose and anchors remain
exact. No new generation or transforms were needed. The 56/157-pixel brow masks
are independently traced; concealed brow geometry is still unfinished.

Review `face/reference-v1/inspection/brow-fit-comparison.png` in staging:
reference / approved revision 5 / revision 6. The new brows need visual approval;
they are uncommitted. `face:review:v5` rebuilds the approved preceding fit. Other
facings/variants, materials, full concealed hair/body/clothing, T-pose, independent
pixel art and final Step 6C acceptance remain open. Step 6D has not started.

## Approved S neck-side fit and next eyebrow increment — 2026-10-13

The user approved revision 5 and requested cleanup, a local commit, and continued
Step 6C work. `face/reference-v1/review-fit-v5.json` pins the unchanged config,
current sources and native fit hash. This approves the S standing-reference
head/ear/neck and neck-side hair fit checkpoint, with eyebrows still unfinished.
It does not approve production anatomy, body occlusion, T-pose or final Step 6C.

Current review exports omit redundant revision-3 baseline copies and two duplicate
comparison aliases. Historical version commands still rebuild their earlier
outputs; all pinned source studies, masks and configurations remain local.
Generated caches are cleared with the existing cleanup command.

Native reference inspection shows the old layers labelled brows are pale upper
eyelid folds. The actual visible eyebrows are the purple curves higher on the
forehead. Next separate those same-facing reference curves at native coordinates,
retaining the existing folds with the eye detail and preserving approved head,
ears, neck and hair. Review the new assembly before further work. Step 6D has
not started. Earlier pending-approval statements below are historical.

## S neck-side hair backing candidate — revision 5, 2026-10-13

The user authorised continuing after cleanup. `pnpm face:review` now selects
`face/reference-v1/authoring-v5.json`; `face:review:v4` reproduces the preceding
checkpoint. The new version adds continuous local S hair backing behind the
neck and clears cropped foreground fragments. It resets 109 earlier rear-gap
selections and 23 scattered reference-neck overrides before applying the new
native ownership. Head, ears, nose and all facial features stay byte-identical
to revision 4. The raw generated study has an unwanted opaque background;
only 1,524 manually selected native hair pixels are retained in transparent
layers, with 28 jaw/skin boundary pixels excluded.

Review `face/reference-v1/inspection/neck-edge-comparison.png` in staging:
reference / revision 4 / revision 5. The current viewer retains zero rotation
and offsets. Neck-edge shading, alpha transitions and hair ownership still
need human approval; full eyebrows remain unfinished. See modular-face.md for
selected masks, prompts and scratch replay. This is uncommitted candidate work,
not final Step 6C acceptance or approval to start Step 6D.

## Asset folder consolidation and investigation archive — 2026-10-13

Commit `831093c` preserves the current face work before the user-requested
cleanup. This supersedes earlier statements that facial work is uncommitted;
revision 4 still needs visual approval and the diagnosed seams remain open.
Source/staging packs are now grouped under `heroine-v1/{hair,head,ears,face}/`,
with reference staging at `heroine-v1/references/import-v1/`. Config/approval
bytes and retained artwork are unchanged. Historical full paths in immutable
provenance JSON use the migration table in [asset-cleanup.md](asset-cleanup.md).

Five unused images and three abandoned mask drafts are archived in the checkpoint
and listed with hashes in `asset-cleanup-manifest.json`. Required historical
derivation baselines stay local. The new `pnpm assets:clean` removes generated
previews/caches while retaining current face-review outputs/viewer and native
transparent reference dependencies; other reviews rebuild on demand. The legacy
demo packages remain intact. Cleanup does not approve art or advance milestones.

## Revision-4 neck-side seams identified — 2026-10-13

The user finds the fit better but flags short lines beside the jaw/neck. Native
layer inspection confirms disconnected rear-repair strips, abrupt foreground
selection edges and partially transparent anatomy pixels exposing slits. Some
reference neck-edge skin also landed in the rear layer; the earlier claim that
all 109 selected rear pixels are hair is superseded by this diagnosis. The
`alpha <8` gap condition misses partial-alpha transitions. Bounded cheek coverage
counts do not certify the neck edges or semantic ownership.

Next author a new bounded mask/ownership revision with continuous same-facing
hair behind the neck and correct skin placement, preserving improved anatomy
and earlier sources. Current labelled brow layers contain only small pale/pink
strokes; complete visible eyebrows are still unfinished. No artwork was changed
for this diagnosis. Revision 4 still awaits approval; Step 6C remains incomplete.
See `docs/modular-face.md` for native samples and layer evidence.

## S native head/left-ear fit revision 4 — 2026-10-13

The user authorised a new S candidate following the three registration studies.
`face/reference-v1/authoring-v4.json` is now the default offline `pnpm face:review`
selection. The reviewed −5°/X−0.245/Y−2.945 setting guided authored jaw/neck anatomy;
it is not a baked image/recipe transform. Start the current overlay viewer at zero.
A smaller complete character-left ear retains visible native S reference pixels;
right ear and all original reference eye/brow/mouth/nose pixels are preserved.
Bounded masks repair local neck skin and same-facing front/rear hair coverage.
Both bounded cheek-gap diagnostics now report zero, without global colour keys.
Residual anatomy, mask/skin transitions and inherited hair noise still need review.

`inspection/head-ear-fit-comparison.png` shows reference / revision 3 / revision 4.
`pnpm face:review:v3` reproduces the prior candidate and registration presets under
`historical-v3/`; earlier sources and approval checkpoints are intact. S/N head
review remains v5, profiles v3, front diagonals v4 and smaller S human ears v2.
The final study follows a manual silhouette; two earlier studies and rejected
mask prototypes remain provenance. Exact built-in prompts, studies, guides,
native ownership masks and scratch-replay scripts are retained locally. See
`docs/modular-face.md` for selected windows and outputs.

This new fit is unapproved and uncommitted. Other facings/variants, concealed
geometry, real body/clothing occlusion, materials, production T-pose, independent
pixel art and final Step 6C acceptance remain open. Step 6D has not started.

## Reviewed S alignment settings and left-ear mismatch — 2026-10-12

The user compared three inspection registrations: −5°/X0/Y0 improves the jaw and
right ear; 0°/X3.3333/Y−3 improves ear alignment but leaves jaw mismatch; and
−5°/X−0.245/Y−2.945 gives a good-looking jaw while character-left/screen-right
ear size remains incorrect. Retain the third as the working inspection setting,
with all three reproducible in the overlay viewer. It is not approval of a source
transform or the complete facial assembly. Next assess that left ear's local
size/attachment/occlusion against its own S reference before a versioned repair.
Approved earlier ear/head/hair sources and current native artwork are preserved.
Overall revision-3 approval and cheek/hair gaps remain open; see modular-face.md.

## Chin landmark and rotation during alignment — 2026-10-12

The chin is an alignment point to optimise alongside other visible landmarks,
not a required rotation pivot. The offline S overlay viewer now adjusts rotation
and X/Y translation together and can fit manually paired chin/jaw landmarks with
equal-weight rigid least squares. It reports residual error at each point and
keeps the actual assembled gap view native. This adds no recipe or pixel-render
transform and changes no source artwork. Future anatomy/extraction guides should
use the chin with other same-facing landmarks, preserving native source ownership.
The user flags screen-right cheek/jaw asymmetry even after accounting for tilt;
alignment alone cannot fix it. Revision-3 anatomy approval, cheek/hair repair and
final Step 6C acceptance remain pending. See `docs/modular-face.md` for controls.

## Revision-3 anatomy overlay and cheek/hair gaps — 2026-10-12

The user identified cheek-to-hair gaps and requested the head anatomy directly
over the reference to judge face size. The new outputs from `pnpm face:review`
include `face/reference-v1/inspection/S-head-overlay-closeup.png` (50% head and
cyan contour over the reference), full native overlays, a self-contained
`head-reference-overlay.html` opacity/zoom viewer and magenta cheek-gap previews.
All source/native positions are unchanged; zoom affects inspection display only.

The actual assembly has reference-covered transparency in both cheek regions.
Four sampled gap points contain reference hair and no current head/front/rear
pixels. The inherited hair fit leaves missing coverage visible after the narrower
head revision. Review the overlay's face/jaw alignment first, then use a bounded
same-facing hair ownership correction for the confirmed gaps. Gap markers are
diagnostic, not automatic repair masks. See `docs/modular-face.md`.

No source art/configuration or fit pixels changed for this inspection increment.
All 435 existing source/reference hashes and mtimes are unchanged. Revision 3 is
still unapproved; cheek/hair fit and other existing review debt remain open.
No new artwork, commit or milestone advancement was requested or performed.

## S face-size mismatch and revision-3 candidate — 2026-10-12

The user rejected eye-fit revision 2 and identified the broader/heavier face
relative to the source reference. `face/reference-v1/review-fit-v2.json` pins the
rejection. Revising eye placement on the same broad cheeks/jaw did not address
the underlying anatomical mismatch.

`face/reference-v1/authoring-v3.json` now selects a local slimmer S lower-head
candidate and restores the original S reference eyes/brows/mouth and native nose
shading. Approved head/neck/ear/hair sources and normal head-review selections
are preserved. New ear masks retain the current native ear size/pixels while
trimming old cheek collars. A locally authored root/upper-neck join study supplies
bounded new head/neck-fit pixels. No artwork is resized, shifted or mirrored.

`pnpm face:review` builds revision 3. Review
`assets/staging/heroine-v1/face/reference-v1/inspection/face-size-comparison.png`
(reference / rejected revision 2 / revision 3), `overview.png` and
`anatomy-overview.png`. Both rejected revisions remain available through
`pnpm face:review:v1` and `pnpm face:review:v2`. The first shape study changed
framing and was rejected; raw studies, native guides, masks, exact prompts and
scratch-replay scripts are retained in source. See `docs/modular-face.md`.

This candidate awaits visual approval of face width/jaw/chin, original feature
fit, ear roots, skin joins, upper neck and actual hair coverage. All 405 earlier
source/reference hashes and mtimes are unchanged. Automated checks do not approve
anatomy. No commit was requested for this correction. Step 6C is unfinished;
Step 6D has not started. Older pending/current descriptions below are historical.

## S eye-placement rejection and local correction — 2026-10-12

The user rejected the first facial overview for incorrect eye position.
`face/reference-v1/review-fit-v1.json` pins that rejection. Copying reference
features at their original coordinates proved source ownership but did not
establish anatomical placement on the separately authored S head.

`face/reference-v1/authoring-v2.json` now selects locally authored native S eyes
and brows from a retained built-in imagegen study using approved S skin plus
manual placement guides. Only four bounded same-side feature masks are retained;
approved head, ears, neck, both hair layers and the reference-owned mouth stay
unchanged. No source image is shifted, scaled or mirrored. New eye geometry and
brow colour also need visual review, alongside placement and skin joins.

`pnpm face:review` shows the current candidate. Inspect
`assets/staging/heroine-v1/face/reference-v1/inspection/eye-fit-comparison.png`
(reference / rejected revision 1 / revision 2), `overview.png` and the bare
`anatomy-overview.png`. `pnpm face:review:v1` retains the rejected overview under
`historical-v1/`. Exact prompts, raw study, native guide, masks and scratch-replay
scripts are retained in source. See `docs/modular-face.md` for checks and limits.
The new candidate remains unapproved and uncommitted. Step 6C is incomplete;
Step 6D has not started. Earlier descriptions below are historical.

## S facial-feature candidate — 2026-10-12

Local commit `545526a` records the approved smaller S ears and the decision to
retain ear size as a future authored design choice. The next Step 6C increment
now has native separate S eyes, brows and mouth from their own reference. Selected
manual masks preserve source RGBA and physical sides; a local refinement excludes
a brow hair fragment and excess adjacent skin. Earlier extraction outputs remain
as provenance. All 360 pre-increment source/reference files remain unchanged.

`face/reference-v1/authoring-v1.json` pins the approved ear configuration and
approval, reference and selected native layer/mask hashes. `pnpm face:review`
rebuilds and verifies the approved ear baseline, then uses actual S plane order
with eyes/brows/mouth beneath foreground hair. Inspect
`assets/staging/heroine-v1/face/reference-v1/overview.png` and `anatomy-overview.png`.
The candidate awaits visual approval of contours, skin joins, proportions and
hair coverage. See `docs/modular-face.md` for source ownership and validation.

Only visible reference features are separated. Concealed eyes/brows, independent
neutral/stern expressions, iris materials and seven other facings remain open.
The nose highlight remains in the accepted head. This is an unpublished offline
candidate with no recipe/editor changes. Other ear facings/ancestry variants,
body/clothing, concealed hair, T-pose and independent pixel artwork remain open;
N stays an unapproved draft. Step 6C is unfinished and Step 6D has not started.

## S ear approval and future size variants — 2026-10-12

The user approved keeping the current smaller S ear size and requested a commit
and continuation. `ears/human-v1/review-fit-v2.json` records the limited S
standing-reference anatomy/underlay/hair-fit checkpoint. Preserve the original
larger pair too: ear size can become another authored character-design choice,
with independently authored facing/attachment coverage. This is design intent,
not an implemented runtime control, recipe change or continuous image resizing.

The next bounded Step 6C increment separates S eyes, brows and mouth from the
same-facing reference and reviews them over the approved smaller-ear skin and
existing hair. Other ear facings/ancestry variants remain subsequent work.
No final Step 6C acceptance or advancement to Step 6D is implied. The correction
history below retains superseded pending-review statements.

## S ear proportions correction — 2026-10-12

The user rejected the inherited S ear size as too large relative to the original
reference and requested smaller ears. Revision 1's exact separation preserved
that anatomical mismatch. `ears/human-v1/authoring-v2.json` now selects a new,
unapproved local correction: independently authored smaller S ears from a retained
built-in imagegen study, with a narrow native selection mask and the prior
concealed-skin underlay elsewhere. The first study did not reduce size sufficiently
and was rejected. All accepted head/neck/hair sources and head-review command
selections remain unchanged; no native artwork is moved, mirrored or resized.

`pnpm ears:review` shows reference / accepted oversized-ear fit / smaller-ear
candidate. Inspect `assets/staging/heroine-v1/ears/human-v1/overview.png` and
`anatomy-overview.png`. `pnpm ears:review:v1` retains historical separation output
under `historical-v1/`. Exact prompts, source ownership and replay scripts are
retained locally; see `docs/modular-ears.md`. Ear size, complete anatomy, contour
joins and hair coverage await human approval. Step 6C remains unfinished, with
no advancement to Step 6D and no new approval inferred from prior S5 acceptance.

## Separate S human-ear review — 2026-10-12

Local commit `1525979` records the approved NE/NW head/neck and hair-fit checkpoint.
The next Step 6C increment separates S's human ears and authors concealed scalp/root
skin underneath them, preserving all accepted artwork. The two ear/attachment
patches keep their own physical side and exact native RGBA. Because the accepted
skin has partial alpha, a human-specific head retention mask clears head coverage
under the active human-ear pair; the restored head and actual S hair fit remain
byte-identical to the accepted checkpoint. With ears absent, use the complete
skin underlay without that human mask. Other variants need their own masks.

Selected authoring: `assets/source/heroine-v1/ears/human-v1/authoring-v1.json`.
Run `pnpm ears:review` and inspect
`assets/staging/heroine-v1/ears/human-v1/anatomy-overview.png`, then `overview.png`.
The new concealed skin and ear-free contour require approval. See
`docs/modular-ears.md` for native windows, retained studies, exact prompt records
and derivation limits. This is S-only; other ear facings/ancestry variants and
separate facial features remain subsequent increments. No core/runtime catalog
or editor changes. Body/clothing, actual abrupt-hair occlusion, concealed hair,
palette maps, production T-pose and final Step 6C remain outstanding. Step 6D
has not started; N is still an unapproved head draft.

## Independent NE/NW anatomy review — 2026-10-12

**Latest decision:** The user approved this NE/NW checkpoint and requested a
local commit followed by continuation. `back-diagonals-review-fit-v1.json` pins
the accepted source/config/fit hashes. This approves the standing-reference
anatomy/fit only; N remains a draft and final Step 6C is outstanding. The next
bounded increment separates S human ears from the accepted skin base and reviews
the concealed scalp/root underlay and actual hair depth. Facial components and
other ear facings/ancestry variants remain subsequent work.

Local commit `a9b2aa1` records the qualified SE/SW revision-4 approval and the
future body-occlusion obligation described below. The next Step 6C increment
adds independent posterior three-quarter NE/NW bald head/neck candidates, with
front fringe explicitly hidden and no authored eyes, brows or mouth. Existing
accepted sources and command selections stay unchanged.

The selected configuration is `head/soft-oval-v1/back-diagonals-authoring-v1.json`.
Run `pnpm head:review:back-diagonals`; review
`assets/staging/heroine-v1/head/soft-oval-v1/back-diagonals/overview.png` (NE above
NW; reference / bare head and neck / actual approved rear hair over skin).
Raw imagegen studies, complete head/neck partitions, native masks, independent
placement guides and exact prompt/derivation records are retained in source.
NW's first study changed framing and ear placement and was rejected; the selected
retry uses an explicit native near-ear marker. No facing is mirrored or shifted.

These are now approved standing-reference anatomy/fit checkpoints. Inspect posterior
orientation, absence of eyes, near-ear clearance, scalp coverage, nape and neck
transitions. Neck widths differ from the synthetic guides; native pixels are
shown as authored, not clipped to hide that difference. Check actual body joins
later, including the accepted abrupt hair starts under body/clothing occlusion.
All eight facings now have head/neck drafts, but N and the new NE/NW candidates
require production anatomy/body-fit review, while N remains unapproved. Independent facial/ear assets, concealed hair,
body/clothing, material maps, production T-pose and final Step 6C remain unfinished.
Step 6D has not started.

## Post-move SE/SW review — 2026-10-12

**Latest decision:** The user approved revision 4 for now and requested a local
commit followed by the next Step 6C increment. Abrupt hair starts in the circled
neck/shoulder area are accepted in this detached head/hair review because the
future body should cover them. `front-diagonals-review-fit-v4.json` pins this
qualified approval. Actual body occlusion remains unverified: check these starts
with real same-facing body/clothing layers, preserving correct front/rear hair
depth, and version any remaining visible defects. Do not erase valid hair now
or treat a detached overview as proof of finished body fit. The next increment
is independently authored NE/NW head/neck anatomy, with no visible eyes. Final
Step 6C and Step 6D approval remain outstanding.

The new-machine read-only audit confirmed all 424 transported checkpoint files,
the selected source configurations, eight original/transparent references and
123 current head-review PNG hashes. The temporary `wip` commit was already undone:
HEAD is `62847da`, with its transported changes retained in the working tree.

The user generally approved the SE/SW revision-3 fit, but circled abrupt hair at
SW's neck. `front-diagonals-review-fit-v3.json` records that limited approval and
remaining issue. It does not certify complete production anatomy or Step 6C.

Revision 4 clears one detached 157-pixel foreground fragment at native
x466–475/y263–286. Every selected RGBA pixel already exists identically in the
rear, behind head/neck skin. Rear hair, anatomy, SE, nose pixels and anchors remain
unchanged. This is a depth correction, with no new image generation or broad
colour cleanup. Other seams in the circled region still need visual review.

`pnpm head:review:front-diagonals` now selects
`head/soft-oval-v1/front-diagonals-authoring-v4.json`; its current overview stays at
`assets/staging/heroine-v1/head/soft-oval-v1/front-diagonals/overview.png`.
`pnpm head:review:front-diagonals:v3` retains the accepted checkpoint separately.
The comparison shows reference / revision 3 / revision 4. The latest qualified
approval above supersedes the prior pending-review state. S/N v5 and E/W v3
selections are unchanged.
Step 6C remains unfinished; Step 6D has not started.

## Machine-move checkpoint — 2026-10-10

This section describes the current handoff. The dated entries below retain
historical decisions, rejected drafts and superseded command defaults.

The user requested a temporary local commit with the exact subject `wip` to
preserve the current work while moving machines. Its parent is `62847da`
(`feat: add approved profile head and hair fit`). The checkpoint includes the
SE/SW revision-1, revision-2 and revision-3 source studies, masks, authoring
scripts, configurations, prompt records and audits, plus the asset-validator
changes and documentation. It records work in progress, not visual approval.
The user intends to undo the temporary commit after the move; retain the files
when doing so. Do not push, publish branches or create pull requests.

### Implementation and approval status

- MVP milestones 1–4 are implemented using the temporary geometric catalog:
  core recipe/contracts, asset resolution, independent renderers and studio UI.
  Real heroine artwork is still an offline authoring/review pipeline and is not
  the editor's runtime catalog. Preserve the separate legacy 64×96 demo packages.
- Steps 6A–6B have repeatable reference validation, transparent staging,
  measurements, candidate anchors and source-preservation tests. Human review
  of matte edges, uncertain regions, anchors and baseline inconsistency remains
  open in `docs/mvp.md`; do not mark full acceptance from generated files alone.
- Step 6C is in progress. All eight hairstyle designs have recorded approvals,
  with incomplete concealed hair and production rig/T-pose compatibility.
  S fit revision 5 is generally approved with known hair noise; N is an anatomy
  draft. E/W standing-reference fit revision 3 is approved with minor W overview
  ear pixelation acknowledged. These are limited fit checkpoints.
- The latest SE/SW head fit is revision 3. SE reuses revision-2 head/neck/front
  layers and assembled fit byte-for-byte. SW has local nose/jaw/neck ownership
  corrections and a newly authored curl. The user found SE much better; the
  latest SW repair has not received visual approval. Review anatomy, local mask
  transitions and remaining edge noise before continuing authoring.
- NE/NW heads, separate facial/ear variants, concealed lower hair, full body and
  clothing anatomy, material maps, independently authored pixel assets and
  production T-pose fit remain unfinished. Final Step 6C approval is outstanding;
  Step 6D has not started and requires explicit approval.

### Files and review commands to resume

All selected source imagery and derivation inputs are under version control in
`assets/references/heroine-v1/` and `assets/source/heroine-v1/`. Retained raw
studies are local repository copies; external Codex generated-image paths in
provenance are historical records, not regeneration dependencies. Temporary
files under `/tmp` and the previous machine's Codex session are not required.
Use the checked-in portable authoring scripts only to replay a derivation in a
separate scratch copy; normal review commands consume the retained sources.
Never overwrite approved artwork or mirror another facing.

`assets/staging/` is ignored and is deliberately excluded from the `wip`
commit. The user will transfer that directory separately to the same relative
location on the new machine. It contains generated inspection images/reports,
not approved runtime assets. The current review entry points are:

| Scope | Selected source config | Command | Staging overview |
| --- | --- | --- | --- |
| S/N head fit | `head/soft-oval-v1/authoring-v5.json` | `pnpm head:review` | `head/soft-oval-v1/overview.png` |
| E/W head fit | `head/soft-oval-v1/profiles-authoring-v3.json` | `pnpm head:review:profiles` | `head/soft-oval-v1/profiles/overview.png` |
| SE/SW head fit | `head/soft-oval-v1/front-diagonals-authoring-v3.json` | `pnpm head:review:front-diagonals` | `head/soft-oval-v1/front-diagonals/overview.png` |

Config paths in the table are relative to `assets/source/heroine-v1/`; overview
paths are relative to `assets/staging/heroine-v1/`. For the latest SW repair,
also inspect `head/soft-oval-v1/front-diagonals/inspection/SW-fit-comparison.png`
(reference / revision 2 / revision 3). Revision-1 and revision-2 head-fit commands
remain available separately. See `docs/modular-head.md` and
`front-diagonals-fit-audit-v3.json` for measurements and review limits.

On the new machine, use Ubuntu/WSL Bash and keep the checkout under `/home`.
Install NVM if needed, then follow the pinned toolchain:

```bash
source "$HOME/.nvm/nvm.sh"
nvm install
nvm use
npm install --global pnpm@10.34.6
pnpm install --frozen-lockfile
```

Reinstall dependencies rather than transferring `node_modules`, build outputs
or browser binaries. To regenerate reference staging if it has not been
transferred, run `pnpm reference:import` first: hair/head review commands read
`assets/staging/heroine-v1/references/import-v1/transparent/`. The head commands
above then rebuild their current inspections from checked-in source assets.
Hair inspections can be regenerated with `pnpm hair:review`,
`pnpm hair:review:profiles`, `pnpm hair:review:front-diagonals`,
`pnpm hair:review:front-diagonals:completion` and
`pnpm hair:review:back-diagonals`. The ordinary editor's temporary catalog is
regenerated by `pnpm dev` or `pnpm build`, independently of heroine staging.

### Validation carried with this checkpoint

The latest artwork change passed asset-validator typecheck, root lint,
asset-validator JS/declaration build, current revision-3 and historical
revision-2 CLI exports, and the existing focused SE/SW integration workflow:

```bash
pnpm exec vitest run tools/asset-validator/src/head-review.integration.test.ts -t 'independent SE/SW'
```

Result: one passed, two unrelated workflows skipped, 156.49 seconds. The workflow
covers actual plane composition, native nose/neck samples, unchanged SE,
deterministic output, immutable sources and rejection of re-pinned edits outside
masks. No additional unit test cases were added. All 270 pre-repair source/reference
hashes were preserved, 47 current staging PNG hashes verified, and 16 authoring
outputs plus two guides reproduced byte-for-byte in an isolated temporary copy.
S/N and E/W workflows passed during revision-2 verification and were not rerun
for the SW-only increment. Full application build/browser E2E were not rerun.
These are prior local results; rerun checks after installing on the new machine.

For a full environment check, run `pnpm test:e2e:install`, `pnpm verify`, then
`pnpm test:e2e`; Chromium system dependencies may need installation as described
in `README.md`. Do not add repetitive unit tests for the migration. Passing
automated checks does not replace visual review or authorize the next milestone.

## 1. Goal

Build a modular female fantasy character creator that lets users select and combine:

- Ancestry/race (human, elf, vampire, dwarf, furry/beast, dragonborn, angel, devil, spirit, and compatible hybrids).
- Hair length, style and colours.
- Skin tone.
- Chest size, height and overall body proportions.
- Head shape, face style and expressions.
- Independent left and right eye colours.
- Eventually outfits and other race-specific anatomy.

The user interface should let users swap compatible parts in real time, recolour individual materials and preview/export eight directional views.

## 2. Core architecture — one recipe, two independent outputs

- A single versioned `CharacterRecipe` describes character identity and appearance.
- A shared, render-agnostic TypeScript engine validates traits, selects anatomy variants, resolves compatible assets, plans layer depth, and produces a `RenderPlan`.
- **Detailed output:** 1024×1536 native image artwork, composed from separately authored detailed layers.
- **Pixel output:** 128×192 native pixel assets, separately authored for crisp in-game use. Do **not** automatically shrink detailed artwork and treat that as final pixel art.
- Both outputs share semantic asset IDs, traits, attachment names and palettes, but have separate image assets and rendering implementations.
- Internal asset PNGs are transparent. Final previews/exports use `#00FF00` backgrounds; exported direction labels appear in yellow at the upper-left. Keep labels and background OUT of internal artwork.
- Palette-based recolouring should target semantic materials (hair, skin, eyes, fabric, scales) and shade levels, not blindly tint every pixel or replace approximate RGB matches.
- Larger body geometry differences use approved silhouette/rig variants and compatible clothing assets; do not stretch entire images arbitrarily.

## 3. Eight-direction contracts

Required facings: `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`.

- `N` is full back, no visible face/eyes.
- `NE` and `NW` are three-quarter **back**, no visible eyes.
- `S` is full front.
- `SE` and `SW` are three-quarter **front**.
- `E` and `W` are independent side views.
- Never generate a direction by simply mirroring another. Side-specific hands, accessories, garment openings, hairstyles, head, torso and feet must stay physically consistent.
- Back-view garments are not reflected front garments. A slit exposing the front thigh in S/SE/SW must **not** be copied onto the rear skirt in N/NE/NW.
- All directions preserve consistent character scale, alignment, grounded feet and body proportions. Pixel-art assets use a uniform square grid with no antialiasing, blur, gradients, dithering or arbitrary rotations/scaling.
- No hanging accessories unless specified. Avoid rhombus/diamond-shaped accessories or decoration.

## 4. Planned stack and repository

Development environment: Windows + WSL2 Ubuntu. The repository is under `~/projects/character-studio`, not `/mnt/c`. VS Code runs through its WSL extension; the Codex VS Code extension is preferred over the CLI. Run Node.js, pnpm, Git, builds and tests inside Ubuntu.

Proposed stack:

- React + TypeScript + Vite + Tailwind CSS.
- Zustand state; Zod schema validation.
- `pnpm` workspaces.
- `packages/core`: pure TypeScript recipe, ancestry, anatomy and composition model.
- `packages/asset-registry`: versioned manifests and asset resolution.
- `packages/renderer-detailed`: PixiJS v8/WebGL for detailed preview/rendering.
- `packages/renderer-pixel`: deterministic integer-pixel compositor; nearest-neighbour preview.
- `tools/asset-validator` and later asset-import / palette / atlas / QA helpers.
- Vitest + Playwright where appropriate.

Suggested documentation files: `AGENTS.md`, `docs/architecture.md`, `docs/asset-spec.md`, `docs/mvp.md` and eventually `docs/asset-pipeline.md` or `docs/reference-import.md`. These should agree; if they conflict, flag for decision rather than silently choosing one.

## 5. Art / reference status

An eight-direction detailed reference pack exists **in the user's ChatGPT conversation**. The intended local repository location is:

`assets/references/heroine-v1/detailed/{N,NE,E,SE,S,SW,W,NW}.png`

Important: These image files are **not automatically present in the repository**. Verify they exist before using them; ask the user to copy them if missing.

Character visual identity:

- Adult female anime/fantasy character; long voluminous wavy silver-lilac hair with defined curls.
- Deep-purple strapless corset dress with layered flowing skirt, red/crimson sash and lining, long purple gloves, purple high heels.
- Pose: standing, arms relaxed down (this is an **idle/dressed reference**, not the proposed neutral T-pose anatomy master).
- The eight reference images are nominally 1024×1536.
- Original `NE` and `NW` images exposed an implausible front thigh slit in three-quarter back views. Corrected `NE` and `NW` reference artworks have been supplied and visually approved: the rear skirt now covers the legs and retains the red lining and folds.
- The eight PNGs have baked-in bright green backgrounds and some baked-in yellow direction labels; source files are flattened illustrations, **not modular parts**.
- Previous analysis identified fully opaque source images, imperfectly uniform green and some baseline variation. Re-measure from actual files; don't assume exact measurements without inspecting the local copies.
- Treat these as canonical **visual references** only until modular components are independently authored and approved.

## 6. MVP plan

1. Monorepo scaffold and checks (`pnpm dev`, typecheck, lint, test, build).
2. Shared `CharacterRecipe`, ancestry traits, body presets and validation in pure TypeScript.
3. Asset registry + direction-aware layered `RenderPlan` + compatibility checks.
4. Both renderers using simple synthetic placeholder assets; complete eight-direction exports with correct dimensions/colours.
5. React character creator UI (race/body/hair/face/palettes, target switch, 8 facings, S/N compare, JSON and PNG exports, undo/redo as implemented).
6. First real production art package.

**Important:** The ChatGPT discussion outlined these steps, but there is no verified implementation status for Steps 1–5. Codex must inspect the actual repository and report what is done before proceeding.

### Step 6, detailed sequence

- **6A** Freeze all eight approved original reference images in `assets/references/heroine-v1/detailed/` (use corrected NE/NW).
- **6B** Build a non-destructive reference-import pipeline: audit dimensions/alpha/green-background variation; create contact sheet; remove background and baked labels from new **staging copies** while preserving delicate hair strands; estimate bounds/foot baseline; mark candidate anatomy anchors for manual review; create checkerboard and green preview images; keep originals immutable.
- **6C** Author genuinely modular body/head, front/rear hair and clothing assets. Begin with the long hairstyle on S and N, then complete all eight; do not mistake green-screen removal for asset decomposition. Hidden head/body anatomy under hair/clothing needs new authored artwork.
- **6D** Integrate semantic material/shade maps for hair palette swapping and test palette isolation.
- **6E** Produce independently authored 128×192 pixel counterparts using the same semantic asset IDs.

### Immediate next Codex assignment (if the previous foundation is functional)

Read `AGENTS.md`, `docs/architecture.md`, `docs/asset-spec.md`, `docs/mvp.md` and this context. Audit `assets/references/heroine-v1/detailed/` for `{N,NE,E,SE,S,SW,W,NW}.png`. If files are missing, report them and stop. Do not edit originals. Implement Step 6A–6B: validate, report alpha/background/bounds, generate a contact sheet, carefully create transparent labeled-free staging copies, and produce automated QA + documentation. Do not generate modular parts, invent occluded anatomy, mirror assets or auto-publish. Run and report relevant tests. Stop for visual approval.

## 7. Asset authoring and quality requirements

### Verified implementation and approved next increment — 2026-10-09

Repository verification established functional recipe/core, asset planning, both
placeholder renderers and the interactive editor. Steps 6A–6B passed source-hash,
native output and repeatability checks; all 32 existing Vitest tests and six
browser workflows passed. The user then approved proceeding with Step 6C.

The first Step 6C increment authors S/N long silver-lilac hair as versioned front
and rear components, with review inputs in
`assets/source/heroine-v1/hair/long-waves-v1/` and generated inspection outputs in
`assets/staging/heroine-v1/hair/long-waves-v1/`. N's front fringe is explicitly
hidden. See `docs/modular-hair.md` for provenance, provisional attachments and
review criteria. Source/import artwork stays immutable. The standing-reference
draft does not certify T-pose, head/body fit, candidate anatomy or the outstanding
48 px baseline spread. The user approved the S/N hair design and requested a local commit followed by
the next increment. Source/cleaned hashes are pinned in `review-v1.json`; T-pose
and head/body fit remain unverified. Continue with independently authored E/W;
Step 6C must be reviewed before Step 6D. No production pixel art is derived.

The next increment adds independent E/W front/rear hair authoring and
`pnpm hair:review:profiles`, with separate pinned authoring configuration and
staging outputs. The user approved the E/W standing-reference hair design on
2026-10-09 and requested a local commit; `profiles-review-v1.json` pins the accepted
config, source and cleaned hashes. S/N approval and source artwork are preserved.
At that point, all diagonal facings, modular body/head/clothing and a production
T-pose rig remained unfinished. Profile authoring did not complete Step 6C.

The next increment authored independent SE/SW front/rear drafts. The user
rejected revision-1/2 assemblies because independently generated pieces lost
shared scale and perspective. The user explicitly selected manually drawn masks
for revision 3: each facing's own coherent head-and-hair study is partitioned into
front hair, rear hair and visible review-head pixels. Exact reconstruction is
required, but does not prove complete reference coverage or hidden anatomy.

On 2026-10-10 the user identified omitted far-side curls, character-left in SE
(screen-right) and character-right in SW (screen-left). Revision 4 restores those
visible portions from each facing's own transparent reference through native
manual masks, preserving all prior study pixels. The review command selects
`front-diagonals-authoring-v4.json` and verifies restored reference RGBA in both
the master and rear layer. Body occlusion still leaves gaps needing authored
connecting hair. The user approved this visible draft and requested a local
commit; `front-diagonals-review-v1.json` pins the accepted config, layers, masters,
masks and partial review heads. Full head anatomy, concealed roots, independent
head/body/T-pose fit, NE/NW, publication and final Step 6C approval remain pending.
Step 6D has not begun.

The user then requested repository cleanup and lowercase kebab-case filenames
in `docs/`. All documentation references follow the renamed paths. Rejected
SE/SW revision-1/2 working files and superseded revision-3 partitions were removed;
historical source evidence remains in Git at `d2ec13f`. Current approved sources,
configurations, approval records, reference imagery and revision-3 master inputs
needed to reproduce/test the accepted restoration remain unchanged. Old preview
iterations and generated test/export artifacts were also removed. Cleanup does
not authorize advancing art authoring or the next milestone.

After cleanup commit `e850c1c`, the user requested the next increment and asked
to avoid pointless unit tests. The next Step 6C increment completes SE/SW
concealed rear backing and far-side connections as revision-5 candidates, using
each facing's own imagegen rear edit and explicit manual masks. Approved source
files stay unchanged. Initial additive-only joins retained old extraction cuts;
small seam polygons therefore permit repairs in the new rear version only.
Front/head sources remain revision 4. The review verifies the accepted baseline
partition, exact pixels outside completion masks, generated pixels inside them,
retained visible reference coverage, native depth and deterministic outputs.
One additional case extends the existing public review integration workflow;
no new helper/enum unit suite is added. Separate staging at `front-diagonals-v5/`
keeps the approved visible revision-4 inspection intact. The user approved revision 5 with “approved. commit and then continue”; `front-diagonals-review-v2.json` records its scope and hashes. Full anatomy/T-pose fit, NE/NW and final Step 6C review
remain unfinished. Step 6D does not advance.

### NE/NW rear-hair review increment — 2026-10-10

The user approved SE/SW revision-5 rear completion and requested committing
then continuing. Local commit `3b46839` records that approval; earlier approvals
and artwork remain unchanged. Independent NE/NW rear-crown/drape candidates
are now authored from their own references with explicit hidden front fringe.
Rejected enlarged generations were not retained in the repository; selected
raw sources use the existing alpha cleanup without geometric transforms.
`pnpm hair:review:back-diagonals` prepares a separate two-row comparison in
ignored staging. The existing public integration workflow is extended for
determinism, native geometry, hidden fringe and rejection of reused facing art.
Complete independent anatomy/T-pose fit and
full Step 6C review remain required. Step 6D remains outside this increment.

### NW shoulder-curl restoration and NE approval — 2026-10-10

The user accepted NE and reported a missing NW shoulder lock. NE-only design
approval is recorded in `back-diagonals-ne-review-v1.json`; its artwork and
frame remain unchanged. NW revision 2 copies the missing visible curl from its
own reference using the previously authorized manual-mask method, preserving
native coordinates and all pixels outside the selection. The initial NW source
is retained as required derivation evidence. Authoring script/mask/provenance
are in `inputs/back-diagonals-v2/`. The updated comparison remains at
`back-diagonals/overview.png`; corrected NW was approved with “approved. commit and continue to next step”. `back-diagonals-review-v1.json` pins the pair config/layers and restoration provenance. This does not
advance Step 6C anatomy/production fit or Step 6D.

### Approved back-diagonal hair and S/N anatomy increment — 2026-10-10

The user approved corrected NW and requested a local commit followed by
the next increment. `back-diagonals-review-v1.json` pins both rear-hair
facings and restoration provenance; commit `464f9e4` records that approval.
All eight hair designs are approved at standing-reference design scope.

The next small Step 6C increment authors independent bald S/N soft-oval
head/neck skin bases, partitions native source pixels and prepares offline
comparisons with the unchanged accepted hair. S omits eyes/brows/mouth for
future interchangeable facial parts; N has no facial features. Human ears
remain embedded in these first head bases and need subsequent separation
for ear variants. Synthetic native placement guides are framing aids only.
The new complete scalp/jaw/nape anatomy itself requires visual approval.

`pnpm head:review` prepares native head/neck layers, exact reconstructed
studies, close-up/full-canvas comparisons and hashed QA. One public artwork
integration workflow checks reconstruction, approved hair, real render-order
overlap, deterministic export and meaningful failure boundaries.

The comparison exposes S fringe coverage of the nose and intended eye area
at the reference head position. S fit is not ready; review head geometry
and author a versioned fringe-fit correction. N posterior scalp coverage is
visually plausible but still unapproved. Six other head facings, facial/ear
layers, body/clothing and production T-pose fit remain unfinished. See
`docs/modular-head.md`. This does not complete Step 6C or advance Step 6D.

### S fit correction after anatomy-draft checkpoint — 2026-10-10

The user questioned S alignment, then approved a local commit and continuation.
Commit `2474fde` preserves the initial S/N anatomy draft and review workflow.
Equal approximate anchor coordinates did not establish matching facial geometry.
The accepted S front covered the nose/eye area; its rear also carried oversized
temple locks. Revision 2 therefore fits a new S front/rear pair while preserving
all approved source images, head/neck parts and N output. The front is selected
from S's own reference with native manual masks; the rear is newly authored with
built-in imagegen and clipped to the native reference silhouette above y290.
The revision-2 review selects `authoring-v2.json`; `head:review:v1`
reproduces the historical mismatch separately. Four exposed facial samples and
exact native source ownership are regression boundaries, not anatomical proof.
The user approved this fit candidate with “approved. commit and continue”.
`review-fit-v2.json` pins its config, sources and reviewed composition; the
known temple seams are the next versioned repair. Step 6C remains unfinished and
Step 6D has not begun. See `docs/modular-head.md` for retained provenance.

### S temple and left-ear foreground correction — 2026-10-10

Commit `bde4c80` freezes the approved revision-2 fit candidate. The next
increment retains a new shared S seam study and manually traced local masks.
During review, the user identified missing foreground hair at S's left ear
(screen-right): the original ear exclusion removed part of a crossing strand.
The initial narrow revision-3 restoration failed visual review. The user then
identified that the hair lies both in front of and behind the ear. Revised local
ownership keeps the crossing bang in front and places the side lock behind the
complete unchanged head/ear. S's own native reference supplies retained hair;
visible reference ear/skin is excluded. Neck-curl masks also clear skin-filled
holes, warm rims and a detached clavicle-outline fragment. Retained RGBA is
unchanged, with no blur or feathering. Independent ear layers remain unfinished.

At revision 3, `pnpm head:review` selected `authoring-v3.json`; `head:review:v2` reproduces
the approved baseline under separate staging/v2. The new comparison shows
reference / approved v2 fit / v3 candidate. Masks and exact pixel ownership
are verified, including unchanged anatomy, N and all pixels outside the local
repair areas. Local strand joins, revised ear depth and cleaned neck contours still require
human visual review. This increment does not complete Step 6C or advance 6D.

### S coherent native hair partition after rejected local patches — 2026-10-10

The user rejected the revised overview: hair strokes remained disjoint and
cheeks were cropped. Exact local source ownership and passing tests did not
establish a coherent fit. The cause was a composition of original-reference
fringe, independently authored rear hair and small shared-study patches whose
contours differed. Position changes alone could not repair those strokes.

Revision 4 uses the entire existing shared S drawing as the sole hair source,
not its local patches. The visible face/ear/neck context is excluded within a
bounded manual skin mask; one pale nose-highlight pixel and two detached
alpha-8 specks have explicit exclusions. The supposed black/purple background
in this raw study has zero alpha; it is not visible haze. Every retained RGBA
pixel stays at its native coordinate. A posterior ear region places the side
lock behind the complete original head; the fringe/face-framing locks remain
in front. Lower drapes pass to the rear below the neck. Front and rear have
exact disjoint ownership and reconstruct one continuous hair master.

At revision 4, `pnpm head:review` selected `authoring-v4.json`; `head:review:v3` retains
historical rejected-patch reproduction separately. The current overview and
`inspection/S-coherent-partition.png` show the assembled fit and exact split.
Approved v2, all complete anatomy sources and N remain unchanged. A further
imagegen edit was rejected for changing native framing and is not retained.
The selected earlier prompt and manual derivation are recorded in
`prompts-coherent-v4.json`. The one existing integration workflow now checks
the coherent reconstruction, uncovered cheeks, posterior ear depth, unchanged
anatomy/N, deterministic exports and rejection of re-pinned forged hair.
No additional unit-test suite was introduced. Visual review and all remaining
Step 6C anatomy/body/T-pose work remain pending; Step 6D has not begun.

### Lower left-ear clipping in the coherent S fit — 2026-10-10

The user said the coherent partition looked fine at the moment, but the ear
was still clipped in the assembled overview. This is not approval of the
assembled anatomy or complete Step 6C. The cause was remaining foreground
side-lock pixels over the inner/lower ear: the rectangular posterior region
started at x584, while the complete ear/lobe extends farther inward.

Revision 5 changes only the native depth ownership. A contour-shaped inward
extension transfers 247 existing hair pixels from front to rear, including
173 pixels over head/ear skin. The complete revision-4 hair-only master remains
identical; no hair is cut, redrawn, recoloured or repositioned. Skin exclusion,
crown/fringe, neck curls, drapes, all original anatomy, approved sources and N
remain unchanged. `authoring-v5.json` pins the v4 ownership baseline;
`inputs/partition-ear-depth-v5.js` writes new parts/masks only.
`pnpm head:review` now selects v5; `head:review:v4` reproduces the earlier fit
in separate staging/v4. The current partition's complete-hair column is
unchanged; its front/rear columns reflect only the ear-depth transfer.

The existing single integration workflow checks real previously occluded
inner-ear/lobe pixels in the assembled fit, unchanged whole hair, localized
ownership changes, source preservation and repeatable exports. Review of the
updated ear and remaining Step 6C work is pending. No new unit-test suite or
Step 6D work was introduced.

### General approval of S fit with known hair noise — 2026-10-10

The user generally approved revision 5 and requested committing then
continuing, while noting residual noise in the hair. `review-fit-v5.json`
records this limited standing-reference checkpoint approval and the known
noise. Do not overwrite its source or interpret it as final production
anatomy/Step 6C acceptance. The next increment authors independent E/W bald
head/neck anatomy and compares each with its own approved profile hair.
S/N stay unchanged. Step 6D remains outside the authorized increment.

### Independent profile anatomy and hair-fit diagnostics — 2026-10-10

Local commit `11fe059` freezes the generally approved revision-5 S fit,
including known residual hair noise. The subsequent small Step 6C increment
authors separate E and W complete bald head/neck skin masters, using each
facing's own reference and independently drawn native placement guide.
`profiles-authoring-v1.json` pins those masters, exact head/neck partitions,
binary masks and the already approved profile hair. E faces screen-right and
W screen-left; neither is reflected or resampled. Complete scalp, cheek/jaw,
near ear and neck are authored anatomy candidates, not reference cutouts.
Near human ears remain embedded, facial features need separate layers, and
production T-pose/body compatibility remains unverified.

The initial profile review reproduced the reference / bare skin / existing
hair composition in `assets/staging/heroine-v1/head/soft-oval-v1/profiles/`.
The actual comparison confirms a fit failure: E's hair cap leaves scalp exposed,
and both front fringes overlap the nose. Earlier hair design approval did not
approve this head fit. No geometry shift, scalp clipping, contour collage or
fallback artwork conceals the discrepancy. Two attempted whole-hair imagegen
edits changed native framing and were rejected; exact prompts and input roles
are recorded in `profiles-fit-experiments-v1.json`, with no selected replacement
image or profile-fit revision 2. Review the bare anatomy first; then author a
versioned coherent same-facing hair correction that preserves its native frame.
The E/W assembled fit is unfinished. S/N approval and all approved hair sources
are unchanged. Four diagonal head facings, ear/facial layers, full body/clothing
and final Step 6C approval remain outstanding; Step 6D has not started.

### Profile visible-fit continuation — 2026-10-10

The user requested continuation while the profile increment was in progress.
Further whole-hair edits changed framing; full-character studies held the
native scale but contained nonzero-alpha coloured background and clothing
occlusion. A trial colour-assisted matte damaged strand outlines. All such
generated hair alternatives were rejected and removed from the repository;
`profiles-prompts-v2.json` retains exact prompts/input roles/rejection reasons.
Only the separately authored bald E/W anatomy masters are selected generations.

`profiles-authoring-v2.json` now fits the **visible** hair from each facing's
own clean native reference. Manual hair/curl, face/shoulder/body exclusion
regions and the bounded warm-skin guard create exact disjoint front/rear
parts from one reference per facing. Source RGBA and complete anatomy remain
unchanged; no global colour key, scaling, mirroring, shifted head or collaged
direction drawing is used. Ear-side locks go behind the complete ear; crown
and fringe go in front. Both eye/nose/chin sample sets remain hair-free, and
the inspected scalp samples have hair coverage. Manual mask edges, cheek/neck
transitions and ear placement still require visual review. This does not author
hair hidden by the standing guide body, so the complete reusable lower hair
and production T-pose/body fit remain unfinished.

`pnpm head:review:profiles` selects v2; `head:review:profiles:v1` reproduces the
original failed fit in `profiles/v1/`. Current profile staging contains 40 PNGs,
including independent coherent partitions and reference / old fit / current
fit comparisons. `profiles-fit-audit-v2.json` records measurements and remaining
limits with approval/completion flags false. The single added profile public
artwork workflow now checks both the original failure and revised facial/crown
exposure, exact reference ownership, anatomy/source preservation, actual depth,
repeatable exports and re-pinned forged-part rejection. No additional unit-test
cases or Step 6D work were introduced.

- Distinguish `assets/references/` (immutable source images), `assets/source/` (editable layered files), `assets/staging/` (unapproved outputs), `assets/detailed/` and `assets/pixel/` (approved published parts), `assets/manifests/` and `assets/qa/` (generated reports).
- Each modular part should declare a unique semantic ID, target, supported facings, compatible rig/body presets, image paths, attachment anchor, native offset, depth plane, visibility/occlusion, optional material/shade masks and requires/excludes.
- Layer order may vary with facing. Long hair usually needs rear and front components. Clothing should conform to genuine front/rear three-dimensional construction.
- Create transparent source parts and apply solid `#00FF00` / yellow direction text only in final preview/export.
- Verify dimensions, RGBA values, no overflow, foot baseline, direction correctness, sharp pixel eyes, fingers, legs and no unintended stray green pixels.
- Automated checks cannot fully verify dress anatomy, correct near/far limbs, hairstyle consistency or hidden facial features; retain human visual approval gates.

## 8. Codex operating rules

- Read actual repository files first and reuse working code.
- Work in small milestones; don't broaden scope or prematurely add complex features.
- Clearly distinguish proposed scripts from scripts already present.
- Do not claim tests passed without running them.
- Do not fabricate missing images or masks and do not modify approved reference images.
- Report exact missing input/asset files and ask for human approval when required.
- Keep documentation up to date as decisions are made, and retain the repo as the source of truth.

### Profile ear size and native placement correction — 2026-10-10

The user rejected the E/W ears as larger than the references and misaligned.
This is a visual failure despite the earlier face/scalp sample checks. The old
bald ear geometry was larger and higher, and the broad v2 posterior masks exposed
too much of those ears. Neither E/W anatomy nor their fit has been approved.

Revision 3 confines anatomy changes to local E/W ear masks. Each facing's
reference supplies visible ear RGBA at its original coordinates and size;
separate local built-in imagegen studies remove the old ear and provide bounded
concealed ear surfaces. All anatomy outside those masks, neck, anchors, S/N and
approved hair sources remain unchanged. The actual reference crossing fringe
stays in front instead of being moved behind the larger bald ear. The visible
matte contains no authored concealed strands behind the canonical ear, so zero
posterior overlap there is intentional, not a claim that hidden hair is complete.
One pale E ear-highlight pixel is assigned to skin instead of hair.

`head:review:profiles` selects `profiles-authoring-v3.json`; profile revisions
1 and 2 remain reproducible in separate staging. The overview compares reference,
corrected bare anatomy and actual layered fit; the fit comparison uses the
rejected v2 assembly as its baseline. Exact prompts/input roles/rejected studies
are recorded in `profiles-prompts-v3.json`; only selected native patches enter
parts. The existing profile integration workflow checks assembled reference ear
pixels and rejects unrelated anatomy edits even with re-pinned part hashes.
Concealed ear structure, mask transitions and residual hair noise require human
review. E/W remain unapproved. This does not complete Step6C or advance Step6D.

### E/W fit approval and next increment — 2026-10-10

The user approved the overall revision-3 E/W fit, acknowledging minor pixelation
in the left/W bare-ear overview; other inspected outputs were satisfactory.
`profiles-review-fit-v3.json` pins the accepted config, inputs and measured fits.
The accepted artwork remains unchanged. This is a standing-reference fit checkpoint,
not complete production anatomy or final Step 6C approval.

The next small Step 6C increment is independently authored SE/SW bald head and neck
bases, reviewed against their already approved front-diagonal hairstyle. Preserve
all accepted sources, inspect actual layered geometry, and retain manual masks and
prompt provenance. NE/NW heads, facial/ear variants, concealed hair, body/clothing,
material maps and production T-pose remain later work. Step 6D has not started.

### First SE/SW head/neck increment — 2026-10-10

After qualified E/W approval, commit `62847da` records the accepted profile fit
and minor left/W overview-ear pixelation. Step 6C continues with independently
authored SE/SW bald skin bases, manual native head/neck partitions, and actual
composition against the unchanged approved front-diagonal hairstyle.

The new front-diagonal anatomy is an unapproved candidate. Generation attempts
that zoomed or shifted whole studies were rejected. Local ear-erasure patches
remove displaced ears; bounded masks restore each approved design study's
visible ear pixels without transforms. Visible jaw/nose differences, concealed
ear rims and existing hair-mask seams/speckles need review and likely versioned
correction. Source-ownership checks and one focused public artwork workflow
cover this pair; automatic checks do not prove anatomical coherence.

NE/NW head anatomy, separate facial/ear variants, concealed hair, body/clothing,
material maps and production T-pose remain outstanding. No Step 6D work is
authorized by this incremental anatomy checkpoint.

### SE/SW ear, nose and hair-mask correction — 2026-10-10

The user rejected the first SE/SW anatomy overview: bare ears retained only
clipped visible fragments, the SE nose was displaced, and SW hair-mask fragments
appeared as white pixels over the face. Revision 2 authors complete independent
ear studies and corrects SE cheek/jaw geometry with local native masks. A narrow
same-facing approved-study nose mask retains the original SE landmark after
erasing the generated displaced nose and faint mouth. SW cleanup removes 237
manually selected front-hair face/neck fragment pixels while preserving all
other artwork and legitimate white highlights. Previous sources, approved hair
and rear layers are unchanged; neck layers are reused.

At this checkpoint the default front-diagonal head-review command prepared revision 2, with
reference/rejected/corrected comparisons. `head:review:front-diagonals:v1`
reproduces the earlier draft separately. Both corrections and complete-ear
anatomy remain pending visual approval. They do not complete Step 6C or authorize
Step 6D. Existing public artwork coverage is extended, with no new unit cases.

### SW nose and neck ownership follow-up — 2026-10-10

The user found SE much better but reported the same nose issue on SW, plus
white jaw fragments and neck cutouts. Revision 2 had left SW's profile-shaped
skin outline unchanged. Revision 3 uses a new local SW skin study, manually
traced native masks and 63 nose pixels from SW's own approved hair design.
The jaw contour comes from its canonical review skin. Canonical strand/rear
pixels and a separately authored local curl correct depth ownership around
the marked neck gap without globally removing white hair highlights.

SE's skin/hair layers and assembled fit remain byte-identical to revision 2.
Previous source imagery is preserved. The default front-diagonal head command
now selects revision 3; `head:review:front-diagonals:v2` retains the preceding
checkpoint. Comparisons show reference / revision 2 / revision 3. Exact prompts,
raw studies, masks and portable authoring scripts retain the derivation.

The existing SE/SW artwork integration case passed, with deterministic output,
native nose/neck regressions and rejection of edits outside the selected masks.
No additional unit cases were introduced. This candidate needs visual review
of anatomy and mask transitions; inherited edge noise is still outstanding.
Step 6C is unfinished and Step 6D remains unauthorized.
