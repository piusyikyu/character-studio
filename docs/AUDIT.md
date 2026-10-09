# Scaffold audit — 2026-10-09

## Scope and sources

Read the complete `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/ASSET_SPEC.md`, and
`docs/MVP.md`, then inspected every existing package manifest, TypeScript config,
root config/script, app entry point/store/preview, engine/registry/renderer source,
and all five unit-test files. This audit addresses milestone 0 and configuration
gaps only. The supplied specifications were not edited.

The previous scaffold predates the supplied specifications. It is a working empty
preview demo, not an implementation of milestones 1–3. Its public APIs and UI
behavior are preserved to avoid introducing an untested contract migration during
the audit. No CharacterRecipe, RenderPlan, manifest resolver, compositor, or art
generation has been implemented in this task.

## Discrepancies and disposition

| Area | Existing implementation | Specification / disposition |
| --- | --- | --- |
| Workspace layout | `apps/*` and `packages/*`; no tools or target-native asset directories | Added `tools/*` workspace discovery and the missing directories listed below. |
| Core package | Only `character-engine`, which exports an `HTMLElement` renderer mount contract | Added a separate empty `core` scaffold with ES-only TypeScript libraries, no ambient platform types, and restricted platform/UI imports. The legacy DOM contract is not re-exported as core. |
| Renderer package boundaries | `renderer-pixi` and `renderer-canvas` are backend-based demos | Added empty `renderer-detailed` and `renderer-pixel` target boundaries. Reuse working lifecycle code only after the RenderPlan contract exists. |
| Asset tooling | No `tools/asset-validator` | Added a buildable Node tool package boundary. No audit CLI or certification behavior exists yet. |
| Source/asset ownership | Only Vite's `public/assets` README, suggesting flat demo assets | Added `assets/source`, `assets/detailed`, `assets/pixel` with ownership/versioning guidance; corrected the old public-assets README. No files are automatically published from the new directories. |
| Browser tests | Vitest only; no Playwright | Added pinned Playwright dependency, Chromium configuration, real-app smoke test, install/test scripts, root typechecking, and ignored reports/traces. |
| Core environment constraints | Base TypeScript and root ESLint allowed DOM/Node globals everywhere | Core overrides ambient types/libraries and rejects Node, React, PixiJS, registry, renderer and legacy-engine imports. Pixel composition's new scaffold also excludes DOM ambient types. |
| Root checks | Build/typecheck/lint/test existed and worked | Retained those commands. Included tools in unit-test discovery and smoke tests/config in typechecking. Added `verify:all` for existing verification plus browser smoke. |
| Character model | Version-1 `Character` stores name, direction and explicit layer asset IDs/offsets | Milestone 1 requires a versioned, target-independent appearance recipe: rig/body/head/ancestry/traits/hair/face/outfit/material selections. Image paths are already absent, but the demo model is not the recipe contract. Deferred. |
| Trait/anatomy choices | No rig, discrete body presets, head shapes, ancestry, compatibility or palette IDs | Required human/elf/vampire traits, compatible hybrids, two body/head/hair/expression choices and independent eye palettes belong to milestone 1. Deferred. |
| Generation/serialization | Default empty character exists; no seeded generation or recipe round-trip contract | Versioned deterministic defaults/random generation and JSON round-trip tests belong to milestone 1. Deferred. |
| Direction conventions | Long-form directions, ordered starting at south | Canonical facings are N, NE, E, SE, S, SW, W, NW. Migrate in the new core contract, not by changing legacy enums independently of their consumers. |
| Native target sizes/poses | Single 64 × 96 empty preview; no target or pose model | Detailed requires 1024 × 1536/tpose; pixel requires 128 × 192/idle. Demo resolution is not a compliant target. Deferred to target contracts/pipelines. |
| Registry/manifests | Flat ID/name/slot/direction/source/size/anchor entries; duplicate rejection, filtering and copy protection work | Missing catalog/schema/asset versions, rig/body/trait compatibility, target/pose variants, multi-cell frames, lifecycle/approval metadata, material and occlusion maps. The draft manifest example does not parse through this registry. Milestone 2 must replace the contract while preserving useful lookup behavior. |
| Directional coverage | Missing ID returns `undefined`; absent directions filter to an empty list | Need all-eight-facing coverage and actionable errors for missing target/pose/body/frame/mask, with no silent skip/mirror/substitution. No mirroring is currently implemented. Deferred to milestone 2. |
| Anatomy/attachment/order | Six generic slots and one point named `anchor` | Missing native rig landmarks, origin/attachment/offset semantics, foot baseline, split semantic planes and per-direction order/visibility. Deferred to milestone 2. |
| Resolution and renderer inputs | Renderers accept a mutable Character and arbitrary integer size | Need deterministic recipe/catalog/target/direction/pose resolution into immutable validated ordered RenderPlans. Renderers must consume plans, not independently resolve identity. Deferred to milestones 1–3. |
| Composition | Both backends clear/render empty transparent surfaces and report zero composed layers | No high-res layer/mask/palette pipeline, CPU source-over RGBA pixel compositor, or independently authored target artwork. Deferred to milestone 3. |
| Export | Correct green/yellow RGBA constants only; no actual exports | Need native PNGs, top-left labels, explicit transparent mode, 512 × 384 sheet in N/NE/E/SE then S/SW/W/NW order, recipe/catalog JSON, reproducible bytes/hashes. Deferred to milestones 3–4. |
| Studio UI | Eight demo directions, backend switch, working reset; empty asset counts | Partial UI foundation. Still missing shared recipe controls, target switch, S/N comparison, save/load, exports, diagnostics, undo/redo. No decorative placeholder controls were added. Milestone 4 remains incomplete. |
| Test coverage | Legacy schema/state tests and mocked renderer lifecycle tests | These do not certify target rendering. Direction visibility/order, attachments, exact native RGBA, palette isolation, deterministic exports/sheet order and recipe compatibility regression tests await the corresponding milestones. |
| Art acceptance | No artwork or manifests | No approved rig, target variants, outfit, anatomical/clothing QA or asset catalog. Milestone 5 has not started. |

