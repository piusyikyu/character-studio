# MVP Plan — Female Character Studio

## Current focus — 2026-10-17

The editor and render pipeline use synthetic modular assets. The old heroine
extraction studies were retired on `piusyikyu/alt`, with original design
references retained. The next proposed proof starts with coherent anatomy
masters, then tests reusable parts, material/shading maps and fitted clothing.
See [project-context.md](project-context.md) for the bounded sequence and
[character-vision.md](character-vision.md) for the product target.

Cleanup does not complete an art milestone. Steps 6C–6D and production pixel
art remain unfinished. Require human visual approval before expanding the
catalogue or advancing a milestone. Retired studies remain in Git history.

## Scope

- Eight independently authored facings; no silent mirroring or arbitrary fallback.
- Detailed 1024 × 1536 and independently prepared pixel 128 × 192 outputs.
- Fixed-height, discrete chest/hip/build choices are the new product target;
  the runtime still has older linked body presets pending a separate migration.
- The local generation experiment can use a consistent relaxed standing pose.
  Existing runtime detailed `tpose` and pixel `idle` contracts remain unchanged.
- Prepared compatible hair, facial traits, outfit pieces and material palettes.
- Deterministic editor assembly and self-contained game asset export.
- No runtime image generation, arbitrary body warping, backend or animation in MVP.

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

#### Reference preparation and production art — Steps 6A–6E

- [x] Repeatable import of the original eight flattened references with pinned hashes.
- [x] RGBA staging, image/bounds/background diagnostics and candidate landmarks.
- [x] Source-preservation and invalid-input integration coverage.
- [ ] Accept a coherent new anatomy family with consistent pose, proportions and support.
- [ ] Step 6C: Prepare reusable body/head/hair/face/outfit parts and review actual joins.
- [ ] Step 6D: Prepare semantic material/shading maps and prove isolated recolouring.
- [ ] Prepare and approve independent native pixel artwork, rig and palettes.
- [ ] Integrate approved assets, supported fit diagnostics and self-contained exports.

The anatomy-first experiment should establish a small S proof before expanding
all combinations and facings. New generated masters are authoring candidates;
none is automatically a published manifest or approved complete character.

## Development guidance

Keep changes bounded and verify affected typecheck, lint, tests and builds.
Retain meaningful public-API, palette/export and browser workflow coverage.
Use synthetic fixtures for software contracts and human review for anatomy,
facing consistency, clothing topology, transparent edges and exposed joins.
