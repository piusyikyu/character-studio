# Asset review tools

Portable Node.js tools prepare immutable reference inputs and modular hair drafts
for human inspection. A successful build or automated audit does not certify art.

- `pnpm reference:import`: Steps 6A–6B; see [reference-import.md](../../docs/reference-import.md).
- `pnpm hair:review`: initial Step 6C S/N authoring review; see [modular-hair.md](../../docs/modular-hair.md).
- `pnpm hair:review:profiles`: independent E/W front/rear hair review in separate staging; see the same authoring guide.
- `pnpm hair:review:front-diagonals`: SE/SW revision-4 reference/study/masked-reconstruction comparisons, plus separate hair-only diagnostics; see the same authoring guide. Binary masks must partition and reconstruct each facing's own study exactly. Restored far-side curls must retain their original reference RGBA in the rear layer. Hidden roots and body-occluded connections remain pending. Rejected iterations are archived in Git history; the review API uses the retained current configurations.
- `pnpm hair:review:front-diagonals:completion`: approved SE/SW revision-5 rear completion design in `front-diagonals-v5/`. Compares the reference, approved visible master and candidate composition. The baseline partition must still reconstruct exactly; candidate pixels must match the baseline outside manual masks and their own generated artwork inside. Small seam repairs retain visible curl coverage. Reports separate added, repaired and reference-repaired pixel counts; design approval is pinned in `front-diagonals-review-v2.json`; production fit remains pending.

These commands produce ignored staging outputs. They never publish assets or call
an image-generation service. Reference and authoring inputs are hash-pinned,
native dimensions are validated and source files remain unchanged. Runtime
manifest parsing belongs to `packages/asset-registry`; these authoring reports do
not replace approved rigs or complete production coverage/mask/visual validation.
