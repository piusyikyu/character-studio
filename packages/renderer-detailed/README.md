# Detailed renderer

`DetailedRenderer` consumes validated detailed RenderPlans and decoded RGBA8
assets. It uses PixiJS v8 WebGL at native 1024 × 1536 with transparent clears,
resolution 1, source-sized textures and plan-defined positions/depth. It never
chooses traits, substitutes facings or scales a layer to fit the canvas.

```ts
import { DetailedRenderer } from '@character-studio/renderer-detailed';
const renderer = await DetailedRenderer.create();
try {
  const rgba = await renderer.render(plan, imageLoader);
  const png = await renderer.exportPng(plan, imageLoader);
  // imageLoader: package-relative source -> Promise<{ width, height, data }>
  // rgba is transparent internally; png defaults to green/yellow decoration.
} finally {
  await renderer.destroy();
}
```

Optional `render(..., paletteBank)` replaces the default named shade ramps.
Palette lookup uses indexed material-map regions before texture upload, preserving
source alpha, unmapped outlines and unrelated materials. Layer-local retention
masks multiply alpha; malformed map pixels/dimensions, missing sources or palette
entries fail explicitly. Inputs are copied before replacement/upload.

Calls are serialized. The public image uses straight RGBA after premultiplied GPU
readback conversion; returned PNGs use the shared deterministic JavaScript encoder,
with no browser text rasterization or timestamp metadata. Partial-alpha GPU
blending can have device-specific rounding; exact cross-platform pixel guarantees
belong to the CPU pixel renderer. Real Chromium tests verify known GPU coordinates,
source-over, retention masks, transparent output, palettes and repeated export.

`renderer.canvas` exposes the native preview canvas. `exportPng(..., {
transparent: true })` omits green fill while retaining the yellow label. Browser
WebGL is required. The existing legacy `renderer-pixi` and main editor are unchanged.
See [the demo procedure](../../tools/render-demo/README.md).
