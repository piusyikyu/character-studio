# MVP Plan — Female Character Studio

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


Current brow completion — 2026-10-14: the user authorized complete independent
brows and corrected hair ownership after questioning the bare-head differences.
A pending `face/reference-v1/brows-v1/` pack supplies six native authored brows for
E/SE/SW/W, with bounded front-hair corrections and actual fringe depth. S brows,
all eyes/anatomy, posterior fits, native anchors and prior approvals stay unchanged.
Review `face:review:brows` bare/assembled comparisons and the updated all-eight
sheets. This is not final Step 6C or production acceptance; Step 6D has not started.
See modular-face.md for provenance, selected masks and remaining review debt.

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

Current checks passed: validator typecheck/lint/build, all-eight CLI and the
existing all-eight head workflow (327.83 seconds), plus cleanup. All eight selected
fits match their individual approvals; 710 prior inputs and 222 current review
PNGs verify. Sheets remain unchanged. See modular-head.md for exact commands and
validation scope. Cross-facing human review remains pending before body authoring.

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

Current SE revision-6 update — 2026-10-13: the completed revision-5 left eye
is accepted as an individual feature. A pale strip in the original right-brow
extraction is locally trimmed in a new revision, retaining the accepted eye and
all other facial/hair sources. The default diagonal facial review and consolidated
head selector now use revision 6. Review `SE-brow-fit-comparison.png` before
approving this repair. Whole head-set consistency and final Step 6C remain open;
Step 6D has not started. See modular-face.md and `fit-audit-v6.json`.

Current SE revision-5 update — 2026-10-13: the user clarified that the far eye
must be independently authored in full, including parts covered by hair. Earlier
extraction-only revisions misunderstood this and are not approved. A retained
local imagegen study supplies a complete SE physical-left eye at native framing;
manual selection isolates it, and the retained foreground fringe draws above it.
Bare and assembled full-eye candidates need human approval. Nine other facial
features and seven other fits remain unchanged. Step 6C remains unfinished;
Step 6D has not started.


Current SE revision-4 update — 2026-10-13: revision 3 was rejected for changing
the reference eye shape. A local native contour restores the lower-left eye arc;
34 overlapping foreground pixels transfer to eye ownership in a new front-hair
revision. Both bare and assembled comparisons need visual approval. Other seven
fits, original approved sources and the near-eye cheek trim stay unchanged.
Consolidated SE selection is explicitly pending; Step 6C/production acceptance
remain incomplete and Step 6D has not started.


Current SE correction — 2026-10-13: the consolidated bare sheet exposed hair
inside the SE far/physical-left eye extraction. Facial revision 3 trims its native
alpha and restores the local strand/fringe to front-hair ownership. Nine other
facial layers, the near-eye cheek correction and seven other facings remain exact.
The consolidated review explicitly labels SE as a pending candidate; prior
approval records remain pinned to revision 2. Review bare/assembled SE eye
comparisons before continuing. Step 6C is unfinished; Step 6D has not started.


Current checkpoint update — 2026-10-13: commit `63ece36` records approved
N ear/root separation. Next `pnpm head:review:all` consolidates all eight selected
head/facial/ear/hair fits through retained source validators and pinned approvals.
Three native contact sheets in `head/assembly-v1/` show assembled heads, hair-free
anatomy/features and original references. All individual fit hashes remain exact;
no artwork changes, transforms or runtime publication. Cross-facing consistency
needs human review before body authoring; concealed diagonal brows and alternate-
hairstyle ear sizes remain review debt. Typecheck, lint, build/CLI and public
head-set/cleanup workflows pass (2 passed, 4 skipped; 270.26 seconds). Nine current
reviews are protected. Real body/clothing occlusion, concealed geometry, variants/
materials, production T-pose, independent pixel art and final Step 6C remain open.
Step 6D has not started. See modular-head.md and head/assembly-v1/fit-audit.json.


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


