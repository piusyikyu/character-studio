# Step 6C — First S body anatomy study

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

Revision-6 validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration build and current/historical-v5 CLI exports passed. Existing body/cleanup workflows passed (2 passed, 5 unrelated head workflows skipped; 62.39 seconds), including actual plane composition, the three marked spill samples now matching underlying anatomy, unchanged checked native strand highlights, exact qualified body/neck, immutable historical baselines, deterministic output and rejection of re-pinned foreign body/spill-mask edits. All 817 preceding source/reference hashes and mtimes remain unchanged, excluding the intentional source README edit. Three selected authoring outputs replay byte-for-byte in scratch; six current PNG hashes and three accepted head sheets verify. The mask selects 228 native pixels; 228 front and 225 rear pixels change, with zero changes outside the selection. Full app build and browser E2E were not rerun. This completes the requested bounded correction pass, while visual review, other layering/asset work and production geometry remain open. No commit was made.

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

Revision-5 validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration build and current/historical-v4 CLI exports passed. The existing body/cleanup workflows passed (2 passed, 5 unrelated head workflows skipped; 50.18 seconds), covering actual plane composition, exact qualified body/neck preservation, fractional curl-mask coverage, unchanged hair outside the local region, historical v1/v2/v3 goldens, qualified-v4 comparison, deterministic exports, immutable inputs and rejection of re-pinned body/foreign curl-mask edits. All 807 preceding source/reference hashes and mtimes remain exact, excluding the intentional source README edit. Four selected source outputs replay byte-for-byte in scratch; six current PNGs and three accepted head sheets verify. The two hair planes each change at the same 324 local native pixels. Full app build and browser E2E were not rerun. Current curl-edge approval remains pending and no commit was made.

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

Revision-4 validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration build and current/historical-v3 CLI exports passed. Existing body/cleanup workflows passed (2 passed, 5 unrelated head workflows skipped; 39.56 seconds). They verify actual native plane composition, unchanged alpha silhouettes and body proportions, unchanged head/body outside the neck mask, v1/v2/v3 historical goldens, deterministic output, immutable sources and rejection of re-pinned foreign body/neck-mask pixels. All 796 preceding source/reference hashes and mtimes remain exact, excluding the intentional source README edit. Four selected authoring outputs replay byte-for-byte in scratch; five current preview hashes and three accepted head sheets verify. Full app build and browser E2E were not rerun. Local shading and remaining anatomy remain subject to human review; no commit was made.

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

Revision-3 validation: validator typecheck, root lint (zero warnings), ESM/declaration build and current/historical v2/v1 CLI exports passed. Existing body/cleanup workflows passed (2 passed, 5 unrelated head workflows skipped; 32.02 seconds), covering actual plane composition, protected face/skull, retired standing clavicle ownership, raised native shoulder samples, unchanged outside-joint body pixels, historical goldens, deterministic output and rejection of re-pinned foreign body/hair masks. All 779 pre-repair source/reference hashes and mtimes remain exact; the source README text is intentionally updated. Ten authoring outputs replay byte-for-byte in scratch; five current PNGs and three approved head sheets verify. No full application build or browser E2E was rerun. The earlier interrupted test attempt and complete rerun are recorded in fit-audit-v3.json. This new candidate remains uncommitted and needs human review.


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


## Revision-1 history — 2026-10-14

Local commit `5cdf0bb` records the approved complete brows and qualified all-eight
standing-reference head checkpoint. The user authorized continuing within Step 6C.
This new S-only study begins body authoring; production anatomy and final Step 6C
remain unfinished. Step 6D has not started.

`assets/source/heroine-v1/body/reference-v1/authoring.json` pins a native
1024×1536 independently generated adult body study, its manually drawn ownership
masks, the exact accepted S head/neck guide, current head approval/selection,
existing front/rear hair and same-facing reference. The complete prompt is saved
in `prompts.json`; generation used built-in imagegen. All selected files are local.

The body adapts the standing reference to a T-pose study. Bare arms, legs and feet
are visible; an opaque neutral grey underlayer covers the torso/pelvis. This is a
proportion and attachment study, not completed concealed skin or the starter
outfit. No body preset, production rig anchors or material maps are certified.
The generated head is discarded. Approved head/neck/face/ear and hair source
pixels remain unchanged, with no shifts, scaling, rotation or mirroring.

