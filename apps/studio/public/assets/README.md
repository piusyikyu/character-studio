# Character artwork

This is the original demo's Vite-served asset location. Its legacy registry accepts
PNG/WebP paths here, and its empty preview uses a 64 × 96 frame. These conventions
are superseded by the target-specific specification in `docs/ASSET_SPEC.md`.

New source art belongs in `assets/source`, with versioned native families in
`assets/detailed` and `assets/pixel`. Their publication into browser-accessible
paths will be designed in milestone 2. Do not place production art into the old
flat registry until the manifest and target contracts are implemented.

No artwork is bundled. Green backgrounds and direction labels belong to the final
export stage, not to source layers.