Current candidate update — 2026-10-13: commit `7cf808e` records approved N
full-back anatomy. Next `ears/human-v1/north-v1/authoring.json` separates both
native N ears/collars with locally authored ear-free scalp roots. Run
`pnpm ears:review:north`; review anatomy-overview column two for new contour,
shade and mask/skin transitions. Original human head and full posterior fit
reconstruct exactly; eyes/front fringe remain hidden. This candidate needs visual
approval. Typecheck, lint, build/CLI and focused N-ear/cleanup workflows pass
(2 passed, 4 skipped; 26.12 seconds). Eight current reviews are protected.
Alternate-hairstyle ear-size and body-occlusion review debt, concealed geometry,
variants/materials, full body/clothing, production poses, independent pixel art
and final Step 6C remain open. Step 6D has not started. See modular-ears.md.


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


Current review update — 2026-10-13: commit `af5a206` records approved NE/NW
ear/root separation. Next review unchanged N revision-1 anatomy independently with
`pnpm head:review:north`, using `authoring-v5.json`. Columns: reference / bare
skin / accepted-hair fit. Hair covers every head pixel; inspect the middle column
before ear separation. N remains unapproved with both ears embedded. No new art.
Typecheck, lint, build/CLI and expanded existing S/N plus cleanup workflows pass
(2 passed, 3 skipped; 74.91 seconds). Seven current reviews are protected.
Alternate-hairstyle ear-size/body-occlusion review debt and all remaining production
work stay open. Step 6C is unfinished; Step 6D has not started. See modular-head.md
and `head/soft-oval-v1/north-fit-audit-v1.json` for source/validation evidence.


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


Current candidate update — 2026-10-13: commit `8e3c16d` records qualified
SE/SW ear approval, with differing bare ear sizes retained as future alternate-
hairstyle review debt. The next independent NE/NW near-ear/root candidate selects
`ears/human-v1/back-diagonals-v1/authoring.json`; export with
`pnpm ears:review:back-diagonals`. Original human ears reconstruct the approved
posterior heads/hair fits exactly; new local ear-free roots with bounded native
alpha joins need visual review in anatomy-overview column two. Both hide frontal
features/fringe and far ears. Cleanup preserves six current reviews. Typecheck,
lint, build/CLI and focused ear/cleanup workflows pass (2 passed, 3 skipped).
N remains an unapproved draft; variants, concealed geometry, expressions/materials,
real body/clothing occlusion, production T-pose, independent pixel art and final
Step 6C remain open. Step 6D has not started. See modular-ears.md for the audit.


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


Current candidate update — 2026-10-13: commit `3dd1436` records approved
E/W ear/root revision 1. The next `ears/human-v1/front-diagonals-v1/authoring.json`
separates native SE/right and SW/left near ears over independently authored local
ear-free scalp contours. Source inspection shows the far ears hidden, so their
concealed anatomy remains unfinished. Human retention reconstructs accepted heads
and full facial/hair fits exactly, preserving native noses and body-occlusion
review debt. Run `pnpm ears:review:front-diagonals`; review anatomy column two
for new root geometry/joins. Visual approval is pending. Back-facing ears, hidden
surfaces, variants, N review, materials, body/clothing, T-pose, independent pixel
art and final Step 6C remain open. Step 6D has not started.


Current approval update — 2026-10-13: independent E/W ear/root revision 1
is approved in `ears/human-v1/profiles-v1/review-fit-v1.json`. The user requested
cleanup, a local commit and continued Step 6C work. Next prepare separate SE/SW
native ears/collars with locally authored ear-free root underlays and exact
approved human facial/head/hair reconstruction. New concealed skin needs visual
approval. Other facings/variants, hidden geometry, N review, materials, actual
body/clothing occlusion, production poses, pixel artwork and final Step 6C remain
open. Step 6D has not started; older pending-approval statements are historical.


Current candidate update — 2026-10-13: commit `2b267ff` records approved
E/W facial revision 1. The new `ears/human-v1/profiles-v1/authoring.json`
separates original E/W ears/collars over locally authored ear-free root RGBA,
retaining original head pixels/alpha outside interior masks. Human-specific
retention reconstructs approved heads and full facial/hair fits exactly. Run
`pnpm ears:review:profiles`; review column two of the anatomy overview for new
concealed skin and joins. The candidate needs visual approval. Other ear facings/
variants, hidden geometry, N review, materials, actual body/clothing occlusion,
production poses, pixel art and final Step 6C remain open. Step 6D has not started.


