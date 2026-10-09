# Female Character Studio — Codex Instructions

## Project mission
Build a modular female character creator with **one versioned CharacterRecipe** and **two independent, asset-backed render targets**:
- `detailed`: 1024 × 1536 static character artwork, with an authored T-pose for each facing.
- `pixel`: 128 × 192 native-resolution pixel-art game sprites, initially static idle poses.

The targets share semantic choices (race, anatomy, head, hair, face, outfit, palette) but **never assume that a high-resolution image can be downscaled to a finished pixel sprite**. Separately authored, approved assets are required for each target.

## Development environment: WSL2
- Primary environment: Ubuntu under WSL2, with Windows-hosted VS Code using Remote - WSL.
- Repository location: `/home/<user>/projects/character-studio` (expand `<user>` to actual Linux username).
- Run Node.js, pnpm, Git and tests inside WSL. Codex may be used via the VS Code extension.
- Use Bash syntax, Linux paths and forward slashes. No PowerShell in project scripts.
- Keep repository and `node_modules` under `/home`, not `/mnt/c`.
- Use Node.js 24 LTS through NVM and pnpm workspaces.
- Prefer portable Node.js utilities for image processing and deterministic PNG exports.
- Avoid Windows-only libraries and paths.

## Preferred stack
- TypeScript in strict mode; React + Vite + Tailwind CSS for the studio UI.
- Zustand for editor state and undo/redo; Zod for runtime data validation.
- PixiJS v8 for interactive high-resolution compositing.
- Deterministic, integer-coordinate RGBA compositor for native 128×192 pixel export; Canvas 2D or PixiJS with nearest-neighbor sampling for preview.
- Playwright E2E tests for user-visible workflows; Vitest for a small public-API integration suite where browser coverage is not yet available.
- Static versioned PNG/mask assets and JSON manifests. No backend or database for MVP.

## Architectural invariants
1. `packages/core` has no React, PixiJS, browser, DOM or Node-specific rendering dependencies.
2. The CharacterRecipe describes appearance, **not image file paths**.
3. `CharacterRecipe + target + direction + pose + asset-catalog-version` resolves to a deterministic RenderPlan or an explicit validation error.
4. Rendering engines consume RenderPlans; they must not independently decide character traits.
5. Every required asset must have an independently authored facing; never silently mirror directions.
6. Target-specific native anchors, poses and assets may differ. Shared IDs and material semantics must agree.
7. Unavailable combinations must fail with actionable compatibility diagnostics, not substitute arbitrary artwork.
8. Internal assets use transparency; background and direction labels belong to the final preview/export stage.
9. All art changes must be versioned and not overwrite approved source imagery without permission.

## Character/art direction
- Female character design, with race mixing based on compatible visible traits rather than pixel blending.
- All eight facings: `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`.
- `N` is full back; `NE` and `NW` are three-quarter back, with **no eyes visible**.
- `S` is full front; `SE` and `SW` are three-quarter front; `E` and `W` are separately authored profiles.
- Head, body, limbs and feet must agree with the chosen facing. Maintain correct hand/side identity and foot baseline.
- Clothing must be physically coherent: back views are **not reflected front views**. Front-only garment slits cannot reveal the front thigh from behind.
- No hanging accessories unless explicitly requested; avoid rhombus-shaped ornaments/decorations.
- Approved sprites should be centred, not cropped, and fit within their cell.
- Final character export background must be uniform pure green `#00FF00` unless the export option explicitly requests transparency.
- Final export direction labels are bright yellow in the top-left of each standalone image/cell; labels are NOT embedded in source layers.
- Pixel art: one uniform, axis-aligned square pixel grid; crisp edges; no anti-aliasing, blur, smoothing, dithering, gradients, or non-integer transformations. Dark indigo outlines, restrained palette, distinct shade ramps.
- Palette swaps must change only the intended material; don't recolour outlines or unrelated clothing.

## Project context

Read docs/PROJECT_CONTEXT.md before working on
architecture, character features, renderers or assets.

Treat this file as the project's requirements and
decision history, not proof of implemented functionality.

Keep it updated when important decisions change.

## Work procedure
- Read `docs/ARCHITECTURE.md`, `docs/ASSET_SPEC.md`, and `docs/MVP.md` before changing core contracts or pipeline behavior.
- Inspect existing code before editing; preserve working conventions; keep tasks small.
- Implement schemas, tests and synthetic placeholder art **before** producing a large asset catalogue.
- For each change, run affected typecheck, lint, tests and build commands. Report exactly what ran and what failed or was unavailable.
- Prefer E2E coverage over numerous unit tests. Keep tests focused on meaningful workflows and failure boundaries; avoid repetitive enum/default checks, helper-level tests and mock-heavy implementation tests. Until core is integrated into the editor, retain a few public-API integration tests for recipe save/load, compatibility and deterministic generation.
- Add regression tests for direction-specific visibility, rendering order, attachment positioning, deterministic export and palette isolation.
- Prefer human visual approval for anatomical coherence. Automated tests do not prove correct clothing topology.
- Do not add decorative/non-functional UI controls.

## Git operation preferences
- Do not push to any remote unless the user explicitly asks.
- Do not commit unless the user asks. If asked to commit, use a concise single-line commit subject and do not append `Co-authored-by` trailers.
- Never run destructive Git commands without explicit approval.

## MVP boundaries
- Start with one female humanoid rig; human/elf/vampire traits; two body presets, two hairstyles, two head shapes and two expressions, plus skin/hair/independent eye palettes.
- Static eight-direction frames in both render targets. One compatible starter outfit. No animation, procedural AI generation, continuous body deformation, backend or database in MVP.
- Missing target variants are errors surfaced in UI, not silent skips.

## Milestone progression

- Follow the development milestones in docs/MVP.md.
- Verify existing milestone implementations against acceptance criteria.
- Do not assume a milestone is complete based on file existence.
- Require explicit user approval before advancing to the next milestone.
- Current focus: Verify Steps 6A–6B, then implement 6C upon approval.
- Never overwrite approved artwork without permission.