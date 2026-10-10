# Detailed asset family

Reserved for independently authored, versioned detailed PNG layers, material maps,
masks, and manifests. Native assembled output is 1024 × 1536 in authored T-pose.
Each MVP-ready asset needs all eight facings: N, NE, E, SE, S, SW, W, NW.

`pnpm demo:assets` creates temporary modular geometric layers and material maps in
`placeholder-v1/`. Those generated files are ignored by Git and are not approved
artwork. Their native geometry is authored separately from the pixel family in
`tools/render-demo/src/placeholders.ts`; generated copies serve the read-only demo.
See `docs/asset-spec.md` for the contract and the demo tool README for exports.
