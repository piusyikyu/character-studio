# Female humanoid character creator — product target

The user refined this target on 2026-10-16, superseding the 2026-10-15 proposals
for variable height and mixed/missing limbs. This is the product specification,
not proof of implemented functionality or approval to skip current milestones.

## Character choices

- Race/creature/monster anatomy, with intact limbs from the same selected race.
- Fixed height for the scoped anatomy options; no height slider.
- Five discrete chest levels: options 1–5, described by the user as flat, A/B,
  C/D, E/F and G/H. These are art design labels, not a physical sizing contract.
  Larger levels may need separately authored chest-shape alternatives.
- Discrete pelvis/hip size options, proposed at a similar number of levels.
- Several discrete muscle-to-fat/body-build levels; exact count remains open.
- Facial feature choices and positions, independent eye/pupil colours, skin
  tone, hairstyles/colours, clothing and accessories.

The previous mixed-race limb and missing-limb/disability configuration proposal
is outside this revised scope. Continuous body sliders and a 3D migration are
not requirements of this target. Fixed height is an authoring constraint, not
an instruction to scale existing body images. The current runtime still has
legacy average/tall preset values; this
note does not migrate saved recipes or approve a schema change.

## Anatomy, underwear and clothing ownership

Anatomy owns proportions, chest, pelvis, shoulders, limb shape, skin surfaces
and attachment landmarks. Changing outfits must preserve the selected anatomy.
Clothing must be drawn/fitted for supported anatomy combinations. Anchors place
already compatible parts; joining anchors does not prove garment fit.

Underwear has explicit, reusable cut/support variants compatible with the body.
An outfit is designed around a supported underwear configuration: its neckline,
waist, slit and other openings must conceal the intended underlayers and retain
coverage. Underwear can be selected automatically as an outfit dependency.
Underwear requirements from mixed top/bottom selections must be checked together;
conflicts are reported rather than resolved by clipping fabric away. Different
cuts need genuinely available covered body/underwear art; metadata alone cannot
fill the currently missing surfaces.

Clothing owns fabric, garment silhouette, lining and garment interaction masks.
It must not own an unrelated painted chest/pelvis/shoulder that replaces the
user's anatomy choices. A dressed torso with bound visible skin is useful as an
art reference or composition prototype, not the production ownership model.
Skin, eyes, hair, undergarments and outer fabric retain independent materials.

## Required outfit authoring workflow

1. Generate a new outfit in S on a known reference anatomy and underwear
   combination, with explicit body, pose, material and attachment references.
2. Author the other seven coherent facings against their own anatomy guides.
   S alone does not specify hidden rear design: the system must author that
   design and expose it for review. Never silently mirror directions or reuse
   front-only garment openings on the back.
3. Break the outfit into reusable semantic parts and depth layers. Complete
   garment areas concealed by hair, arms or other clothes, rather than retaining
   only the visible pixels of the initial study. Separate garment material and
   occlusion masks from skin and hair.
4. Prepare fitted variants for each supported anatomy combination relevant to
   that part. Automated scale/mesh fitting can create candidates; redraw or
   generation may be needed for changed contours, folds, seams and coverage.
   Final variants are explicit versioned native artwork, reviewed before use.
   No renderer-time arbitrary warping of approved PNGs is implied.
5. Publish prepared compatible parts for users to mix and match in the editor,
   including outfit/hair swapping and independent material choices.
6. Offer AI-assisted or algorithm-assisted pixel-art preparation. Conversion
   creates candidates, not automatic approval of downsampled artwork. Target
   pose, native pixel grid, palette, outlines, facings and attachment/baseline
   consistency need pixel-specific processing and review. Detailed T-pose
   artwork alone is not a finished native idle sprite.
7. Export all assets needed for the selected combination for game development.

Generation, facing completion, segmentation, concealed-part completion, fitting
and pixel preparation are authoring capabilities. The editor assembles prepared
assets deterministically; opening a saved character must not need regeneration.
This workflow is a product target, not a claim that these operations currently
work automatically or that every generation request will succeed.

## Fitting scope and reuse

Parts declare the dimensions they actually depend on. A short shirt may depend
on chest, build, shoulder/arm shape and underwear support without depending on
hip size. A fitted skirt depends on pelvis/build; a fitted full dress can depend
on both chest and pelvis. Long hair can also need body-clearance/occlusion fits.
Race-family compatibility remains explicit. Identical artwork may be reused
across combinations only when its fit is genuinely unchanged and approved.

Five chest levels and five hip levels produce 25 body combinations per build
and race before chest-shape alternatives. This does not force 25 independently
redrawn variants of every accessory or cropped garment. It does require clear
fit dependencies and complete availability for each advertised combination.
Unavailable variants produce actionable diagnostics, not arbitrary substitutions.

## Game-ready export

Saving a recipe is insufficient. The user must be able to save a self-contained
package containing the exact selected recipe and catalog version, all required
transparent native layers/material/occlusion masks, origins/attachment and depth
metadata, and the prepared directional character PNGs/spritesheets for available
targets. Export must retain authored facing order, canvas sizes and baseline.
Assets and metadata must be usable without this workspace or a generation tool.
Exact engine-specific packaging and animation beyond current static poses are
not specified by this clarification.

## Current implementation boundary

The current MVP recipe, placeholder editor and heroine-v1 studies implement only
part of this target. Five-level anatomy selection, full outfit authoring/fitting,
underwear families, automatic seven-facing completion, pixel preparation and a
complete production asset bundle are not established by the existing studies.
The chest/pelvis surface and covered-underwear attempts remain unavailable as
recorded in wardrobe-foundation-pending.json. Existing approvals, native source
art and milestone boundaries remain unchanged. Step 6C remains open.