## Scaffolding added

- `packages/core`: empty source entry point, Zod dependency, strict build/typecheck
  scripts, platform-free compiler settings and documented ownership.
- `packages/renderer-detailed`: empty entry point, core/PixiJS v8 dependencies,
  strict build/typecheck scripts and documented target responsibility.
- `packages/renderer-pixel`: empty entry point, core dependency, ES-only compiler
  settings and documented native CPU-composition responsibility.
- `tools/asset-validator`: empty entry point, core/registry dependencies, Node-only
  compiler environment and build/typecheck scripts. There is no misleading
  always-successful validation command.
- `assets/source`, `assets/detailed`, `assets/pixel`: tracked ownership READMEs;
  no source art, generated art or fictional approvals.
- `playwright.config.ts`, `tests/e2e/studio.spec.ts`: smoke setup for real Pixi
  initialization, Canvas switching, direction persistence and reset; uncaught page
  errors and console errors fail the test. Headless Chromium uses software WebGL
  support so a physical GPU is not required for this scaffold check.
- Updated workspace/test/config discovery, report ignores and setup/migration docs.

The legacy `character-engine`, `renderer-pixi`, `renderer-canvas`, flat registry
implementation, React UI/store and all existing unit tests are unchanged. Empty
new packages intentionally export no APIs. Successful builds do not mark any
character/render milestone complete.

## MVP status

