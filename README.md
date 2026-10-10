# Female Character Studio

A TypeScript pnpm workspace for one versioned CharacterRecipe and two independent
asset-backed outputs: detailed 1024 × 1536 T-pose artwork and pixel 128 × 192 idle
sprites, each with eight separately authored facings.

The character core, asset planner, native render pipelines and interactive studio
(MVP milestones 1–4) are implemented with temporary modular artwork. The
[three-panel editor](apps/studio/README.md) supports shared recipe controls, live
previews, history, presets and native exports. A separate
[read-only renderer demonstration](tools/render-demo/README.md) shows all eight
facings for both targets. Read [AGENTS.md](AGENTS.md),
[architecture](docs/architecture.md), [asset specification](docs/asset-spec.md), and
[MVP milestones](docs/mvp.md) before changing those contracts. The scaffold audit
is recorded in [docs/audit.md](docs/audit.md).

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
| `apps/studio` | Interactive React/Vite/Tailwind/Zustand character editor |
| `packages/core` | Versioned CharacterRecipe and RenderPlan schemas, anatomy/traits, native planes/anchors, serialization, seeded generation and examples |
| `packages/asset-registry` | Versioned catalogs/manifests, compatibility/coverage diagnostics, composition planning and synthetic metadata fixtures; preserved legacy registry |
| `packages/renderer-detailed` | PixiJS v8 native detailed composition and standalone PNG export |
| `packages/renderer-pixel` | Deterministic integer CPU RGBA composition, nearest preview and pixel PNG/sheet export |
| `packages/render-utils` | Shared indexed palettes, native image validation, PNG codec and export decoration |
| `tools/render-demo` | Separate native placeholder authoring, generated assets, read-only demonstration and headless exports |
| `tools/asset-validator` | Portable Node reference import, transparency staging, candidate anchors and audit CLI |
| `assets/references` | Approved flattened references and versioned import review settings |
| `assets/staging` | Ignored transparent reference outputs and inspection reports; unpublished |
| `assets/source` | Reserved for versioned approved source imagery |
| `assets/detailed`, `assets/pixel` | Reserved for independently authored target-native asset families |
| `packages/character-engine` | Preserved legacy demo Character and DOM renderer contracts |
| `packages/renderer-pixi`, `packages/renderer-canvas` | Preserved legacy empty-preview backends; unused by the editor |

Packages are private, consume each other with `workspace:*`, and export TypeScript
source for development in Vite and Vitest. Library builds generate ESM and declaration
artifacts in each package's `dist`; the application build is in `apps/studio/dist`.
They are not configured for external publishing. The Node audit/demo tools bundle workspace dependencies so they
run directly under Node 24; image processing stays outside the shared core.
Core excludes DOM/Node ambient types and rejects platform/UI/rendering imports in
ESLint. The pixel package also excludes browser ambient types.

## Commands

```bash
pnpm dev          # Generate placeholders and start the interactive editor
pnpm demo:assets  # Generate independent temporary native layer PNGs and catalog
pnpm demo:export  # Save eight detailed PNGs, eight pixel PNGs and one pixel sheet
pnpm reference:import # Prepare heroine-v1 reference staging and audit, without publishing
pnpm hair:review # Prepare S/N modular hair draft inspection; human approval required
pnpm hair:review:profiles # Prepare independent E/W hair draft inspection
pnpm hair:review:front-diagonals # Prepare SE/SW reference/study/masked-reconstruction inspection
pnpm hair:review:front-diagonals:completion # Review approved SE/SW rear roots and connections
pnpm hair:review:back-diagonals # Prepare approved independent NE/NW rear hair
pnpm head:review # Compare S/N bald head/neck drafts with accepted hair
pnpm typecheck    # Check root configs, smoke tests, and all workspace packages
pnpm lint         # ESLint with zero warnings permitted
pnpm test         # Run Vitest once
pnpm test:watch   # Run Vitest in watch mode
pnpm test:e2e:install # Install Playwright's Chromium headless shell
pnpm test:e2e     # Generate placeholders and test the app and real renderers in Chromium
pnpm build        # Generate placeholders and build all workspace projects
pnpm verify       # Typecheck, lint, test, then build
pnpm verify:all   # Run verify followed by editor and renderer browser workflows
pnpm --filter @character-studio/app preview
```