Current approval update — 2026-10-13: E/W facial revision 1 is approved in
`face/reference-v1/profiles-v1/review-fit-v1.json`. The user requested cleanup,
a local commit and the next Step 6C increment: separate native E/W human ears
over bounded, newly authored ear-free scalp/root skin while preserving accepted
facial/anatomy/hair fits. New concealed anatomy needs visual review. Complete
geometry, remaining ear facings/variants, N review, body/clothing occlusion,
production poses, independent pixel assets and final Step 6C remain outstanding.
Step 6D has not started; earlier selected-candidate statements are historical.

Current candidate update — 2026-10-13: local commit `61acfb7` records approved
SE/SW facial revision 2 after generated-data cleanup. The next independent
E/W facial candidate is `face/reference-v1/profiles-v1/authoring.json`; run
`pnpm face:review:profiles`. Each native eye/brow/mouth comes from its own profile
reference, with physical side and hidden far-side features explicit. Accepted
profile anatomy/hair and S/SE/SW sources remain unchanged. Human review of full
visible extraction, skin rims, placement and fringe depth is pending. Existing
body-occlusion, concealed geometry, variants/materials, N review, production
poses, pixel art and final Step 6C remain outstanding. Step 6D has not started.

Current approval update — 2026-10-13: the user approved the SE/SW facial revision-2
fit in `face/reference-v1/front-diagonals-v1/review-fit-v2.json` and requested
cleanup, a local commit and continued Step 6C work. Next separate independently
visible E/W facial components over accepted profile anatomy/hair revision 3.
This approval does not complete concealed geometry, variants/materials, body
occlusion, production poses, independent pixel artwork or Step 6C. Step 6D has
not started; previous selected-candidate/pending-approval statements are historical.

Current selection update — 2026-10-13: the SE/SW facial candidate received positive
feedback with a requested SE right-eye cheek-tint correction. The current
`face:review:front-diagonals` selects `front-diagonals-v1/authoring-v2.json`, trimming
only the broad under-eye reference skin patch with native mask coverage. Eye
detail, the other nine features, SW, S and approved anatomy/hair stay exact.
Review reference / v1 / v2 in `inspection/SE-cheek-fit-comparison.png`;
`face:review:front-diagonals:v1` reproduces the preceding candidate. Visual approval
of this correction and the existing Step 6C review debt remain pending. Step 6D
has not started. Earlier selections below are historical.

Current candidate update — 2026-10-13: commit `e590858` preserves approved S
revision 11. The next native SE/SW facial-layer candidate is in
`face/reference-v1/front-diagonals-v1/`; run `pnpm face:review:front-diagonals`.
Its same-facing reference features compose over exact approved diagonal head/
hair baselines. Human review of feature placement, skin rims and true fringe
occlusion is pending. Cleanup preserves both current facial reviews. This remains
Step 6C, with body-occlusion, hidden geometry, expressions/materials, production
poses and independent pixel art still outstanding. Step 6D has not started.

Current approval update — 2026-10-13: the user approved the S revision-11
facial/fringe fit in `face/reference-v1/review-fit-v11.json` and authorised
cleanup, a local commit and continued Step 6C work. Next prepare native SE/SW
facial layers over the approved front-diagonal head/hair fits. This does not
certify other facings, concealed geometry, expressions/materials, body occlusion,
production poses, independent pixel artwork or final Step 6C acceptance.
Step 6D has not started. Earlier selections and pending approvals are historical.

Current selection update — 2026-10-13: v10's right brow received positive
feedback, but its left brow appeared over the hair. `review-fit-v10.json` records
the remaining depth correction. `pnpm face:review` selects v11: both exact v10
brow curves retained beneath the original, fully restored front fringe. No new
artwork or layer movement. Review reference / v10 / v11;
`face:review:v10` rebuilds the prior candidate. Left-tail visual approval remains
pending. Step 6C/production review debt remain open; Step 6D has not started.
Earlier entries are historical.

