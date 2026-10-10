# Step 6C — S/N head and neck skin bases

After approving corrected NE/NW hair, the user requested a local commit and
the next increment. Commit `464f9e4` freezes that hair design approval. All
eight hair facings now have design approval; production hair/head/body fit
and Step 6C remain unfinished.

This increment authors independent S/N bald soft-oval head-and-neck skin
studies, then partitions them into reusable transparent head and neck layers.
It remains an offline, unpublished anatomy draft. No recipe, runtime catalog,
studio UI or pixel assets change. Step 6D has not begun.

## Source artwork and provenance

`assets/source/heroine-v1/head-soft-oval-v1/` contains:

- `S/N-master-v1.png`: selected raw built-in imagegen anatomy studies, each
  authored from its own facing.
- `S/N-head-v1.png` and `S/N-neck-v1.png`: native transparent parts with the
  exact normalized master pixels, without resampling or translation.
- `authoring-v1.json`: versioned schema, source/mask/guide hashes, upper-canvas
  envelopes, provisional attachments and pinned S/N hair config/approval.
- `prompts-v1.json`: selected prompts, edit/reference input roles and tool.
- `inputs/`: synthetic native placement guides, reproducible guide/partition
  scripts, binary ownership masks and partition provenance. The guides are
  not anatomy and are never included in the assembled skin or fit outputs.

Initial S generations enlarged the head or extended the jaw/neck too far.
They were rejected before staging. Using the small placement guide as the
edit target, with the original character only as skin-style reference,
produced an acceptable native envelope. Rejected images are not retained
in the repository. S and N are independently authored, never reflected.

The new concealed scalp, skull, jaw and nape are authored skin, rather than
extracted visible pixels with hair-shaped holes. S is a skin underlay with
subtle nose shading but no baked eyes, eyebrows, eyelashes or mouth. These
facial components need independent future assets. N is a posterior head
with no facial features or eyes. Human ears remain in the head bases for
this initial anatomy review; independently interchangeable ears and ancestry
variants remain unfinished.

At alpha threshold 8/255, S bounds are x424–599/y84–322 and N bounds
x424–599/y83–313, inclusive. Cleanup clears 1,683 and 1,718 near-zero alpha
pixels respectively, preserving the raw source studies. S's neck ends eight
pixels below the nominal y314 placement guide; validate the body join before
approving production fit. This is a recorded difference, not an automatic
position correction.

## Native partition and attachment behavior

`inputs/partition-master.js` verifies each master hash and writes new files
only. After the same <8/255 alpha cleanup used by hair review, every visible
master pixel has exactly one owner: head above S y278 / N y265, neck below
that facing's cut. Reconstructed head+neck RGBA must match the normalized
master exactly. The masks and recorded counts are checked through the review
API, not accepted merely because files exist.

Provisional head origins stay S `(511,169)` and N `(510,175)`, matching the
accepted hair studies. Neck origins are S `(511,292)` and N `(510,288)`.
Full-canvas attachment origins equal the corresponding provisional target
anchors, so every part's native top-left remains `(0,0)`. These are not an
approved rig or body-preset compatibility claim.

The disjoint head/neck cut preserves this static study. If a later body,
head shape or pose needs overlapping concealed attachment surfaces, those
surfaces need new versioned artwork. Do not transform this flattened study
into continuous deformation.

## Inspection and current fit findings

```bash
pnpm reference:import # If transparent reference staging is absent
pnpm head:review # Current revision-5 S ear-depth candidate and unchanged N
pnpm head:review:v1 # Reproduce the initial mismatch in separate staging/v1
pnpm head:review:v2 # Reproduce the approved baseline in separate staging/v2
pnpm head:review:v3 # Reproduce visually rejected local patches in staging/v3
pnpm head:review:v4 # Reproduce coherent hair with lower-ear clipping in staging/v4
```

`assets/staging/heroine-v1/head-soft-oval-v1/` is ignored and regenerated:

- `overview.png`: native cropped comparisons, reference / bare skin base /
  current candidate hair+head+neck, S above N. Each cell copies source x320/y40/
  width384/height440 without scaling. It is a close-up diagnostic, not a
  cropped production asset.
- `full-overview.png`: reduced inspection of complete native canvases, with
  full-resolution comparisons in `inspection/full-comparison/`.
- `layers/`, `masks/`, `master/`, `assembled/`, `fit/`: native transparent
  source parts, masks, normalized studies, exact reconstructions and fits.
- Checker/green inspection previews and `metadata.json`: source/output
  hashes, counts, bounds, alpha cleanup, hair overlaps and unfinished gates.

Internal layers contain neither backgrounds nor direction labels. Yellow
direction labels and checker/pure-green backgrounds are applied only in
inspection. Full green fit previews additionally carry `FIT DRAFT`.

