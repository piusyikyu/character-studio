# Female Character Studio — Project Context and Handoff

> Purpose: This file transfers the **requirements and decisions** from a ChatGPT planning conversation into the WSL2/VS Code Codex development workflow. It is project context, **not** proof that any implementation is complete. Review actual repository files and tests before assuming a feature exists.

## 1. Goal

Build a modular female fantasy character creator that lets users select and combine:

- Ancestry/race (human, elf, vampire, dwarf, furry/beast, dragonborn, angel, devil, spirit, and compatible hybrids).
- Hair length, style and colours.
- Skin tone.
- Chest size, height and overall body proportions.
- Head shape, face style and expressions.
- Independent left and right eye colours.
- Eventually outfits and other race-specific anatomy.

The user interface should let users swap compatible parts in real time, recolour individual materials and preview/export eight directional views.

## 2. Core architecture — one recipe, two independent outputs

- A single versioned `CharacterRecipe` describes character identity and appearance.
- A shared, render-agnostic TypeScript engine validates traits, selects anatomy variants, resolves compatible assets, plans layer depth, and produces a `RenderPlan`.
- **Detailed output:** 1024×1536 native image artwork, composed from separately authored detailed layers.
- **Pixel output:** 128×192 native pixel assets, separately authored for crisp in-game use. Do **not** automatically shrink detailed artwork and treat that as final pixel art.
- Both outputs share semantic asset IDs, traits, attachment names and palettes, but have separate image assets and rendering implementations.
- Internal asset PNGs are transparent. Final previews/exports use `#00FF00` backgrounds; exported direction labels appear in yellow at the upper-left. Keep labels and background OUT of internal artwork.
- Palette-based recolouring should target semantic materials (hair, skin, eyes, fabric, scales) and shade levels, not blindly tint every pixel or replace approximate RGB matches.
- Larger body geometry differences use approved silhouette/rig variants and compatible clothing assets; do not stretch entire images arbitrarily.

## 3. Eight-direction contracts

Required facings: `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`.

- `N` is full back, no visible face/eyes.
- `NE` and `NW` are three-quarter **back**, no visible eyes.
- `S` is full front.
- `SE` and `SW` are three-quarter **front**.
- `E` and `W` are independent side views.
- Never generate a direction by simply mirroring another. Side-specific hands, accessories, garment openings, hairstyles, head, torso and feet must stay physically consistent.
- Back-view garments are not reflected front garments. A slit exposing the front thigh in S/SE/SW must **not** be copied onto the rear skirt in N/NE/NW.
- All directions preserve consistent character scale, alignment, grounded feet and body proportions. Pixel-art assets use a uniform square grid with no antialiasing, blur, gradients, dithering or arbitrary rotations/scaling.
- No hanging accessories unless specified. Avoid rhombus/diamond-shaped accessories or decoration.

## 4. Planned stack and repository

Development environment: Windows + WSL2 Ubuntu. The repository is under `~/projects/character-studio`, not `/mnt/c`. VS Code runs through its WSL extension; the Codex VS Code extension is preferred over the CLI. Run Node.js, pnpm, Git, builds and tests inside Ubuntu.

Proposed stack:

- React + TypeScript + Vite + Tailwind CSS.
- Zustand state; Zod schema validation.
- `pnpm` workspaces.
- `packages/core`: pure TypeScript recipe, ancestry, anatomy and composition model.
- `packages/asset-registry`: versioned manifests and asset resolution.
- `packages/renderer-detailed`: PixiJS v8/WebGL for detailed preview/rendering.
- `packages/renderer-pixel`: deterministic integer-pixel compositor; nearest-neighbour preview.
- `tools/asset-validator` and later asset-import / palette / atlas / QA helpers.
- Vitest + Playwright where appropriate.

Suggested documentation files: `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/ASSET_SPEC.md`, `docs/MVP.md` and eventually `docs/ASSET_PIPELINE.md` or `docs/REFERENCE_IMPORT.md`. These should agree; if they conflict, flag for decision rather than silently choosing one.

## 5. Art / reference status

An eight-direction detailed reference pack exists **in the user's ChatGPT conversation**. The intended local repository location is:

`assets/references/heroine-v1/detailed/{N,NE,E,SE,S,SW,W,NW}.png`

Important: These image files are **not automatically present in the repository**. Verify they exist before using them; ask the user to copy them if missing.

Character visual identity:

- Adult female anime/fantasy character; long voluminous wavy silver-lilac hair with defined curls.
- Deep-purple strapless corset dress with layered flowing skirt, red/crimson sash and lining, long purple gloves, purple high heels.
- Pose: standing, arms relaxed down (this is an **idle/dressed reference**, not the proposed neutral T-pose anatomy master).
- The eight reference images are nominally 1024×1536.
- Original `NE` and `NW` images exposed an implausible front thigh slit in three-quarter back views. Corrected `NE` and `NW` reference artworks have been supplied and visually approved: the rear skirt now covers the legs and retains the red lining and folds.
- The eight PNGs have baked-in bright green backgrounds and some baked-in yellow direction labels; source files are flattened illustrations, **not modular parts**.
- Previous analysis identified fully opaque source images, imperfectly uniform green and some baseline variation. Re-measure from actual files; don't assume exact measurements without inspecting the local copies.
- Treat these as canonical **visual references** only until modular components are independently authored and approved.

