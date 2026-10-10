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
pnpm head:review
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

**S fit needs correction:** the accepted frontal fringe covers the nose and
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
S fringe mismatch remains an unresolved visual issue despite passing tests.