**Initial revision-1 S fit:** the accepted frontal fringe covers the nose and
intended eye area at the reference-position head. Hair design approval did
not establish production head fit. This comparison is evidence of that
mismatch, not a successful fitted character. Review the head geometry, then
author a versioned fringe-fit correction without overwriting approved hair.
N covers the posterior scalp in the current composition; its scalp, ears,
nape and source shading still need human anatomy approval.

This increment does not include facial overlays, independent ear layers,
six other head facings, body/clothing anatomy, alternate head/body presets,
production T-pose fit or palette maps. Stop for review of the S/N anatomy
studies and fit findings before further art. Final Step 6C approval still
precedes Step 6D.

## Public workflow verification

One integration workflow exercises real tracked artwork and regenerates
S/N references from their immutable originals, without relying on local
staging. It checks exact partition reconstruction, native attachments,
source/cleaned approval hashes, facing-specific compositing, real overlap
order, independent unreflected masters, green/yellow inspection exports,
repeatable output bytes and unchanged input hashes/mtimes. It rejects a
re-pinned altered head partition, a translated attachment and output paths
inside approved source artwork. There are no helper/enum unit tests.

Human inspection remains necessary for complete skull/jaw/nape anatomy,
face-feature absence, ear shape, skin consistency and hair/body compatibility.
Automated reconstruction does not certify these anatomical properties.

Validation for this increment:

- `pnpm head:review`: passed the asset-tool JavaScript/declaration build and
  generated four native anatomy layers and 26 inspection/output PNGs.
- `pnpm --filter @character-studio/asset-validator typecheck`: passed.
- `pnpm lint`: passed workspace lint with zero warnings.
- `pnpm test tools/asset-validator/src/head-review.integration.test.ts`:
  one public workflow passed (49.98 seconds total).
- `git diff --check`: passed.
- Preservation audit: all 79 approved hair source/provenance files and all
  eight original character references retained their hashes; all 26 output
  hashes, the current config hash and 14 local documentation links verified.

Initial validation caught JSON provenance paths incorrectly constrained to
PNG filenames and a strict TypeScript tuple inference error. Both were
corrected before the successful runs above. The full application build and
browser E2E suite were not rerun for this offline asset-tool increment. The
S fringe mismatch remained unresolved in revision 1 despite passing tests.

## Revision 2 — native S hair/head fit correction

The user approved this fit candidate with “approved. commit and continue”.
`review-fit-v2.json` pins its config, source inputs and reviewed compositions.
Approval acknowledges the known temple seams; repair proceeds in a new version.
It does not certify a production head/rig or complete Step 6C.

The user approved committing the draft and continuing after the S mismatch
explanation. Local commit `2474fde` preserves the initial anatomy draft and
review tooling, including its unresolved fit evidence. This checkpoint does
not certify production anatomy or complete Step 6C.

The approximate `(511,169)` head anchor did not constrain actual skull, ear,
fringe or face geometry. Native comparison showed the initial front fringe
covering the nose at `(511,224)`, and the rear hair also contained oversized
temple locks. Changing only the front left two incompatible head openings.

`authoring-v2.json` therefore selects a separate S fit pair in the anatomy
source directory; the approved hair package, all head/neck parts and N remain
unchanged:

- `S-front-fit-v2.png`: 28,748 visible pixels from S's own immutable transparent
  reference, copied at their exact native coordinates. Hand-traced polygons
  define the crown/fringe/face-framing locks and exclude forehead/ear areas.
  An explicit warm-skin boundary exclusion removes skin touched by those
  contours; surviving RGBA is unchanged. Native mask, polygon settings,
  extraction script and provenance are in `inputs/`. No other facing is used.
- `S-rear-fit-master-v2.png`: a new built-in imagegen rear-hair study authored
  from the approved S rear, original S character and reference-native front
  candidate. `prompts-fit-v2.json` records roles and the complete prompt.
- `S-rear-fit-v2.png`: 278,449 native study pixels retained by its binary mask.
  Above y290, the rear is restricted to S's reference silhouette to prevent
  duplicate temple/crown protrusions. Below y290, every study pixel with alpha
  at least 8 is retained. Two explicit upper-crown rectangles remove 24
  detached pixels created by the silhouette cut; lower fine strands are
  preserved. No scaling, translation, reflection or recolouring
  occurs. The raw study, mask, partition script and provenance remain separate.

The review validates both derivations and composes the new S rear / unchanged
neck / unchanged head / new S front. Four manually recorded facial samples—
screen-left eye `(475,198)`, screen-right eye `(541,195)`, nose `(511,224)` and
chin `(513,266)`—must have zero front-hair alpha and visible head skin. These
samples are fit diagnostics, not new eyes/mouth artwork or a certified rig.

