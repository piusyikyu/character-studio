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
pnpm head:review # Current revision-2 S fit candidate and unchanged N
pnpm head:review:v1 # Reproduce the initial mismatch in separate staging/v1
```

`assets/staging/heroine-v1/head-soft-oval-v1/` is ignored and regenerated:

- `overview.png`: native cropped comparisons, reference / bare skin base /
  accepted hair+head+neck, S above N. Each cell copies source x320/y40/
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

`pnpm head:review` writes the current revision-2 overview at the existing
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
