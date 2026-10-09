# Pixel renderer scaffold

Reserved for MVP milestone 3: deterministic native 128 × 192 CPU RGBA composition,
source-over alpha, and exact material/shade palette substitution. No compositor,
PNG encoding, or sheet assembly is implemented yet. This package has no browser
or PixiJS dependency; a browser preview adapter can be added separately.

Preview magnification must use nearest-neighbour sampling. Native composition
must never resample, rotate, mirror, or use fractional coordinates. Sheet export
must be 512 × 384 with row-major N, NE, E, SE / S, SW, W, NW.

The original `renderer-canvas` is an empty-preview demo and is preserved for the
current UI. It is not a deterministic pixel compositor.