The revision-2 review writes its overview at the existing
review path and adds native front/rear fit layers and mask/checker inspection.
It produces 32 PNGs. `pnpm head:review:v1` regenerates the original fit under
`assets/staging/heroine-v1/head-soft-oval-v1/v1/` without modifying version-1
source/configuration. Regeneration calls neither imagegen nor extraction.

The existing single integration workflow also exercises this fit revision:
actual revision-1 nose obstruction, four exposed revision-2 facial samples,
native depth, unchanged anatomy/N output, exact reference/master ownership,
repeatability and rejection of a forged front even after re-pinning its hash
and provenance. No additional helper/unit-test suite was introduced.

The candidate needs visual review of head proportions, forehead/ear cut edges,
hair crown/drape transitions and lower curl length. Facial overlays, independent
ears, six other heads, full anatomy/body/clothing and production T-pose fit
remain unfinished. Do not interpret four clear sample points as complete visual
approval, publish the pair or begin Step 6D before the required review.

Current inspection exposes the nose and eye positions and eliminates the old
double temple-lock silhouette. The temple transitions still show hard mask
edges where reference-derived front hair meets authored rear hair. Review and
repair those contours in a subsequent version before production acceptance;
the current pair is a fit candidate, not a seamless finished character.

Revision-2 validation:

- `pnpm head:review`: asset-tool build/declarations and current CLI passed;
  all 32 output hashes and the current config hash independently verified.
- `pnpm --filter @character-studio/asset-validator typecheck` and `pnpm lint`:
  passed.
- `pnpm test tools/asset-validator/src/head-review.integration.test.ts`:
  one public workflow passed with frozen inputs (107.18 seconds total).
- `node tools/asset-validator/dist/head-review-cli.js --v1`: passed; all 26
  historical output hashes verified, with unchanged skin bases and identical N
  composition across both revisions.
- Preservation audit: all 105 existing original-reference, approved-hair and
  version-1 anatomy source/provenance files retained their SHA-256 hashes.
- `git diff --check` and local documentation links: passed.

Development test failures were corrected: the forged-source case initially
inherited a deliberately altered head fixture; a facial sample comparison
incorrectly expected the raw skin RGBA despite alpha 253 composing over rear
hair; and the preservation check caught a prompt-provenance edit made while
the test was running. The final rerun passed with frozen source inputs.
The full application build and browser E2E suite were not rerun for this offline
authoring/tool increment. Visual temple-edge repair and production anatomy
approval remain outstanding regardless of automated results.

## Revision 3 — temple repair, ear depth and neck masks

Local commit `bde4c80` records the user's approval of revision 2. Revision 3
is a new candidate; it preserves all approved source images and approval
records. It continues the current Step 6C increment without beginning 6D.

The selected built-in imagegen study `S-seam-study-master-v3.png` was edited
from the exact approved v2 composition, saved as `inputs/S-fit-edit-input-v2.png`,
with S's original character as hair-style reference. `prompts-seam-v3.json`
records the full prompt, input roles and hashes. The raw study includes head
context and invisible background RGB at zero alpha; revision 3 used only localized hair pixels.
It is never composited as a flattened character or published as a part.

`inputs/seam-repair-v3.json` contains two native temple polygons, a local
ear-depth region and its foreground-bang contour, plus two neck-curl cleanup
regions. The character's left ear is on screen-right. The script
`inputs/extract-seam-repair-v3.js` verifies baseline/reference inputs and writes
new v3 files only. For the temple repair, exposed baseline head/neck pixels and
warm study skin are protected; study pixels are retained only within S's own
reference silhouette. The front layer owns retained seam pixels and the rear
is cleared at those coordinates, avoiding doubled opacity. Approved front/rear
RGBA remains exact outside the repair masks.

The initial narrow ear-hole repair failed visual review. The user identified
that hair passes both in front of and behind the ear, so a single foreground
ownership mask was the wrong approach. The revised 6,360-pixel region separates
reference-native hair by depth: the full crossing bang belongs to the front,
and the side lock belongs to the rear. The complete unchanged head/ear renders
between them. Foreground and posterior hair are not both assigned the same
reference pixels. Warmer reference ear/skin pixels are excluded from hair;
concealed baseline rear backing is retained where the reference exposes skin.
The local red-minus-blue guard is at most 15, inside manually traced contours.
Independent ear layers remain unfinished.

Around the neck, two regions covering 11,232 pixels revise the visible front
curl contours without moving or smoothing their artwork. The same local colour
guard removes skin-filled curl holes and warm skin rims that the older check
missed. A hand-traced contour revision excludes a three-pixel detached clavicle
outline. Retained hair RGBA is copied exactly from S's reference. The baseline
rear stays unchanged there, except where ear-depth and front-curl masks overlap:
foreground ownership takes priority so reference hair is not duplicated.
No blur, feathering, resizing or recolouring is applied.