Current selection update — 2026-10-13: v9 was rejected for a short left tail
with an end line and a thin right brow, pinned in `review-fit-v9.json`.
`pnpm face:review` selects v10: fuller native study bands plus a small foreground
hair ownership mask exposing the clean left tail. All approved source files are
preserved; actual front fit changes only at that junction. Head/ears/neck/rear
hair/features/folds stay exact. Review reference / rejected v9 / v10;
`face:review:v9` reproduces v9. Human approval is pending, Step 6C and production
review debt remain open, and Step 6D has not started. Earlier entries are historical.

Current selection update — 2026-10-13: revision 8 was rejected for a sharp right
brow transition and abrupt left tail, pinned in `review-fit-v8.json`.
`pnpm face:review` selects revision 9: a continuous native study right curve and
native reference left curve with independently authored soft tapered coverage.
Approved v5 anatomy/hair/features/folds remain exact. Review reference / rejected
v8 / v9; `face:review:v8` reproduces the preceding fit. Visual approval is pending;
Step 6C and production review debt remain open. Step 6D has not started.
Earlier selections below are historical.

Current selection update — 2026-10-13: revision 7 was rejected for lines from
reference fringe fragments crossing the brows. `review-fit-v7.json` records it.
`pnpm face:review` selects revision 8, which excludes those fragments and locally
reconstructs the two native junctions with masked study pixels. Approved v5
anatomy/hair and all other features/folds remain exact. Review reference / rejected
v7 / v8 in the current brow comparison. `face:review:v7` rebuilds the preceding
candidate. Visual approval is pending; Step 6C and all production review debt
remain open. Step 6D has not started. Earlier selections below are historical.

## Purpose
Validate an entire loop from editable character recipe to **two correct independent outputs**, using placeholder layered artwork before scaling up asset generation.

The 2026-10-13 [asset cleanup](asset-cleanup.md) groups offline source/staging
packs and removes regenerable caches. It changes no milestone acceptance:
Step 6C and revision-4 facial review remain unfinished; Step 6D has not started.

The subsequent revision-5 facial candidate corrects the flagged neck-side mask
strips with local S hair backing and bounded source ownership. `pnpm face:review`
selects v5 and `face:review:v4` retains v4. Head, ears and facial features are
unchanged; the new neck-edge comparison needs visual approval. This remains
Step 6C work. Complete eyebrows and later production anatomy are unfinished.

The user subsequently approved revision-5 S standing-reference fit, pinned in
`face/reference-v1/review-fit-v5.json`, and authorised continuing with eyebrows
after cleanup and a local commit. The current brow-labelled patches are upper
eyelid folds; the true reference eyebrow curves require separate native masks.
This approval does not complete Step 6C or advance Step 6D.

Commit `169bd1c` records that approval and cleanup. The subsequent revision-6
candidate separates visible native S purple brow curves and retains the original
pale patches as upper-eyelid folds. Approved head/ear/neck/hair and eye/mouth
pixels stay fixed. `pnpm face:review` selects v6; `face:review:v5` rebuilds the
approved checkpoint. Brow placement/contours/fringe overlap await visual approval;
concealed brows, other facings and production review debt remain open.

The user rejected v6's incomplete extraction: the right brow had a gap and the
left curve was shortened. Rejection is pinned in `review-fit-v6.json`. Revision 7
widens the native reference contours through both fringe junctions, preserving
approved anatomy/hair and eyelid folds. `pnpm face:review` selects v7 and
`face:review:v6` reproduces the rejected fit. Full visible curves/junctions need
human approval; no milestone acceptance or Step 6D progression is implied.