The first coarse scratch silhouette clipped parts of the study's outline. The
selected manual body and independently traced hand envelopes receive a bounded
eight-native-pixel tolerance; original study alpha supplies the final contour.
A 4×4 coverage mask selects original RGB/alpha below y300. No colour key or global
white cleanup is used. Remaining study-alpha noise and mask transitions need
visual review. `partition-study.js` writes only new files; replay it in scratch,
never over existing source. `S-body-v1.png` remains one whole-body study layer;
separate torso/limb/underlayer geometry is a later increment.

## Review

```bash
pnpm body:review
```

Current staging is `assets/staging/heroine-v1/body/reference-v1/`:

- `overview.png`: same-facing standing reference / new anatomy with exact approved
  head and neck / actual retained hair plus new body. All three cells use the same
  native frame and coordinates; preview labels/checkerboard are export decoration.
- `fit/S-anatomy.png`, `fit/S.png`: native transparent compositions.
- `inspection/S-neck-shoulder-comparison.png`: native close comparison of the join.

The actual hair fit exposes an inherited hard horizontal foreground-hair band
at the neck/shoulder window. Current standing-reference hair is not certified for
this T-pose. Review body proportions in the anatomy column. A later bounded
ownership correction must preserve legitimate foreground curls and move only
appropriate concealed hair behind the actual body, as a new revision for review.
Do not fix the contact sheet by shifting its panels or overwrite accepted hair.

Review head/body proportions, skin/shadow matching, shoulders and the neck join,
chest/waist/hips, arm/elbow/palm/finger anatomy, legs/knees/feet and the barefoot
ground line. Fingertip margins and baseline are observed study measurements,
not accepted rig anchors. Do not infer cross-facing coverage from this S study.
The original SE/SW abrupt shoulder-hair starts must still be checked against
independently authored same-facing body/clothing. The known bare-ear size
mismatch remains an alternate-hairstyle obligation. Both are carried verbatim
from the accepted head checkpoint into current metadata.

All metadata-declared current preview PNGs and metadata are protected by `assets:clean`.
Retained source inputs remain necessary; coarse unselected masks are outside the
source pack. Human approval of body anatomy and later real hair/body ownership
is required before expanding to other facings, fitted clothing or production fit.

Validation: asset-validator typecheck, root lint (zero warnings), ESM/declaration build and current body CLI passed. The existing native S body/composition and cleanup workflows passed (2 passed, 5 unrelated head workflows skipped; 11.65 seconds). They verify actual core-plane composition, complete retained native study ownership, unchanged head/neck above the selected body, foreground/rear overlap, deterministic output, immutable inputs, inherited review obligations and rejection of a re-pinned out-of-mask body edit. All 758 preceding source/reference inputs retain their hashes and mtimes; the intentional source README update is excluded. Both selected partition outputs replay byte-for-byte in scratch; four preview hashes and all three approved head sheets verify. Full app build and browser E2E were not rerun. See the local fit audit for corrected initial issues. This S candidate remains uncommitted and needs visual approval.

Current revision-2 review also includes
`inspection/S-body-fit-comparison.png`: reference / revision 1 / revision 2,
covering the neck, chest, abdomen and briefs at the same native coordinates.
`prompts-v2.json` records the built-in generation prompt and exact historical
edit-target reconstruction. `settings-v2.json`, new source layers/masks and
`partition-repair-v2.js` retain native ownership; replay only in scratch.
The first inspection retained overly broad curl blocks. The selected silhouettes
and curl openings follow the original native strokes, preserving highlights.
Human visual review still governs the local hair/body and torso transitions.

Revision-2 validation: validator typecheck, root lint (zero warnings), ESM/declaration build and current/historical CLI exports passed. The existing S body and cleanup workflows passed (2 passed, 5 unrelated head workflows skipped; 20.39 seconds), covering actual core-plane composition, corrected native band exposure, complete source ownership, outside-torso immutability, colour-preserving hair depth, deterministic output, pinned revision-1 export, inherited obligations and rejection of re-pinned foreign torso/hair-mask edits. All 767 previous source/reference hashes and mtimes remain unchanged; only the source README text is intentionally updated. Six selected repair PNGs replay byte-for-byte in scratch. All five current preview hashes and three approved head sheets verify. No full app build or browser E2E was rerun. Review the new torso, curl openings/tips and local transitions before approval. No commit was made.