`authoring-v3.json` pins the approved v2 config/approval, raw study, settings,
masks and new fit pair. Review checks exact study/reference ownership, mask
coverage, exposed facial samples, complete unchanged anatomy, and preserved
pixels outside the masks. `fringeFitMeasurement` records the inherited v2
baseline; `seamRepairMeasurement` identifies the active v3 pair and restored
hair coverage over head pixels.

At revision 3, the review generated the overview plus
`inspection/S-seam-comparison.png`: native crops of reference / approved v2
fit / v3 candidate. It retains historical v2 derivation inspection and adds
v3 front/rear parts and seam/ear/neck masks. `head:review:v1` and `head:review:v2`
reproduce their historical fits separately. CLI regeneration calls neither
imagegen nor the extraction script.

At revision 3, the existing public artwork integration workflow repeated the v3
export rather than repeating each historical version. It also checks the real
restored foreground pixel at `(582,205)`, the posterior side lock at
`(596,211)` behind the complete ear, cleaned curl holes/rims/fragments,
complete anatomy/N preservation, native render order and rejection of a re-pinned alteration outside the local
masks. No additional unit-test suite was added.

Visual review remains required for local strand transitions, ear occlusion,
head anatomy and future body fit. Small patch joins remain visible at close
inspection; do not treat ownership/count checks as seamless production-art
approval. Further facings, facial/ear layers, full anatomy, production T-pose
and Step 6C acceptance remain outstanding.

Revision-3 validation:

- `pnpm head:review`: asset-tool JavaScript/declaration build and CLI passed;
  all 38 output hashes and the current config hash independently verified.
- `pnpm --filter @character-studio/asset-validator typecheck`: passed.
- `pnpm lint`: passed workspace lint with zero warnings.
- `pnpm test tools/asset-validator/src/head-review.integration.test.ts`:
  the single public artwork workflow passed with revised ear-depth and neck
  checks (127.56 seconds total).
- `node tools/asset-validator/dist/head-review-cli.js --v2`: passed; all 32
  historical output hashes and approved fit/fringe measurements reproduced.
- Preservation audit: all 118 baseline reference, approved hair, anatomy and
  revision-2 provenance files retained their SHA-256 hashes. The recorded N
  fit composition is unchanged, and the saved edit target equals the approved
  v2 S fit hash.
- The ear contours select 2,455 foreground and 3,098 posterior reference hair
  pixels before overlapping neck cleanup. Neck cleanup removes 612 previously
  retained non-hair pixels.
  All four facial samples remain clear.
- `git diff --check`: passed. Full application build and browser E2E were not
  rerun for this offline asset-tool correction.

Initial validation of the revised masks caught an ear/temple overlap in the
derivation script's rear ownership. Restoring baseline backing where reference
skin is excluded corrected it. The first integration run sampled an empty
corner of the detached fragment; the regression now samples its actual pixel
at `(448,297)`. The successful checks above include those corrections.

## Revision 4 — one continuous S hair drawing

The user rejected revision 3's overview because strokes were disjoint and
cheeks looked cropped. The passing pixel-ownership checks did not establish
visual coherence. Local reference/native-study patches had incompatible
contours; the next correction replaces the complete S hair pair as a new
version, rather than adjusting offsets or adding more patches.

`S-seam-study-master-v3.png` is reused as the single coherent hair source.
Its visible skin context is excluded using a bounded manual mask with a local
red-minus-blue threshold of 18. An isolated pale nose-highlight pixel and two
detached alpha-8 specks are explicitly excluded. The raw study's apparent
background/glow has zero alpha. Below alpha 8, RGBA is cleared to zero;
retained hair RGBA and native positions are exact. No reference-silhouette
clip, scaling, translation, mirroring, blending of hair sources or smoothing
is applied. A subsequent generated edit changed native framing and was
rejected without retaining it in the repository.

New files, without overwriting any earlier image or approval:

- `S-hair-coherent-master-v4.png`: the complete hair-only matte.
- `S-front-fit-v4.png` and `S-rear-fit-v4.png`: 49,268 foreground and 218,567
  posterior pixels, with exact disjoint ownership. They reconstruct the
  complete matte pixel-for-pixel, including continuous neck curls and drapes.
- `inputs/coherent-fit-v4.json`, two binary ownership masks and
  `inputs/partition-coherent-fit-v4.js`: bounded skin/ear regions, explicit
  exclusions and reproducible derivation. The script verifies the raw study
  hash and writes new files only.
- `authoring-v4.json`: pinned single source, complete master, parts, settings,
  masks, counts and approved-v2 anatomy baseline. It does not inherit the
  mixed-source v2/v3 hair pair for the current S composition.
- `prompts-coherent-v4.json`: the selected existing built-in imagegen prompt,
  input roles, raw source hash, selection reason and manual-mask processing.