## MVP scope
- Target resolutions: detailed `1024x1536` in authored `tpose`; pixel `128x192` in authored `idle`.
- Facings: all eight `N, NE, E, SE, S, SW, W, NW` separately authored; no automatic mirroring.
- One female humanoid rig with two discrete body presets (covering different build/chest/height combinations).
- Human, elf, vampire ancestry traits; compatible hybrids with visible traits (e.g. pointed ears, fangs).
- Two hairstyles (short/long), two head shapes, two expressions (neutral/stern), independent eye colours.
- Skin/hair/eye palette swaps with fixed semantic shade roles.
- One outfit with correctly authored fit variants and logical front/back coverage.
- Live preview, direction switch, target switch, S/N comparison, working controls and compatibility warnings.
- Exports: eight detailed PNGs, eight pixel PNGs, 4×2 pixel sheet, CharacterRecipe JSON.

## Out of scope (intentionally)
- Procedural image generation from within the editor.
- Continuous chest/height/waist sliders, arbitrary image deformation or automatic garment fitting.
- Walking/combat animation, skeletal posing, large outfit inventory.
- Full furry/beast/dragonborn/angel/devil/spirit anatomy families.
- Backend, authentication, user accounts or database.

## Milestones and acceptance tests

### 0 — Workspace scaffold
- [ ] WSL2 + Node24 + pnpm workspace operates under `/home`.
- [ ] `apps/studio` boots in Windows browser via WSL localhost.
- [ ] Root build, typecheck, lint and test scripts exist and pass (or missing dependencies are documented).
- [ ] `AGENTS.md` and docs are present and used by Codex.

### 1 — Character core
- [x] Versioned CharacterRecipe and Zod runtime parser.
- [x] Deterministic default/seeded random character generation.
- [x] Valid and invalid trait/body/outfit combinations tested.
- [x] JSON round-trip preserves appearance and schema version.
- [x] Core imports neither React nor PixiJS.

Implemented in `packages/core`; see its README for the version-1 contract, discrete
anatomy presets, composable trait rules, deterministic seed contract and six example
recipes. Placeholder renderers are implemented in milestone 3; migration of the
studio now uses these contracts in milestone 4.

### 2 — Asset registry + RenderPlan
- [x] Manifest parser and indexed lookups by ID, target, pose, direction, body.
- [x] Native direction-specific anchors, render planes and occlusion metadata.
- [x] Both targets can resolve all eight directions from synthetic placeholder manifests.
- [x] Incomplete coverage causes explicit errors; nothing is silently mirrored or substituted.

Implemented in `packages/asset-registry` with shared RenderPlan schemas in core.
Synthetic fixtures describe fictional PNG references, not approved or renderable
artwork. Actual placeholder rendering is implemented in milestone 3. Production
PNG/alpha audits remain future work; see the registry README
for binding and source-inventory contracts.

### 3 — Render pipelines
- [x] Detailed renderer combines high-res placeholder layers at 1024×1536.
- [x] Pixel renderer composes native 128×192 integer pixels with no smoothing.
- [x] Green background and yellow label only appear in final export, never source layers.
- [x] Palette changes are isolated to the intended material.
- [x] Identical recipe/catalog/export choices produce identical pixel hashes.
- [x] 4×2 pixel sheet exports as exactly 512×384 with correct direction order.

Implemented with separately authored geometric placeholder cells and real-browser
renderer tests. The standalone read-only demo and export procedure are documented
in `tools/render-demo/README.md`. Placeholders require visual review; production
artwork remains a future milestone; editor controls are implemented in milestone 4. Pixel byte equality is tested
directly, stronger than comparing hashes; detailed GPU alpha rounding can vary by
device even though repeated exports are stable in the tested browser.

### 4 — Studio UI
- [x] Controls modify shared recipe; both preview targets update accordingly.
- [x] Eight-direction selector + S/N compare mode.
- [x] Character JSON save/load; PNG exports; compatibility warnings.
- [x] Undo/redo for recipe edits; no inert buttons.
- [x] Playwright smoke tests run in WSL.

Implemented in `apps/studio`; see its README for controls, local presets, pinned
JSON, deterministic seed generation and native PNG/sheet export. Two editor API
workflows and four real-browser interaction workflows cover history, save/load,
exports and asset failure recovery. Build/height/chest remain linked discrete
presets; one starter outfit is selected automatically with its correct body fit.
The editor operates on the temporary geometric catalog, not approved artwork.

