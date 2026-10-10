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
recipes. Placeholder renderers are implemented in milestone 3; migration of the
studio now uses these contracts in milestone 4.

### 2 — Asset registry + RenderPlan
- [x] Manifest parser and indexed lookups by ID, target, pose, direction, body.
- [x] Native direction-specific anchors, render planes and occlusion metadata.
- [x] Both targets can resolve all eight directions from synthetic placeholder manifests.
- [x] Incomplete coverage causes explicit errors; nothing is silently mirrored or substituted.

Implemented in `packages/asset-registry` with shared RenderPlan schemas in core.
Synthetic fixtures describe fictional PNG references, not approved or renderable
artwork. Actual placeholder rendering is implemented in milestone 3. Production
PNG/alpha audits remain future work; see the registry README
for binding and source-inventory contracts.

### 3 — Render pipelines
- [x] Detailed renderer combines high-res placeholder layers at 1024×1536.
- [x] Pixel renderer composes native 128×192 integer pixels with no smoothing.
- [x] Green background and yellow label only appear in final export, never source layers.
- [x] Palette changes are isolated to the intended material.
- [x] Identical recipe/catalog/export choices produce identical pixel hashes.
- [x] 4×2 pixel sheet exports as exactly 512×384 with correct direction order.

Implemented with separately authored geometric placeholder cells and real-browser
renderer tests. The standalone read-only demo and export procedure are documented
in `tools/render-demo/README.md`. Placeholders require visual review; production
artwork remains a future milestone; editor controls are implemented in milestone 4. Pixel byte equality is tested
directly, stronger than comparing hashes; detailed GPU alpha rounding can vary by
device even though repeated exports are stable in the tested browser.

### 4 — Studio UI
- [x] Controls modify shared recipe; both preview targets update accordingly.
- [x] Eight-direction selector + S/N compare mode.
- [x] Character JSON save/load; PNG exports; compatibility warnings.
- [x] Undo/redo for recipe edits; no inert buttons.
- [x] Playwright smoke tests run in WSL.

Implemented in `apps/studio`; see its README for controls, local presets, pinned
JSON, deterministic seed generation and native PNG/sheet export. Two editor API
workflows and four real-browser interaction workflows cover history, save/load,
exports and asset failure recovery. Build/height/chest remain linked discrete
presets; one starter outfit is selected automatically with its correct body fit.
The editor operates on the temporary geometric catalog, not approved artwork.

### 5 — First approved art package
- [ ] One authored/approved female base for detailed and pixel targets.
- [ ] Matching 8-facing head/hair/face/body/outfit assets.
- [ ] QA check: N/NE/NW hide eyes; facing axes match feet and head.
- [ ] QA check: back skirt/dress geometry truly differs from front where appropriate.
- [ ] QA check: clean pixel edges, no hanging/rhombus accessories, no bounds crossing.

#### Reference preparation — Steps 6A–6B

- [x] Validate the approved eight-direction heroine-v1 detailed reference files and preserve source hashes.
- [x] Produce native transparent full-character staging, contact sheet and checker/green inspection previews.
- [x] Record background/alpha/bounds/baseline measurements and versioned candidate anchors.
- [x] Add repeatable import/export and source-preservation workflow tests.
- [ ] Human review of matte edges, uncertain regions, anchors and baseline inconsistency.
- [ ] Step 6C: S/N, E/W and SE/SW visible hair drafts approved; SE/SW rear connections/roots also approved; NE/NW rear-hair designs and the NW shoulder curl approved; complete anatomy and production fit remain unfinished.

See [reference-import.md](reference-import.md). The approved sources are flattened
standing illustrations, including the approved NE/NW dress corrections. Staging
does not satisfy modular-layer or detailed T-pose approval, and no production
pixel assets have been authored. The initial foot-baseline audit flags a 48 px
spread; original geometry remains unchanged.

The user approved proceeding after the verified 6A–6B audit on 2026-10-09.
The initial Step 6C increment is three separately authored S/N hair draft layers,
explicit N fringe invisibility, provisional native origins and deterministic
inspection tooling. See [modular-hair.md](modular-hair.md). This is not approval
of candidate anatomy or a completed art package. Remaining facings, body/head,
clothing and the T-pose rig are unfinished; Steps 6D–6E have not begun.

## Development guidance for Codex
Implement each milestone as a separate task and stop after test/verification. Favor synthetic coloured shapes in early renderer tests over premature illustration generation. Add snapshot/golden-image tests for the pixel pipeline and manual S/N review at each art approval gate.

Suggested sequence for VS Code Codex prompts:
1. `Read AGENTS.md and docs/*.md. Audit the scaffold against MVP milestone 0; fix setup gaps only.`
2. `Implement MVP milestone 1 in packages/core with tests; do not render images.`
3. `Implement MVP milestone 2 asset registry and RenderPlan with synthetic manifests.`
4. `Implement MVP milestone 3 independently for detailed and pixel renderers; test outputs.`
5. `Implement MVP milestone 4 studio controls and export UX; use existing engines.`
6. `Help prepare the first modular asset pack for human review, without overwriting approved art.`