| Milestone | Current status | Acceptance evidence / remaining work |
| --- | --- | --- |
| 0 — Workspace | Verified automatically in WSL; Windows-hosted browser check remains manual | WSL2 Ubuntu under `/home`, Node 24 through NVM, pinned pnpm, all required root scripts, and the four instruction/spec files are present. Typecheck/lint/unit tests/build and a real Chromium app smoke test pass. Windows-hosted browser visibility was not available to verify from this session. |
| 1 — Character core | Not implemented | New platform-independent package boundary exists. The old Character parser/default does not satisfy CharacterRecipe, trait/body/outfit compatibility, seeded generation or recipe JSON round-trip. |
| 2 — Registry + RenderPlan | Not implemented | Legacy lookup primitives exist; no normative manifest parser, catalog, target-native anchors/order, synthetic eight-facing catalog, RenderPlans or compatibility/coverage diagnostics. |
| 3 — Render pipelines | Not implemented | Existing empty previews and new target scaffolds only. No composition, material mapping, real exports, sheet or deterministic pixel hashes. |
| 4 — Studio UI | Partial demo foundation | React/Tailwind/Zustand, direction/backend switching and reset work. Playwright smoke runs successfully in WSL. Shared recipe/target editing, comparison, save/load, exports, compatibility warnings and undo/redo are absent. |
| 5 — Approved art | Not started | Asset directories exist but contain no artwork or approval records. Automated smoke/unit checks cannot supply human anatomical approval. |

## Verification

Environment: Ubuntu 22.04 under the Microsoft WSL2 kernel, checkout
`/home/piusyikyu/projects/character-studio`, NVM Node `v24.21.0`, pnpm `10.34.6`.
All commands run in WSL Bash; no Windows development tools were invoked.

- `pnpm add --workspace-root --save-dev --save-exact @playwright/test`: succeeded;
  installed Playwright `1.64.0` and refreshed the lockfile for all new packages.
- `pnpm verify`: passed. Runs `pnpm typecheck` (root config/smoke tests plus all nine
  child workspace packages), `pnpm lint` (zero warnings), `pnpm test` (five files,
  twelve tests), and `pnpm build` (all nine child packages, including Vite app).
- `pnpm install --offline --frozen-lockfile`: passed; lockfile was current and all
  packages already installed. `pnpm list -r --depth -1` confirms ten workspace
  projects (root plus nine child packages).
- `pnpm test:e2e:install`: passed; installed Chromium headless shell build 1248 and
  its FFmpeg support in the WSL browser cache. No OS dependency install was needed.
- `pnpm test:e2e`: passed, one Chromium test in 3.1 seconds. Actual Pixi and Canvas
  initialization, direction persistence and reset worked with no page/console
  errors. Playwright launched and shut down its own strict-port Vite server.
- `git diff --check`: passed. Comparing existing engine/registry/renderer/app
  source paths produced no changes; those implementations and tests are preserved.

No typecheck, lint, unit-test, browser-test, build or frozen-install failure remains.
The browser runner emitted a non-fatal environment warning that `NO_COLOR` was
ignored because `FORCE_COLOR` was also set. Network downloads briefly reported slow
requests and completed successfully. Dependency/browser installation and the smoke
test used elevated execution for WSL home-cache writes, browser processes and
localhost binding; development itself still ran entirely in Ubuntu.

Unavailable: a Windows-hosted browser session was not accessible. Manually open
`http://localhost:5173` from Windows while `nvm use && pnpm dev` runs in WSL to check
that final milestone-0 acceptance item. The headless test proves Ubuntu browser/app
boot, not Windows localhost forwarding. Pixel golden-image tests, deterministic PNG
checks and anatomical/art approval are future milestone work, not checks that could
meaningfully run against this empty demo.

## Next task boundary

After this audit is complete, the next separate task is milestone 1 in
`packages/core`: define and test CharacterRecipe, semantic traits/anatomy/material
selection, deterministic generation and serialization without rendering images.
Then implement milestone 2 against those contracts. Before writing its parser,
make the normative schema explicit about catalog version, declared asset-local
dimensions, approval/lifecycle metadata, and aggregate asset slots versus draw
planes (the draft example uses aggregate `slot: "hair"` with split hair planes).
Do not treat that example's single S frame as publishable eight-facing coverage.