### 5 — First approved art package
- [ ] One authored/approved female base for detailed and pixel targets.
- [ ] Matching 8-facing head/hair/face/body/outfit assets.
- [ ] QA check: N/NE/NW hide eyes; facing axes match feet and head.
- [ ] QA check: back skirt/dress geometry truly differs from front where appropriate.
- [ ] QA check: clean pixel edges, no hanging/rhombus accessories, no bounds crossing.

#### Reference preparation — Steps 6A–6B

- [x] Validate the approved eight-direction heroine-v1 detailed reference files and preserve source hashes.
- [x] Produce native transparent full-character staging, contact sheet and checker/green inspection previews.
- [x] Record background/alpha/bounds/baseline measurements and versioned candidate anchors.
- [x] Add repeatable import/export and source-preservation workflow tests.
- [ ] Human review of matte edges, uncertain regions, anchors and baseline inconsistency.
- [ ] Step 6C: All eight hair designs approved; S/N anatomy draft and revision-2 S fit checkpoint committed. Revision-3 local patches failed visual review. Revision-4 coherent hair looks acceptable, but assembled ear clipping was rejected. Revision-5 fit generally approved with known hair noise and committed as `11fe059`. Independent E/W head/neck skin candidates and native masks await review. Profile-fit revision 1 exposes original scalp/nose defects; revision 2 fits visible same-facing reference hair with sampled facial exposure and ear depth. The user rejected profile ear size/placement; revision 3 locally restores visible reference ear pixels and bounded concealed anatomy with corrected fringe ownership. Revision-3 E/W standing-reference fit is now approved with minor left/W overview-ear pixelation acknowledged in `profiles-review-fit-v3.json`. Independent SE/SW head/neck revision 1 was rejected for clipped bare ears, a displaced SE nose and SW white mask fragments. Revision 2 supplies complete ear studies, local SE face/native nose repair and bounded SW front-hair cleanup. The user found SE much better but rejected SW's remaining nose offset and jaw/neck cutouts. Revision 3 preserves SE's fit and corrects SW with native nose/jaw ownership and a local authored curl, pending visual approval. Hair-mask edges and complete production anatomy remain unresolved. Concealed lower hair, four diagonal heads, full body/clothing anatomy and production fit remain unfinished.

