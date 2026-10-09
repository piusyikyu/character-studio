# MVP Plan — Female Character Studio

## Purpose
Validate an entire loop from editable character recipe to **two correct independent outputs**, using placeholder layered artwork before scaling up asset generation.

## MVP scope
- Target resolutions: detailed `1024x1536` in authored `tpose`; pixel `128x192` in authored `idle`.
- Facings: all eight `N, NE, E, SE, S, SW, W, NW` separately authored; no automatic mirroring.
- One female humanoid rig with two discrete body presets (covering different build/chest/height combinations).
- Human, elf, vampire ancestry traits; compatible hybrids with visible traits (e.g. pointed ears, fangs).
- Two hairstyles (short/long), two head shapes, two expressions (neutral/stern), independent eye colours.
- Skin/hair/eye palette swaps with fixed semantic shade roles.
- One outfit with correctly authored fit variants and logical front/back coverage.
- Live preview, direction switch, target switch, S/N comparison, working controls and compatibility warnings.
- Exports: eight detailed PNGs, eight pixel PNGs, 4×2 pixel sheet, CharacterRecipe JSON.

## Out of scope (intentionally)
- Procedural image generation from within the editor.
- Continuous chest/height/waist sliders, arbitrary image deformation or automatic garment fitting.
- Walking/combat animation, skeletal posing, large outfit inventory.
- Full furry/beast/dragonborn/angel/devil/spirit anatomy families.
- Backend, authentication, user accounts or database.

## Milestones and acceptance tests

### 0 — Workspace scaffold
- [ ] WSL2 + Node24 + pnpm workspace operates under `/home`.
- [ ] `apps/studio` boots in Windows browser via WSL localhost.
- [ ] Root build, typecheck, lint and test scripts exist and pass (or missing dependencies are documented).
- [ ] `AGENTS.md` and docs are present and used by Codex.

### 1 — Character core
- [x] Versioned CharacterRecipe and Zod runtime parser.
- [x] Deterministic default/seeded random character generation.
- [x] Valid and invalid trait/body/outfit combinations tested.
- [x] JSON round-trip preserves appearance and schema version.
- [x] Core imports neither React nor PixiJS.

Implemented in `packages/core`; see its README for the version-1 contract, discrete
anatomy presets, composable trait rules, deterministic seed contract and six example
recipes. Registry/renderers and the legacy demo UI remain separate future tasks.

### 2 — Asset registry + RenderPlan
- [ ] Manifest parser and indexed lookups by ID, target, pose, direction, body.
- [ ] Native direction-specific anchors, render planes and occlusion metadata.
- [ ] Both targets can resolve all eight directions from synthetic placeholder manifests.
- [ ] Incomplete coverage causes explicit errors; nothing is silently mirrored or substituted.

### 3 — Render pipelines
- [ ] Detailed renderer combines high-res placeholder layers at 1024×1536.
- [ ] Pixel renderer composes native 128×192 integer pixels with no smoothing.
- [ ] Green background and yellow label only appear in final export, never source layers.
- [ ] Palette changes are isolated to the intended material.
- [ ] Identical recipe/catalog/export choices produce identical pixel hashes.
- [ ] 4×2 pixel sheet exports as exactly 512×384 with correct direction order.

### 4 — Studio UI
- [ ] Controls modify shared recipe; both preview targets update accordingly.
- [ ] Eight-direction selector + S/N compare mode.
- [ ] Character JSON save/load; PNG exports; compatibility warnings.
- [ ] Undo/redo for recipe edits; no inert buttons.
- [ ] Playwright smoke tests run in WSL.

### 5 — First approved art package
- [ ] One authored/approved female base for detailed and pixel targets.
- [ ] Matching 8-facing head/hair/face/body/outfit assets.
- [ ] QA check: N/NE/NW hide eyes; facing axes match feet and head.
- [ ] QA check: back skirt/dress geometry truly differs from front where appropriate.
- [ ] QA check: clean pixel edges, no hanging/rhombus accessories, no bounds crossing.

## Development guidance for Codex
Implement each milestone as a separate task and stop after test/verification. Favor synthetic coloured shapes in early renderer tests over premature illustration generation. Add snapshot/golden-image tests for the pixel pipeline and manual S/N review at each art approval gate.

Suggested sequence for VS Code Codex prompts:
1. `Read AGENTS.md and docs/*.md. Audit the scaffold against MVP milestone 0; fix setup gaps only.`
2. `Implement MVP milestone 1 in packages/core with tests; do not render images.`
3. `Implement MVP milestone 2 asset registry and RenderPlan with synthetic manifests.`
4. `Implement MVP milestone 3 independently for detailed and pixel renderers; test outputs.`
5. `Implement MVP milestone 4 studio controls and export UX; use existing engines.`
6. `Help prepare the first modular asset pack for human review, without overwriting approved art.`