The foreground contains the crown/fringe and face-framing locks. Within
x584–619/y200–269, the side lock goes behind the complete head/ear. Hair below
y350 goes to the rear below the neck; those disjoint pieces meet at the same
native coordinates. They are not concealed surfaces for later deformation or
interchangeable production body fits. Complete original S/N anatomy and the
approved N composition are unchanged.

The current overview shows reference / unchanged skin base / coherent fit.
`inspection/S-coherent-partition.png` shows front / rear / complete hair matte.
The complete 1024×1536 canvases are retained; only diagnostic crops and the
full overview use inspection framing. Obsolete revision-3 generated images
were removed from the current staging root; historical sources remain, and
`head:review:v3` reproduces that rejected composition in a separate folder.

The same single public integration workflow now repeats revision 4 and
checks exact single-study reconstruction, native rendering order, exposed
cheek/nose samples, posterior ear overlap, unchanged anatomy/N and immutable
sources. It rejects a re-pinned altered hair pixel even when its file hash
has been updated. Revision-3 visual patch expectations are superseded; no
additional unit-test suite was added.

This is an unapproved standing-reference fit candidate. Review the complete
hair contour, ears, cheeks and neck at native resolution. Independent ears,
six head facings, facial layers, full body/clothing anatomy, other presets,
production T-pose fit and final Step 6C approval remain unfinished. Step 6D
has not started.

Revision-4 validation:

- `pnpm head:review`: asset-tool JavaScript/declaration build and CLI passed;
  32 current output PNGs generated with native S/N anatomy.
- `pnpm --filter @character-studio/asset-validator typecheck`: passed.
- `pnpm lint`: passed workspace lint with zero warnings.
- `pnpm test tools/asset-validator/src/head-review.integration.test.ts`:
  the existing single artwork workflow passed (110.31 seconds total).
- Preservation audit: all 129 pre-existing source files, including original
  references, approved hair, anatomy, v2 approvals and v3 derivation evidence,
  retain their SHA-256 hashes. N's fit hash remains
  `0a804f17591307be3752fcfdeb14905651aa6038ddc299a61049c2a86b473bdb`.
- The posterior ear region retains 195 hair pixels behind head/ear skin;
  four facial samples and the previously cropped cheek samples are exposed.
- `git diff --check`: passed. Full app build and browser E2E were not rerun
  for this offline asset-tool correction.

The first v4 review invocation rejected the JSON settings path because it
used the PNG-only source schema. The settings input now has its own explicit
JSON path; build, CLI and integration validation passed after that correction.
No anatomy source, approved imagery or earlier derivation was overwritten.

## Revision 5 — complete left-ear depth correction

The user found the coherent hair partition acceptable at the moment, but
rejected the assembled overview's clipped left ear. Its inner edge and lobe
were still obscured by foreground side-lock hair. The rectangular posterior
region began at x584, outside part of the complete ear silhouette. This was
a depth-ownership defect, not missing ear anatomy or a reason to redraw hair.

`inputs/coherent-fit-v5.json` replaces that rectangle with a contour-shaped
inward/lower extension. `inputs/partition-ear-depth-v5.js` transfers 247 exact
existing RGBA pixels from the v4 front to the rear; 173 overlap head/ear skin.
The complete head renders above that lock, exposing its inner edge and lobe.
No pixel is removed from the whole hair drawing, and no hair colour, position,
alpha, skin-exclusion mask, crown, neck curl or drape changes. Ownership outside
x568–583/y200–238 is unchanged. The full posterior region also retains the
unchanged older side-lock ownership to the right and below that extension.

New `S-front-fit-v5.png`, `S-rear-fit-v5.png`, binary ownership masks and
`authoring-v5.json` preserve every earlier source. Counts are 49,021 foreground
and 218,814 posterior pixels. The config pins `authoring-v4.json` and reuses
`S-hair-coherent-master-v4.png` with its exact hash. The review rejects a change
to the complete v4 master, raw study or skin/exclusion settings. Front/rear
still reconstruct that master exactly. No imagegen call was needed; the existing
selected source/prompt record remains `prompts-coherent-v4.json`.

`pnpm head:review` prepares the v5 overview and partition. The partition's
complete-hair column remains pixel-identical to v4; its front/rear columns
reflect the localized ownership correction. `pnpm head:review:v4` reproduces
the earlier clipped-ear fit separately. Complete S/N anatomy, approved hair,
all v2/v3/v4 sources and N's fit are unchanged. Review this ear in the assembled
image rather than inferring success from the hair-only reconstruction.

The existing single integration workflow now repeats v5 and checks actual
previously obscured pixels at `(580,220)`, `(578,225)`, `(575,228)` and
`(573,231)` against the rear-backed complete head. It also checks the localized
247-pixel ownership change and unchanged whole drawing, while retaining the
native reconstruction, cheek, source-preservation and forged-pixel boundaries.
No additional unit-test suite was added. Independent ear assets, remaining
facings and final Step 6C visual approval are still unfinished; 6D has not begun.

