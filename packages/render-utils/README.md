# Shared raster and export utilities

Browser-independent RGBA8 utilities shared by the two renderers, outside the
appearance-only core. The codec is [fast-png](https://github.com/image-js/fast-png),
a JavaScript PNG encoder/decoder pinned by the workspace lockfile. Encoding uses
fixed compression settings and no timestamp/text metadata. Decoding checks CRCs
and requires non-indexed RGBA8 source PNGs.

`prepareLayer` validates native dimensions, copies source data, replaces only mapped
material regions and applies an optional layer-local retention mask. Material-map
pixels are RGBA8: red is a declared region index, green/blue are zero, alpha matches
source alpha. Index zero preserves original RGB (including outlines); transparent
pixels use index zero. Region shade lookup preserves source alpha. Retention mask
alpha 255 keeps, 0 cuts and intermediate values multiply alpha; it does not erase
previously drawn layers. Map/mask/source dimensions must match exactly.

`drawRgba` implements deterministic integer source-over in straight RGBA, with
round-to-nearest byte channels. `decorateExport` adds pure green and yellow bitmap
labels to a copy; `createPixelSheet` lays out eight decorated native cells.
Export labels use fixed integer 5×5 glyphs (4× on detailed outputs); no system font
or browser text rasterizer affects output. `DEFAULT_PALETTES` contains five fixed
shade roles per semantic palette ID. Unlinked dark indigo outlines are separate.

Images contain mutable byte buffers by design. Renderers copy loaded buffers and
return caller-owned outputs. The package has no browser/Node ambient types and
does no file I/O, asset selection or rendering-engine initialization.