The scaffold uses [Tailwind's Vite integration](https://tailwindcss.com/docs/installation/using-vite)
and [PixiJS v8's asynchronous Application initialization](https://pixijs.com/8.x/guides/components/application).

## Studio and rendering

Run `pnpm dev` and open `http://localhost:5173`. Development and production builds
regenerate the ignored placeholder catalog/PNGs, so a fresh checkout has working
assets. The editor uses the shared CharacterRecipe and RenderPlan contracts;
legacy 64×96 empty-preview packages remain available without driving the UI.

The three panels provide anatomy/ancestry, live detailed or pixel previews, and
palettes/layers/compatibility/export. Build, height and chest select one of two
linked authored presets; the starter outfit follows the fit. Undo/redo applies to
recipe edits, imports, example loading and randomization while keeping view settings.
Enter the same string seed to reproduce the same random appearance. Saved presets
live in browser localStorage; exported JSON pins the catalog version. Both raw core
recipes and versioned studio documents can be imported.

Metadata-incompatible edits are rejected with a warning while the last valid
character remains visible. A missing/corrupt PNG suppresses the entire preview and
PNG export; the warning and retry action let the user restore assets. No partial
character, automatic facing reflection or substitute artwork is displayed.

Standalone PNG export uses the selected target and facing; select each direction
to export all eight. Pixel sheet export always renders all eight native facings.
Preview zoom/background never change output dimensions. Green/yellow export is the
default; transparency is an explicit option. The separate `/render-demo.html`
gallery and `pnpm demo:export` batch workflow remain available.

The canonical facings are N, NE, E, SE, S, SW, W, NW. Pixel sheets must be 512 × 384,
with row-major N, NE, E, SE / S, SW, W, NW. Internal layers stay transparent;
default final export uses pure `#00FF00` (RGBA `0,255,0,255`) and bright yellow
`#FFFF00` labels (RGBA `255,255,0,255`) at each cell's top-left. Transparent export
must be an explicit choice. The registry's metadata-only test fixtures retain
fictional references; the renderer demo generates actual versioned PNG placeholders.
The approved heroine-v1 detailed illustrations are flattened references, prepared
separately by the [reference import workflow](docs/reference-import.md). They are
not modular runtime assets; the editor continues using geometric pipeline fixtures.
The [modular hair drafts](docs/modular-hair.md) prepare S/N, E/W and SE/SW front/rear
hair inspections and remain outside the runtime catalog. S/N and E/W have design
approval; SE/SW revision-4 visible hair drafts and pixel-preserving mask partitions are approved,
with previously omitted far-side reference curls restored.
SE/SW rear-root and connection design approval is recorded in `front-diagonals-review-v2.json`. NE/NW rear-hair designs, including the NW shoulder-curl correction, are approved in `back-diagonals-review-v1.json`. These standing-reference drafts do not certify
production T-pose or head/body fit. The [S/N head/neck drafts](docs/modular-head.md)
now provide an anatomy review; the S fringe currently blocks the nose/eye area,
so fitted production heads remain unfinished.

Six public-API integration tests cover core recipe save/load, compatibility and
seeded generation. Seven registry integration tests cover recipe-to-plan workflows
across both targets and all eight directions, native geometry, visibility, materials
and explicit errors. Three rendering API workflows cover exact RGBA, palette
isolation, masks, deterministic exports and sheet placement. Two real-renderer
browser workflows exercise Pixi/WebGL, native sizes/bounds, direction-specific
visibility/positions, palettes, GPU readback and downloads. Four editor browser
workflows cover live controls/history, deterministic seeds/presets/JSON/native
downloads, incompatible selections/imports and missing-source recovery. Two editor
API integration tests cover atomic recipe history and persistence failures. Legacy
tests still cover schemas and mocked legacy renderer lifecycles. Human visual approval remains necessary for
anatomical and garment coherence; placeholders are pipeline fixtures.