## 6. MVP plan

1. Monorepo scaffold and checks (`pnpm dev`, typecheck, lint, test, build).
2. Shared `CharacterRecipe`, ancestry traits, body presets and validation in pure TypeScript.
3. Asset registry + direction-aware layered `RenderPlan` + compatibility checks.
4. Both renderers using simple synthetic placeholder assets; complete eight-direction exports with correct dimensions/colours.
5. React character creator UI (race/body/hair/face/palettes, target switch, 8 facings, S/N compare, JSON and PNG exports, undo/redo as implemented).
6. First real production art package.

**Important:** The ChatGPT discussion outlined these steps, but there is no verified implementation status for Steps 1–5. Codex must inspect the actual repository and report what is done before proceeding.

### Step 6, detailed sequence

- **6A** Freeze all eight approved original reference images in `assets/references/heroine-v1/detailed/` (use corrected NE/NW).
- **6B** Build a non-destructive reference-import pipeline: audit dimensions/alpha/green-background variation; create contact sheet; remove background and baked labels from new **staging copies** while preserving delicate hair strands; estimate bounds/foot baseline; mark candidate anatomy anchors for manual review; create checkerboard and green preview images; keep originals immutable.
- **6C** Author genuinely modular body/head, front/rear hair and clothing assets. Begin with the long hairstyle on S and N, then complete all eight; do not mistake green-screen removal for asset decomposition. Hidden head/body anatomy under hair/clothing needs new authored artwork.
- **6D** Integrate semantic material/shade maps for hair palette swapping and test palette isolation.
- **6E** Produce independently authored 128×192 pixel counterparts using the same semantic asset IDs.

### Immediate next Codex assignment (if the previous foundation is functional)

Read `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/ASSET_SPEC.md`, `docs/MVP.md` and this context. Audit `assets/references/heroine-v1/detailed/` for `{N,NE,E,SE,S,SW,W,NW}.png`. If files are missing, report them and stop. Do not edit originals. Implement Step 6A–6B: validate, report alpha/background/bounds, generate a contact sheet, carefully create transparent labeled-free staging copies, and produce automated QA + documentation. Do not generate modular parts, invent occluded anatomy, mirror assets or auto-publish. Run and report relevant tests. Stop for visual approval.

## 7. Asset authoring and quality requirements

### Verified implementation and approved next increment — 2026-10-09

Repository verification established functional recipe/core, asset planning, both
placeholder renderers and the interactive editor. Steps 6A–6B passed source-hash,
native output and repeatability checks; all 32 existing Vitest tests and six
browser workflows passed. The user then approved proceeding with Step 6C.

The first Step 6C increment authors S/N long silver-lilac hair as versioned front
and rear components, with review inputs in
`assets/source/heroine-v1/hair-long-waves-v1/` and generated inspection outputs in
`assets/staging/heroine-v1/hair-long-waves-v1/`. N's front fringe is explicitly
hidden. See `docs/MODULAR_HAIR.md` for provenance, provisional attachments and
review criteria. Source/import artwork stays immutable. The standing-reference
draft does not certify T-pose, head/body fit, candidate anatomy or the outstanding
48 px baseline spread. The user approved the S/N hair design and requested a local commit followed by
the next increment. Source/cleaned hashes are pinned in `review-v1.json`; T-pose
and head/body fit remain unverified. Continue with independently authored E/W;
Step 6C must be reviewed before Step 6D. No production pixel art is derived.

The next increment adds independent E/W front/rear hair authoring and
`pnpm hair:review:profiles`, with separate pinned authoring configuration and
staging outputs. The user approved the E/W standing-reference hair design on
2026-10-09 and requested a local commit; `profiles-review-v1.json` pins the accepted
config, source and cleaned hashes. S/N approval and source artwork are preserved.
All diagonal facings, modular body/head/clothing and a production
T-pose rig remain unfinished. Do not treat profile authoring as Step 6C completion.

- Distinguish `assets/references/` (immutable source images), `assets/source/` (editable layered files), `assets/staging/` (unapproved outputs), `assets/detailed/` and `assets/pixel/` (approved published parts), `assets/manifests/` and `assets/qa/` (generated reports).
- Each modular part should declare a unique semantic ID, target, supported facings, compatible rig/body presets, image paths, attachment anchor, native offset, depth plane, visibility/occlusion, optional material/shade masks and requires/excludes.
- Layer order may vary with facing. Long hair usually needs rear and front components. Clothing should conform to genuine front/rear three-dimensional construction.
- Create transparent source parts and apply solid `#00FF00` / yellow direction text only in final preview/export.
- Verify dimensions, RGBA values, no overflow, foot baseline, direction correctness, sharp pixel eyes, fingers, legs and no unintended stray green pixels.
- Automated checks cannot fully verify dress anatomy, correct near/far limbs, hairstyle consistency or hidden facial features; retain human visual approval gates.

## 8. Codex operating rules

- Read actual repository files first and reuse working code.
- Work in small milestones; don't broaden scope or prematurely add complex features.
- Clearly distinguish proposed scripts from scripts already present.
- Do not claim tests passed without running them.
- Do not fabricate missing images or masks and do not modify approved reference images.
- Report exact missing input/asset files and ask for human approval when required.
- Keep documentation up to date as decisions are made, and retain the repo as the source of truth.
