# Asset review tools

Portable Node.js tools prepare immutable reference inputs and modular hair drafts
for human inspection. A successful build or automated audit does not certify art.

- `pnpm reference:import`: Steps 6A–6B; see [REFERENCE_IMPORT.md](../../docs/REFERENCE_IMPORT.md).
- `pnpm hair:review`: initial Step 6C S/N authoring review; see [MODULAR_HAIR.md](../../docs/MODULAR_HAIR.md).

Both commands produce ignored staging outputs. They never publish assets or call
an image-generation service. Reference and authoring inputs are hash-pinned,
native dimensions are validated and source files remain unchanged. Runtime
manifest parsing belongs to `packages/asset-registry`; these authoring reports do
not replace approved rigs or complete production coverage/mask/visual validation.
