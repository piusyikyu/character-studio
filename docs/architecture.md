# Architecture — Female Character Studio

**Status:** Proposed MVP baseline. Implement incrementally, adapting package file names to actual scaffold conventions.

The product target refined on 2026-10-16 is recorded in
[character-vision.md](character-vision.md): fixed height, five discrete chest
levels, discrete hip/build options and intact same-race limbs. Anatomy owns
body geometry and surfaces; underwear configurations are reusable dependencies;
clothing is fitted to the selected anatomy and underwear. Outfit authoring must
prepare eight facings, complete reusable parts and supported fitted variants
before editor assembly. AI/algorithm-assisted pixel preparation and a complete
game-ready asset package are product requirements, not implemented guarantees.
This clarification does not migrate the current recipe or advance milestones.
The alternative authoring experiment begins with coherent complete anatomy
masters and then derives reusable parts/material maps. Its relaxed standing
pose is an authoring study; runtime target poses below remain unchanged until
a separately approved contract migration.

## Objective
One `CharacterRecipe` produces a *coherent identity* in two output families:

- `detailed`: native 1024×1536 artwork, authored T-pose in 8 facings.
- `pixel`: native 128×192 pixel-art character, authored idle pose in 8 facings.

The same selection may have different geometry or detail levels in each family. **Never use direct downscaling or horizontal reflection as a substitute for approved target/directional artwork.**

## Monorepo responsibilities

| Path | Owns | Must not own |
| --- | --- | --- |
| `apps/studio` | React UI, editor state, controls, previews, user export | character compatibility rules |
| `packages/core` | recipe types/Zod, visible traits, anatomy variants, compatibility, deterministic resolution models | React, PixiJS, image decoding |
| `packages/asset-registry` | JSON asset manifests, indexed lookups, versioning, coverage checks, construction of render plans | UI components |
| `packages/renderer-detailed` | composition of detailed layers, palettes/masks, PNG export | deciding traits/races |
| `packages/renderer-pixel` | native pixel RGBA composition and exact indexed palette substitution | arbitrary resampling |
| `tools/asset-validator` | asset/manifest audit, coverage/mask/bounds reporting | altering approved artwork without review |
| `assets/source` | approved layered source files and authoring inputs | output-only PNG exports |
| `assets/detailed`, `assets/pixel` | generated, published, versioned native assets | mutable user recipe state |

## Data and execution flow

```text
React editor (Zustand)
  -> CharacterRecipe v1 (Zod-validated; target-independent)
  -> resolve ancestry traits and anatomy profile
  -> validate trait / body / outfit compatibility
  -> registry lookup for target + direction + pose
  -> RenderPlan (ordered cells with masks, palettes, offsets)
     -> Detailed Renderer -> native 1024x1536 RGBA -> composited PNG
     -> Pixel Renderer    -> native 128x192 RGBA   -> composited PNG
  -> Export decorator: green background, yellow direction label
  -> PNGs / 4x2 pixel sheet / CharacterRecipe JSON
```

## Key concepts

### CharacterRecipe
A serializable, versioned appearance selection. It references semantic IDs (`long-waves`, `pointed-ears`, `body-balanced`) and palette IDs, never PNG paths. Minimum categories:
- Anatomy: rig family, discrete body preset (height/build/chest for MVP), head shape.
- Ancestry: primary species, optional secondary species, resolved visible traits.
- Appearance: hairstyle, ears, eyes, expression, starter outfit.
- Materials: skin, hair, left eye, right eye, outfit palettes.

Character identity and render target are independent. A choice unsupported in either renderer must produce explicit diagnostics.

### Rig and anatomy profiles
Each native target/direction/pose has reference anchor coordinates (head, neck, shoulders, chest, waist, hips, elbows/hands, feet) and a baseline. Body presets are authored discrete alternatives, **not** transforms applied blindly to one flattened image. Fitted clothes require body-compatible counterparts.

### Asset registry
Each entry has stable semantic ID, version, slot, compatible rig/body IDs, required/conflicting traits, target-specific directional frames, native attachment origins/offsets, material maps and optional occlusion masks. Require full 8-facing coverage for any asset declared MVP-ready.

### RenderPlan
An immutable ordered collection of concrete source cells referencing their target-native sprites and material maps. Each item has one draw plane, source image, native integer coordinates (mandatory in pixel target), palette assignments and masks. Plans are deterministic, serializable for debugging and validated before rendering. No hidden mirroring.

### Compositors
- Detailed: PixiJS v8 (WebGL preview), optional headless/native PNG path for batch export. Use high-res masks and palette lookups.
- Pixel: CPU RGBA draw routine operating on native 128×192 frames. Standard source-over alpha compositing, no interpolation, fractional coordinates or rotations. Preview may magnify with `nearest`.
- Both: transparent internal render buffer; export decorator applies `#00FF00` background and yellow direction label only after parts are composed.

### Direction semantics
- `N`: full back; `NE`, `NW`: three-quarter back, hide eyes and front-only details.
- `S`: full front; `SE`, `SW`: three-quarter front; `E`,`W`: separate side artwork.
- Front/rear hair planes and sleeves/skirt parts can change depth or visibility by direction. Any asymmetry must preserve real left/right anatomy, not image-left conventions.

## Preview and exports
- UI: target switch, direction control, S/N comparison; cached assets and debounced rendering.
- Detailed export: 8 separate 1024×1536 PNGs.
- Pixel export: 8 separate 128×192 PNGs and 4-column × 2-row sheet at 512×384 (no gutters).
- All individual/sheet outputs use correct green/yellow convention by default; offer transparent export as an explicit mode if needed.
- Save the recipe JSON with schema and compatible asset-catalog version to reproduce outputs.

## Validation strategy
1. **Schema:** recipe/manifests parse, stable IDs, legal enum values, compatible traits.
2. **Coverage:** 8 facings per published target/pose, no missing images/masks; no implicit mirroring.
3. **Geometry:** image bounds, anchor types, integer pixel positions, foot baseline, strict output size.
4. **Materials:** material maps dimension-match source, palette swaps isolate the intended region; alpha integrity.
5. **Determinism:** same recipe + catalog + target + direction -> identical pixel output bytes or canonical hash.
6. **Visual acceptance:** S/N garment topology, NE/NW eye absence, SE/SW facing alignment, no hanging/rhombus ornaments, no clipped limbs.

## Design principles
- Prefer authored discrete anatomical variants to unsafe deformation.
- Distinguish race ancestry from visible anatomy and material traits.
- Design assets as reusable pieces rather than flattened full bodies.
- Restrict first MVP to one rig and synthetic part examples before adding production artwork.
- Make missing/incompatible assets observable, not silently skipped.