On 2026-10-12 the user generally approved SE/SW head-fit revision 3 while flagging
abrupt SW neck hair. Revision 4 clears 157 duplicate foreground pixels already
retained behind skin in the rear. Anatomy and SE remain unchanged; the local
correction was then approved for now, with the broader abrupt neck/shoulder hair
starts expected to be covered by the future body. That body occlusion must be
verified with actual same-facing body/clothing layers in a later increment; it
has not yet been demonstrated. Local commit `a9b2aa1` records that approval.
Independent NE/NW posterior head/neck revision-1 candidates now have native
partitions and approved rear-hair comparisons. The user approved this NE/NW
standing-reference checkpoint in `back-diagonals-review-fit-v1.json`. Both hide
eyes/frontal fringe. All eight facings have anatomy drafts; N remains unapproved,
and complete production anatomy is still unfinished. Commit `1525979` records
NE/NW approval. The next S human-ear separation now has native ear/attachment
patches, authored concealed root skin and a human-specific retention mask. The
accepted head/hair assembly remains exact; the new ear-free anatomy and local
joins await review. Other ear facings/ancestry variants and facial features remain
unfinished; see [modular-ears.md](modular-ears.md).
The user then rejected the inherited S ear size and requested a correction.
Separate-ear revision 2 locally authors narrower ears with higher lobes and
retains the concealed skin and all accepted head/neck/hair sources. The new
reference/baseline/candidate comparison awaits visual approval; revision 1 remains
available through `pnpm ears:review:v1`. Exact preservation of the old fit did
not establish anatomically correct ear proportions.
The user has now approved keeping revision 2's smaller S ear size; approval is
pinned in `ears/human-v1/review-fit-v2.json`. Original larger ears remain available
as a potential future authored design option. Ear-size controls and runtime
contract changes are not implemented. The next bounded increment separates and
reviews S eyes/brows/mouth over the approved ear/head/hair assembly.
Commit `545526a` records the ear approval. The S facial candidate now has five
native reference-owned feature layers/masks and a repeatable `pnpm face:review`
workflow over the approved ears. It awaits visual approval; concealed feature
surfaces, independent expressions, iris materials and other facings remain open.
See [modular-face.md](modular-face.md).
The user rejected the first S facial fit for incorrect eye position. Revision 2
now locally authors S eyes/brows for the current head while preserving approved
anatomy/hair and the original mouth. The native comparison and bare assembly
await visual approval; geometry, brow colour and joins also need review.
Revision 2 was then rejected because the underlying face was broader/heavier
than the reference. Separate-face revision 3 now authors slimmer local cheek/jaw
skin, restores original reference eyes/brows/mouth/nose, retains the current ear
geometry with adapted collars, and repairs local root/upper-neck joins. Existing
approved sources remain unchanged. The new face-size fit awaits human approval.
The user then flagged cheek/hair gaps and requested direct anatomy/reference
overlays. Native 50%/contour overlays, an interactive opacity viewer and gap
diagnostics now support that review without changing the candidate artwork.
The chin is one alignment landmark, not a fixed rotation pivot. The offline
viewer supports rotation/translation and fitting marked chin/jaw pairs together;
screen-right contour mismatch remains an open review item after registration.
The user's latest −5°/X−0.245/Y−2.945 inspection gives a good-looking jaw;
character-left/screen-right ear sizing still needs local review. The three
compared registrations are retained in the viewer, with native artwork unchanged.
Sampled gaps correspond to missing reference hair coverage. Anatomy verification
and a bounded same-facing hair-fit repair remain pending.
This is not final Step 6C acceptance and does not advance Step 6D.

On 2026-10-13 the user authorised separate-face revision 4: new local S jaw/neck
anatomy guided by the reviewed registration, a smaller complete character-left
ear with visible native reference ownership, and bounded neck-skin/front/rear-hair
corrections. Native right-ear and original facial features and all earlier sources
remain intact. `pnpm face:review` selects v4; `face:review:v3` retains the preceding
candidate. Current anatomy/reference inspection starts at zero rotation/offset.
Both bounded cheek-gap diagnostics report zero. The new actual-layer comparison
awaits visual approval of anatomy, ear roots, joins and hair transitions; automated
coverage checks do not certify the full hairstyle. Step 6C remains unfinished.

See [reference-import.md](reference-import.md). The approved sources are flattened
standing illustrations, including the approved NE/NW dress corrections. Staging
does not satisfy modular-layer or detailed T-pose approval, and no production
pixel assets have been authored. The initial foot-baseline audit flags a 48 px
spread; original geometry remains unchanged.

The user approved proceeding after the verified 6A–6B audit on 2026-10-09.
The initial Step 6C increment is three separately authored S/N hair draft layers,
explicit N fringe invisibility, provisional native origins and deterministic
inspection tooling. See [modular-hair.md](modular-hair.md). This is not approval
of candidate anatomy or a completed art package. Remaining facings, body/head,
clothing and the T-pose rig are unfinished; Steps 6D–6E have not begun.

## Development guidance for Codex
Implement each milestone as a separate task and stop after test/verification. Favor synthetic coloured shapes in early renderer tests over premature illustration generation. Add snapshot/golden-image tests for the pixel pipeline and manual S/N review at each art approval gate.

Suggested sequence for VS Code Codex prompts:
1. `Read AGENTS.md and docs/*.md. Audit the scaffold against MVP milestone 0; fix setup gaps only.`
2. `Implement MVP milestone 1 in packages/core with tests; do not render images.`
3. `Implement MVP milestone 2 asset registry and RenderPlan with synthetic manifests.`
4. `Implement MVP milestone 3 independently for detailed and pixel renderers; test outputs.`
5. `Implement MVP milestone 4 studio controls and export UX; use existing engines.`
6. `Help prepare the first modular asset pack for human review, without overwriting approved art.`
