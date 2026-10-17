# Pixel renderer

`renderPixel(plan, imageLoader, paletteBank?)` consumes only validated pixel
RenderPlans and returns transparent straight RGBA at exactly 128 × 192. Composition
uses integer-coordinate source-over, rounding byte channels explicitly. It uses no
DOM, PixiJS, native graphics library, transforms, interpolation or browser encoder.

```ts
import { renderPixel, exportPixelPng, exportPixelSheet, scalePixelPreview } from '@character-studio/renderer-pixel';
const image = await renderPixel(plan, imageLoader);
const png = await exportPixelPng(plan, imageLoader);
const sheet = await exportPixelSheet(eightPlans, imageLoader);
const display = scalePixelPreview(image, 3); // exact 3 × 3 display blocks
```

The loader returns `{ width, height, data: Uint8Array }` from a package-relative
source. Actual dimensions, indexed material-map channels/alpha, palette entries
and layer-local retention masks are validated. Palette indices use exact byte
lookup into named material/shade ramps; unlinked outlines remain unchanged. Source
buffers are not modified. Missing/incorrect images fail rather than substitute.

`exportPixelPng` decorates a copy with pure green and bitmap yellow direction text.
`exportPixelSheet` requires the same recipe/catalog and eight unique facings, then
emits a 512 × 384 PNG with no gutters: N, NE, E, SE / S, SW, W, NW.
`{ transparent: true }` skips green fill but keeps labels. Internal images never
contain export labels or backgrounds. Byte-identical input produces byte-identical
RGBA and PNG with the pinned codec and palette definitions.

`scalePixelPreview` permits integer nearest-neighbour enlargement only; native PNG
exports always retain their native dimensions. The read-only browser demo displays
pixel images at exactly 2× with `image-rendering: pixelated`.
The interactive editor uses this compositor for pixel previews and exports.
See [the demo procedure](../../tools/render-demo/README.md).