Revision-5 validation:

- `pnpm head:review`: asset-tool JavaScript/declaration build and CLI passed;
  all 32 current output PNG hashes and the current config hash verified.
- `pnpm --filter @character-studio/asset-validator typecheck`: passed.
- `pnpm lint`: passed workspace lint with zero warnings.
- `pnpm test tools/asset-validator/src/head-review.integration.test.ts`:
  the existing single workflow passed (110.42 seconds total).
- `node tools/asset-validator/dist/head-review-cli.js --v4`: passed;
  all 32 historical PNG hashes verified. The whole hair PNG is byte-identical
  between the historical and current staging. Only 173 assembled pixels differ,
  within x568–583/y219–236 around the inner ear/lobe.
- Preservation audit: all 138 pre-existing source/provenance files retain
  their SHA-256 hashes; N's fit retains its approved checkpoint hash.
- `git diff --check`: passed. Full app build and browser E2E were not rerun
  for this offline ownership correction.

The first integration run compared an encoded staging PNG against a source
PNG encoded with different codec options. That assertion was corrected to
compare decoded RGBA for artwork identity; source-file hashes remain checked
separately. The complete source hair never changed. The rerun passed.

## Revision-5 general approval and next increment

The user generally approved the current fit and requested a local commit and
continuation, while explicitly noting remaining noise in the hair.
`review-fit-v5.json` pins that evidence, the reviewed config/inputs, native
fit hashes and remaining issues. Approval accepts the standing-reference fit
checkpoint with known hair noise; it does not certify production T-pose
anatomy or complete Step 6C. Any later noise cleanup needs a new version.

The next small Step 6C increment is independently authored E/W bald head/neck
skin anatomy, with each profile's own source and approved hair comparison.
S/N sources and this approval stay unchanged. Independent ear/facial assets,
diagonal heads and full body/clothing remain later work; Step 6D stays gated.

## Independent E/W anatomy candidates

Local commit `11fe059` records revision-5 general approval and its known hair
noise. The next increment adds separate native 1024×1536 `E-master-v1.png` and
`W-master-v1.png`. Built-in imagegen authored each concealed scalp, profile
cheek/jaw/nose, near human ear and neck from its own character reference and an
independently traced synthetic placement guide. `profiles-prompts-v1.json`
records exact prompts, input roles and selected filenames. The guides are
framing aids, not approved anatomy; no facing is mirrored or resized.

`inputs/create-profile-guides.js` creates new native guides only, and
`inputs/partition-profile-masters-v1.js` derives binary masks and exact head/neck
parts, writing new files with exclusive creation. E divides at y268 and W at
y270. Raw image RGB under zero alpha is invisible; processing clears RGBA below
alpha 8 without filtering retained skin pixels. E retains 23,023 head and 2,741
neck pixels; W retains 20,917 head and 3,043 neck pixels. Exposed native anatomy
bounds are E x476–629/y71–310 and W x379–533/y85–316. Origins match the provisional
profile hair head anchors; parts remain on full canvases at position (0,0).
These are standing-reference candidates with unverified rig/T-pose fit. Human
ears remain embedded in the head, and interchangeable facial/ear layers are
unfinished.

`profiles-authoring-v1.json` pins the new native inputs and approved profile
hair configuration/approval. The existing anatomy review API now supports
this separate E/W configuration with the same hash, native-bound, binary-mask,
pixel-preservation, source-immutability and deterministic export checks. It
keeps S/N historical fit paths unchanged. Run:

```bash
pnpm head:review:profiles:v1
```

The initial revision-1 overview, now reproduced in `profiles/v1/overview.png`, shows:
E is the top row, W the bottom; columns are reference / complete skin base /
existing approved hair with the new skin. `full-overview.png`, native standalone
parts, masks and green/yellow inspection previews accompany `metadata.json`.
Sources contain no direction labels or coloured backgrounds. The profile
metadata lists missing directions for this two-facing review, not the complete
repository's available drafts.

The right column intentionally exposes an unresolved fit failure. E's existing
hair crown does not cover the scalp, and both fringes overlap the profile nose.
At native E (627,202) and W (380,209), real head pixels are covered by the
foreground hair. Hair design approval never established anatomical fit.
Do not clip the scalp, shift parts, mirror another facing or claim this is a
finished fit. E/W bare anatomy requires visual review independently of these
existing hair defects.

Two attempted coherent whole-hair edits changed native head framing and were
rejected. `profiles-fit-experiments-v1.json` records their exact prompts and
input roles; generated rejects remain outside the repository. At this initial review, no profile-fit v2 or replacement approved hair existed. After anatomy review, the
fit correction must use one continuous same-facing hair drawing and native
front/rear depth ownership around the complete ear, with nose/eye/cheek exposure
and crown coverage inspected in the assembled result. Approved S/N and all
earlier hair imagery remain unchanged. Step 6C remains open and 6D stays gated.

