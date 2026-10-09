# Female Character Studio

A TypeScript pnpm workspace for one versioned CharacterRecipe and two independent
asset-backed outputs: detailed 1024 × 1536 T-pose artwork and pixel 128 × 192 idle
sprites, each with eight separately authored facings.

The character core, asset planner and placeholder render pipelines (MVP milestones
1–3) are implemented. The original editor remains an empty-preview demo; a separate
[read-only renderer demonstration](tools/render-demo/README.md) shows all eight
facings and exports for both native targets. Read [AGENTS.md](AGENTS.md),
[architecture](docs/ARCHITECTURE.md), [asset specification](docs/ASSET_SPEC.md), and
[MVP milestones](docs/MVP.md) before changing those contracts. The scaffold audit
is recorded in [docs/AUDIT.md](docs/AUDIT.md).

## WSL2 Ubuntu setup

Run all commands in Bash inside Ubuntu under WSL2. Keep the checkout and
`node_modules` on the Linux filesystem, such as
`/home/<user>/projects/character-studio`, rather than `/mnt/c`.

With NVM already installed:

```bash
source "$HOME/.nvm/nvm.sh"
nvm install
nvm use
npm install --global pnpm@10.34.6
pnpm install --frozen-lockfile
pnpm test:e2e:install
pnpm verify
pnpm test:e2e
pnpm demo:assets
pnpm dev
```

`.nvmrc` selects Node.js 24 LTS. `package.json` pins the pnpm version and restricts
Node to version 24. For an exact pnpm toolchain match, install the version in its
`packageManager` field. The dev server listens on `http://localhost:5173` by default.
Use the localhost URL in your browser; the development tools stay in Ubuntu.
Playwright also runs in Ubuntu using headless Chromium. If Ubuntu lacks Chromium
system libraries, run `pnpm exec playwright install-deps chromium` in WSL (it may
require sudo). Browser binaries and OS libraries are separate from pnpm dependencies;
see [Playwright's browser setup](https://playwright.dev/docs/browsers).

## Workspace

| Location | Purpose |
| --- | --- |
| `apps/studio` | Working React/Vite/Tailwind/Zustand demo |
| `packages/core` | Versioned CharacterRecipe and RenderPlan schemas, anatomy/traits, native planes/anchors, serialization, seeded generation and examples |
| `packages/asset-registry` | Versioned catalogs/manifests, compatibility/coverage diagnostics, composition planning and synthetic metadata fixtures; preserved legacy registry |
| `packages/renderer-detailed` | PixiJS v8 native detailed composition and standalone PNG export |
| `packages/renderer-pixel` | Deterministic integer CPU RGBA composition, nearest preview and pixel PNG/sheet export |
| `packages/render-utils` | Shared indexed palettes, native image validation, PNG codec and export decoration |
| `tools/render-demo` | Separate native placeholder authoring, generated assets, read-only demonstration and headless exports |
| `tools/asset-validator` | Empty boundary for future portable Node asset audits; no audit CLI yet |
| `assets/source` | Reserved for versioned approved source imagery |
| `assets/detailed`, `assets/pixel` | Reserved for independently authored target-native asset families |
| `packages/character-engine` | Preserved legacy demo Character and DOM renderer contracts |
| `packages/renderer-pixi`, `packages/renderer-canvas` | Preserved empty-preview backends used by the current app |

Packages are private, consume each other with `workspace:*`, and export TypeScript
source for development in Vite and Vitest. Library builds generate ESM and declaration
artifacts in each package's `dist`; the application build is in `apps/studio/dist`.
They are not configured for external publishing. The asset-validator scaffold
still has no audit CLI. The Node demo tools bundle workspace dependencies so they
run directly under Node 24; image processing stays outside the shared core.
Core excludes DOM/Node ambient types and rejects platform/UI/rendering imports in
ESLint. The pixel package also excludes browser ambient types.

## Commands

```bash
pnpm dev          # Start the React application
pnpm demo:assets  # Generate independent temporary native layer PNGs and catalog
pnpm demo:export  # Save eight detailed PNGs, eight pixel PNGs and one pixel sheet
pnpm typecheck    # Check root configs, smoke tests, and all workspace packages
pnpm lint         # ESLint with zero warnings permitted
pnpm test         # Run Vitest once
pnpm test:watch   # Run Vitest in watch mode
pnpm test:e2e:install # Install Playwright's Chromium headless shell
pnpm test:e2e     # Generate placeholders and test the app and real renderers in Chromium
pnpm build        # Build libraries and application in dependency order
pnpm verify       # Typecheck, lint, test, then build
pnpm verify:all   # Run verify followed by the browser smoke test
pnpm --filter @character-studio/app preview
```

The scaffold uses [Tailwind's Vite integration](https://tailwindcss.com/docs/installation/using-vite)
and [PixiJS v8's asynchronous Application initialization](https://pixijs.com/8.x/guides/components/application).

## Demo and migration boundaries

The preserved demo uses long-form compass directions, six generic layer slots,
one 64 × 96 frame, and a Pixi/Canvas backend selector. Its Character includes
direction and layer asset IDs. Both backends return
`{ status: 'scaffold', composedLayers: 0 }` and leave previews empty. These APIs are
not the new target-independent CharacterRecipe or RenderPlan contract.

Milestone 1 core is implemented and documented in [packages/core/README.md](packages/core/README.md).
It provides schema-validated recipe creation, canonical JSON, deterministic seeded
generation and six examples including all three ancestry hybrid pairs. The current
demo remains on its legacy contract until editor/registry integration is implemented.
Milestone 2 provides versioned manifests, coverage/compatibility diagnostics and
render plans; see [packages/asset-registry/README.md](packages/asset-registry/README.md).
Milestone 3 provides both native compositors and export using separate geometric
placeholder assets. Visit `/render-demo.html` after `pnpm demo:assets` and `pnpm dev`;
headless exports go to `artifacts/render-demo`. Milestone 4
will replace demo backend selection with target selection and add the complete
editor/export controls. Avoid changing the working demo to pretend those pipelines
exist before their contracts and tests are ready.

The canonical facings are N, NE, E, SE, S, SW, W, NW. Pixel sheets must be 512 × 384,
with row-major N, NE, E, SE / S, SW, W, NW. Internal layers stay transparent;
default final export uses pure `#00FF00` (RGBA `0,255,0,255`) and bright yellow
`#FFFF00` labels (RGBA `255,255,0,255`) at each cell's top-left. Transparent export
must be an explicit choice. The registry's metadata-only test fixtures retain
fictional references; the renderer demo generates actual versioned PNG placeholders.
No production art is approved yet, and the main editor has no creator controls.

Six public-API integration tests cover core recipe save/load, compatibility and
seeded generation. Seven registry integration tests cover recipe-to-plan workflows
across both targets and all eight directions, native geometry, visibility, materials
and explicit errors. Three rendering API workflows cover exact RGBA, palette
isolation, masks, deterministic exports and sheet placement. Two real-renderer
browser workflows exercise Pixi/WebGL, native sizes/bounds, direction-specific
visibility/positions, palettes, GPU readback and downloads. A third browser smoke
test preserves the original demo. Legacy unit tests still cover schemas, state and
mocked legacy renderer lifecycles. Human visual approval remains necessary for
anatomical and garment coherence; placeholders are pipeline fixtures.
