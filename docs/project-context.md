# Female Character Studio — current handoff

## Alternative authoring cleanup — 2026-10-17

The user is testing local Qwen text-to-image and image editing in ComfyUI.
They report that producing assets is easier than the earlier extraction/repair
process, and propose preparing anatomy combinations before colour mapping.
On `piusyikyu/alt`, the next proof should evaluate that anatomy-first direction.
No new generation workflow, anatomy family or production asset has been accepted.

The user requested removal of unneeded work and a local commit at the end.
Old heroine-derived sources, masks, local repair inputs, staging/viewers and
their dedicated review tools have been removed from this branch. Repeated
investigation logs and unavailable-art checkpoints have also been retired.
The original eight design references and import settings remain under
`assets/references/heroine-v1/`. Full history remains in Git; local `master`
commit `a8da310` preserves the previous investigation, including the S foot study
and the ComfyUI draft. No history was rewritten and nothing is pushed.

The unused pre-CharacterRecipe engine, empty Pixi/Canvas backends and legacy
registry were removed after checking their consumers. Keep the current core,
manifest planner, detailed/pixel renderers, editor, synthetic assets, reference
importer, PNG/palette utilities and generic offline wardrobe checks.

## Current product and implementation

[character-vision.md](character-vision.md) defines the product target. Height is
fixed within an anatomy family, limbs are intact and same-race, and chest/hip/
build choices are discrete. Clothing fits anatomy and compatible underwear.
The recipe selects semantic choices; the editor resolves prepared assets
without generation or arbitrary fallback. Missing fits must remain explicit.

The current implementation uses synthetic artwork and older linked body presets.
Five chest/hip levels, complete anatomy families, automatic facing completion,
production material maps and a self-contained game asset bundle remain unbuilt.
Do not infer implementation from a design document or from prior art approvals.
Steps 6C–6D and the first production art package remain unfinished; cleanup does
not advance a milestone. Human approval is still required for new artwork.

## Next bounded proof

1. Start with coherent complete S anatomy masters, using one adult human family,
   fixed height, matching lighting, opaque everyday bra/briefs and barefoot
   flat-support posture. The user dropped the T-pose requirement for this local
   generation experiment; use one consistent relaxed standing pose across its
   variants. Existing runtime detailed `tpose` and pixel `idle` contracts are
   unchanged; a later pose migration requires explicit contract work.
2. Prove C3/C4 × H3/H4 before expanding the catalogue. The old heroine was
   provisionally classified C4/H3/balanced-soft; cup labels are visual categories,
   not measurements. Verify new masters against an approved family reference.
3. Prepare one master into useful reusable parts and semantic material/shading
   maps. Demonstrate several skin palettes without recolouring underwear,
   outlines, eyes or hair; all skin parts must share consistent shading.
4. Inspect actual mixed-option joins and one garment on two body combinations.
   Shared anchors alone do not establish smooth boundaries or clothing fit.
   A hip option may include its matching upper thighs. Use prepared overlaps
   and explicit compatibility where independent part swapping is advertised.
5. Complete eight separately authored facings for one combination before scale-up.
   Then prove editor integration, exports and separate native pixel preparation.

This is the proposed next proof, not an instruction to generate every combination
now. Full-body masters are authoring inputs; publishing them does not by itself
provide modular layers, concealed surfaces or compatible clothing.

## Retained design lessons

- The user noted: "eventually we may want to create asset by asset from scratch
  when given a design to avoid this masking problem as long as the layering
  system works." Use this to guide authoring rather than repeat pixel repairs.
- Colour options should reuse material/shading maps, not duplicate anatomy images.
  Detailed art needs continuous shading; pixel art needs independently prepared
  native shade ramps. Do not treat downscaling as finished pixel artwork.
- Ear-size asymmetry in the older reference was hidden by its hair. New anatomy
  must be reviewed without relying on one hairstyle to conceal defects.
- Footwear changes can require discrete leg/foot postures. Barefoot, flat sandals
  and trainers need flat-support anatomy; heels need an appropriate raised-heel
  variant. Do not infer heel contact from front toes or image-bottom rows.
- Chest, pelvis, shoulder and proximal-thigh proportions must remain coherent
  across facings and part boundaries. Clothing does not redefine the chosen body.
- Underwear cuts/support need actual fitted artwork. Open bellies, high slits
  and narrow tops need compatible underlayers, coverage and concealment checks.
- Qwen model licensing and generated-output rights are separate questions.
  Commercial model use needs its applicable terms checked independently.

## Working conventions

Use [architecture.md](architecture.md), [asset-spec.md](asset-spec.md) and
[mvp.md](mvp.md) before changing contracts or pipeline behaviour. Preserve approved
art through versioned sources. Keep previews in disposable ignored staging.
Record one concise current decision here; use Git for retired investigation logs.
All commits stay local. Never push or publish a branch.


## Cleanup validation

Typecheck, lint, all 25 remaining tests and the full build pass. All six Chromium
editor/renderer workflows pass with local server access (the sandbox initially
blocked localhost with `EPERM`). The frozen offline lockfile check passes.
Generated test/build outputs were removed after verification. Original reference
hashes and current editor/core/renderer sources remain exact. See
[asset-cleanup.md](asset-cleanup.md) for the scope and verification details.
