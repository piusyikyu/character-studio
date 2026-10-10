# Pixel asset family

Reserved for independently authored, versioned pixel PNG layers, material maps,
masks, and manifests. Native assembled output is 128 × 192 in authored idle pose.
Each MVP-ready asset needs all eight facings: N, NE, E, SE, S, SW, W, NW.

`pnpm demo:assets` creates temporary modular geometric layers and indexed material
maps in `placeholder-v1/`. Those generated files are ignored by Git and are not
approved artwork. Their integer native geometry is independently authored in
`tools/render-demo/src/placeholders.ts`. Detailed images are never downscaled or
mirrored to supply these facings. Generated copies serve the read-only demo; see
the demo tool README for export instructions and `docs/asset-spec.md` for the contract.