One additional public artwork integration workflow covers the actual E/W
assets: native anatomy reconstruction, independent masters, exact approved
hair and render order, deterministic exports, unchanged source hashes/mtimes
and rejection of a re-pinned altered head pixel. It also verifies that the known
nose obstruction is present in the diagnostic output; passing this workflow
does not certify fit correctness. No helper-level or enum/default unit tests
were added.

`profiles-fit-audit-v1.json` pins the reviewed profile configuration and records
the actual head/front-hair/assembled RGBA at both obscured noses and an exposed
E scalp sample. Its fit approval and Step 6C completion flags remain false.

Initial profile-increment validation (revision 1):

- `pnpm head:review:profiles`: asset-tool JavaScript/declaration build and CLI
  passed; all 26 profile PNG hashes independently verified.
- `pnpm --filter @character-studio/asset-validator typecheck`: passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm test tools/asset-validator/src/head-review.integration.test.ts`: both
  the existing S/N artwork workflow and the new E/W workflow passed
  (160.32 seconds total).
- Preservation audit: all 162 source/reference files in the pre-fit snapshot
  retain their hashes, including approved S/N sources and the profile masters.
- `git diff --check`: passed. Full application build and browser E2E were not
  rerun for this offline anatomy-review increment.

The passing processing checks do not resolve the visually failed profile hair
fit or approve anatomical proportions. The replacement studies were rejected
before extraction; the diagnostic preserves that limitation explicitly.

## Profile revision 2 — visible reference hair fit

The user requested continuation while the profile increment was in progress.
Further standalone/local edits enlarged or shifted the head and hair. Editing
the complete dressed character held the native frame, but those studies added
coloured nonzero-alpha haze and retained body occlusions. A trial colour matte
damaged hair outlines. These alternatives are rejected; their image files were
removed from the repository, while originals remain in the generated-image
directory. `profiles-prompts-v2.json` records exact prompts, input roles and
reasons. No generated hair image was selected. The two complete bald anatomy
masters remain the selected built-in imagegen results.

The current visible-fit candidate instead preserves each facing's own clean
reference pixels. `E-fit-reference-master-v2.png` and its W counterpart are
hash-identical to their respective imported native reference; the review
explicitly rejects a different-facing source. They remain flattened reference
context, not modular head/body parts. The actual hair-only matte is derived
by the manually traced hair/curl regions, face/shoulder/body exclusions and
bounded warm-skin guard in `inputs/profiles-v2/{E,W}-fit.json`.

`inputs/partition-profile-fit-v2.js` verifies pinned reference/native anatomy,
writes new parts/masks exclusively, and creates `profiles-authoring-v2.json`.
The complete unchanged head/ear/neck renders between rear and front hair.
Ear-side locks use the manual posterior regions; hair below y350 belongs to
the rear, and crown/fringe belongs to the front. Parts reconstruct the complete
**visible** hair matte exactly. Retained RGBA is copied directly from a single
same-facing reference, with no scaling, mirroring, offsets, contour collage,
global colour key or colour changes.

This corrects sampled native facial obstruction and scalp exposure. Both
near-eye/nose/chin sets have zero front/rear hair alpha, and E (558,80) and
W (451,100) have crown coverage. The reference and newly authored bald skin
have small contour differences: native mask edges, cheeks, complete ears and
neck transitions need human review. Passing ownership checks do not establish
anatomical coherence. Hair hidden by the original standing body/arm has not
been authored here; these fitted visible hair parts are **not complete reusable
production hair**. The existing approved full profile hair design sources stay
unchanged for that later concealed-surface authoring.

```bash
pnpm head:review:profiles:v2  # Historical visible-fit candidate
pnpm head:review:profiles:v1  # Original mismatch, separate profiles/v1 staging
```

Current staging has 40 PNGs. Review `profiles/overview.png` and
`inspection/{E,W}-fit-comparison.png` (reference / original fit / current fit).
`inspection/{E,W}-coherent-partition.png` shows front / rear / visible matte.
`profiles-fit-audit-v2.json` pins measurements and remaining issues, with all
anatomy/fit/Step 6C completion approvals false. Residual S noise is unchanged.

The same added public profile workflow now covers both the recorded v1 failure
and v2 facial/crown exposure, single-reference reconstruction, actual render
order, unchanged complete anatomy/approved hair, deterministic v2 exports and
rejection of a re-pinned forged fit pixel. The existing S/N workflow remains.
No additional helper or enum/default tests were introduced. Step 6D has not
started; review and concealed surfaces are still outstanding within Step 6C.

Revision-2 validation (historical checkpoint):

- Asset-tool JavaScript/declaration build and current/profile-v1 CLI exports
  passed. All 40 current PNG hashes were independently verified; historical
  profile-v1 staging remains separate.
- `pnpm --filter @character-studio/asset-validator typecheck`: passed.
- `pnpm lint`: passed with zero warnings.
- `pnpm test tools/asset-validator/src/head-review.integration.test.ts`: both
  public artwork workflows passed (204.67 seconds total), including unchanged
  S/N anatomy/ear depth and repeated E/W current exports.
- All 162 files in the source/reference preservation snapshot remain unchanged.
- `git diff --check`: passed. Full application build and browser E2E were not
  rerun for this offline asset-tool increment.

The first generated-study extraction failed its chin exposure check; explicit
face exclusions corrected that processing check, but visual inspection then
rejected the study's background contamination and damaged matte. The passing
checks above use the final same-facing reference extraction, not that rejected
colour-assisted trial. Complete hidden hair and anatomical approval are still
unresolved regardless of these automated results.

## Profile revision 3 — local ear size and placement correction

The user rejected the profile ears as too large and misaligned with the
references. The independently generated v1 ears were larger and higher;
v2's broad posterior regions additionally exposed almost the entire bald ear.
The previous sampled face/scalp tests did not establish correct ear geometry.

The correction preserves reference-visible ear pixels at their actual native
coordinates. Small authored skin regions remove the old displaced ears and
supply concealed ear attachment/root surfaces within separately traced E/W
envelopes. The surrounding scalp, face silhouette, neck, anchors and approved
sources remain unchanged. Both directions use their own studies and reference;
no direction is mirrored, moved or resampled. Only manually selected pixels
from the built-in imagegen studies enter the corrected anatomy. Rejected
framing/scale alternatives are recorded without retaining unused repository PNGs.

The visible reference hair has already been drawn around the canonical ear.
Moving its crossing fringe behind a larger bald ear was incorrect. The new
ownership keeps those strands in front, retains the reference-visible ear
opening and limits the posterior region to visible ear skin. There are currently
zero extracted posterior hair pixels over the ear: concealed hair behind the
ear was never present in the flattened visible reference. It remains future
authoring work, rather than justification to expose the full bald ear.
One pale E ear-highlight pixel is explicitly removed from the hair matte and
restored as reference ear skin; the remaining whole hair drawing is preserved.

`profiles-authoring-v3.json` pins the local repair baseline, skin/ear studies,
manual polygons and masks. `inputs/partition-profile-ears-v3.js` writes new
versions exclusively. `profiles-prompts-v3.json` retains exact built-in prompts,
input roles, selected pixel scope and rejected attempts. Placement guides are
framing aids, not approved anatomy. Raw generated body/scalp/context outside
the local selections never enters the final parts.

```bash
pnpm head:review:profiles     # Current local ear correction, profiles/
pnpm head:review:profiles:v2  # Rejected large/misaligned ear fit, profiles/v2/
pnpm head:review:profiles:v1  # Initial hair/scalp mismatch, profiles/v1/
```

Current `profiles/overview.png` shows reference / corrected bald base / assembled
fit. `inspection/{E,W}-fit-comparison.png` shows reference / rejected v2 / v3.
The review verifies exact native selected ear pixels in the **assembled output**,
not only the bare part. Its two public artwork integration workflows cover
historical defects, unchanged S/N, local anatomy preservation, real layer depth,
source hashes, deterministic exports and rejection of re-pinned unrelated edits.
No additional unit-test cases were introduced.

Concealed ear shape and local skin transitions still need human review. E/W are
unapproved candidates. Known hair noise, four diagonal heads, separate facial/ear
variants, complete concealed hair, body/clothing and production T-pose fit remain
unfinished. Step 6C is open; Step 6D has not started.

Revision-3 validation:

- Asset-validator typecheck, root lint (zero warnings) and JavaScript/declaration
  build passed; current profile, historical v2 and approved S/N CLI exports passed.
- Both existing public artwork workflows passed (225.26 seconds). After expanding
  the W rim selection, the affected E/W workflow passed again (122.50 seconds);
  the S/N case was skipped in that targeted rerun.
- Complete local warm reference ear extents match assembled pixels exactly:
  E 177 pixels plus one selected pale highlight; W all 456 pixels. The first W
  contour omitted 18 rim pixels; those are now restored and covered by regression.
- Both placement guides and 22 partition/config outputs reproduced byte-for-byte
  in an isolated temporary copy. No additional unit-test cases were added.
- All 162 source/reference files in the earlier snapshot preserve their hashes.
  Approved S/N config and fit measurements still match `review-fit-v5.json`.
- All 142 staging PNG hashes verified across S/N and profile v1/v2/v3; current
  profile staging contains 44 PNGs. `git diff --check` passed.
- Full application build and browser E2E were not rerun for this offline asset
  correction. `profiles-fit-audit-v3.json` records evidence and remaining review.

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
