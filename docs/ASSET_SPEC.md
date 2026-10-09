# Asset Specification — Female Character Studio

**Status:** Canonical draft for MVP. Changes to this contract require updating loaders, validators, fixtures and both renderers.

## 1. Asset families and native sizes

| Target | Canvas size | Initial pose | Sampling | Notes |
| --- | --- | --- | --- | --- |
| `detailed` | `1024x1536` | `tpose` | native-resolution | separately authored artwork, soft detail permitted but no forced pixel-art constraints |
| `pixel` | `128x192` | `idle` | nearest-neighbour preview | true axis-aligned pixel grid, no anti-aliasing/dithering/gradient/blur/rotation |

Each target MUST have independently authored art. Detailed images are **not** source-of-truth for final pixel pixels. All authoring layers use transparent RGBA PNG; no green backgrounds or labels are baked into individual parts.

## 2. Directions
`N, NE, E, SE, S, SW, W, NW`.
- N/NE/NW: back or three-quarter back, **no eyes**.
- S/SE/SW: front or three-quarter front.
- E/W: independently authored profiles.
- No horizontal flipping to fill gaps. Missing facings are errors.
- Physical side identity (e.g., character's right hand) stays the same in all views.

## 3. Supported logical slots (expand as needed)
`body-back-leg`, `body-back-arm`, `body-torso`, `body-front-leg`, `body-front-arm`, `neck`, `head`, `ears`, `eyes`, `eyebrows`, `mouth`, `horns`, `wing-rear`, `wing-front`, `tail-rear`, `tail-front`, `hair-rear`, `hair-front`, `outfit-torso`, `outfit-back`, `outfit-front`.

A physical part may be split across multiple slots or planes (especially hair, wings, tails and clothing). Slots are semantic; not all are active for every character.

## 4. Landmarks and anchoring
For each *rig, body preset, target, direction and pose*, define target-native positions for at least:
- `head_center`, `neck_base`
- `shoulder_left`, `shoulder_right`
- `chest_center`, `waist_center`
- `hip_left`, `hip_right`
- `hand_left`, `hand_right`
- `foot_left`, `foot_right`, `ground_baseline`

`left` and `right` refer to **the character's anatomy**, not screen sides.

An asset declares its own origin (within that image), target rig attachment landmark and optional target-native integer pixel offset. Position:

`finalTopLeft = rigAnchor - assetOrigin + offset`.

For pixel target, all numbers, positions, offsets and visible output coordinates MUST be integers; transforms must not rotate, interpolate or scale. Preserve target-specific foot baseline across compatible frames.

## 5. Versioned manifest example
This example is illustrative; keep schema types/Zod in the source code as the normative runtime parser. `sprite` references are relative to the approved asset package. Coordinates refer to source-image native pixels.

```json
{
  "schemaVersion": 1,
  "id": "hair.long-waves.v1",
  "assetVersion": 1,
  "slot": "hair",
  "compatibleRigs": ["female-humanoid-v1"],
  "compatibleBodies": ["balanced", "slender"],
  "requiresTraits": [],
  "excludesTraits": [],
  "materialSlots": ["hair"],
  "variants": {
    "detailed": {
      "pose": "tpose",
      "frames": {
        "S": [
          {
            "sprite": "hair/long-waves/detailed/S-rear.png",
            "plane": "hair-rear",
            "attachTo": "head_center",
            "origin": {"x": 180, "y": 90},
            "offset": {"x": 0, "y": 0},
            "materialMap": "hair/long-waves/detailed/S-rear-material.png"
          },
          {
            "sprite": "hair/long-waves/detailed/S-front.png",
            "plane": "hair-front",
            "attachTo": "head_center",
            "origin": {"x": 180, "y": 90},
            "offset": {"x": 0, "y": 0},
            "materialMap": "hair/long-waves/detailed/S-front-material.png"
          }
        ]
      }
    },
    "pixel": {
      "pose": "idle",
      "frames": {
        "S": [
          {
            "sprite": "hair/long-waves/pixel/S-rear.png",
            "plane": "hair-rear",
            "attachTo": "head_center",
            "origin": {"x": 14, "y": 10},
            "offset": {"x": 0, "y": 0},
            "materialMap": "hair/long-waves/pixel/S-rear-material.png"
          }
        ]
      }
    }
  }
}
```

**Important:** The example intentionally only shows the `S` facing and is therefore an authoring draft, **not** publishable. The registry validator must reject it as a fully supported MVP asset until all eight directions are provided.

A part's `plane` can vary by direction (e.g. back hair over rear shoulders). Define named per-direction render-plane order in core/registry, rather than baking one universal ordering into the UI.

## 6. Palette and material maps
- Preferred interface: base RGBA artwork plus a same-sized indexed `materialMap`, or an equivalent explicit semantic material/shade map. Map codes represent material ID and shade role (e.g. `hair.shadow`, `hair.base`, `hair.highlight`).
- Define 3–5 authored tones per material for pixel art. Keep outlines independent unless explicitly palette-linked.
- Changing `hair` must never recolour eyes, skin or outfit.
- Do not create one raster asset for every colour option. Reuse shade-role palettes.
- Material-map pixels and source alpha must align exactly. Transparent areas must not bleed into visible pixels.
- The green `#00FF00` background is **output decoration**, not a valid palette colour painted into character parts.

## 7. Clothing/topology requirements
- Outfit shapes depend on compatible torso/chest/waist/hip body presets. A size change may require a distinct `outfit-torso` variant.
- Front garment openings must not be visible from back angles unless physically designed to be so. Do not reflect an S view into N, E or W.
- Validate dresses/skirts across N, NE, E, SE, S, SW, W and NW. Legs, arm count and hand placement must remain coherent.
- No hanging accessories by default. Avoid rhombus decorations.

## 8. Output rules
- Internal assembled render: transparent RGBA at native canvas size.
- Final PNG: `#00FF00` full-background fill, character on top, yellow direction text at top-left.
- Pixel sheet: 4 columns × 2 rows, 128×192 cells, total 512×384 pixels; row-major `N, NE, E, SE / S, SW, W, NW`.
- Text labels are export overlays, never part of interchangeable layers; their placement must not overlap the figure.
- Avoid clipping; keep sprite entirely within frame and foot baseline stable.

## 9. Asset lifecycle and validation

`draft -> generated -> segmented -> palette-indexed -> directional-check -> approved -> published`.

Validators must catch: missing source files, missing facings, wrong image dimensions (per declared asset-local dims), alpha mismatch, manifest IDs, required/excluded trait conflict, invalid anchor references, positions outside target, extraneous non-integer pixel coordinates, missing palette mappings, and non-reproducible output.

Human art QA must additionally check: hairstyle front/back logic, garment topology, eye visibility, real left/right handedness, fingers/legs, consistent anatomy, and project style. Approval should be attached to a specific asset version and target.
