# Female Character Studio

A TypeScript pnpm workspace for one versioned CharacterRecipe and two independent
asset-backed outputs: detailed 1024 × 1536 T-pose artwork and pixel 128 × 192 idle
sprites, each with eight separately authored facings.

The shared character core (MVP milestone 1) is implemented. The existing React application
is the original empty-preview demo; it does not yet implement the specified recipe,
manifest, or rendering pipelines. Read [AGENTS.md](AGENTS.md),
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
| `packages/core` | Versioned CharacterRecipe, anatomy/ancestry/compatibility, serialization, seeded generation and examples |
| `packages/asset-registry` | Existing flat demo registry; versioned manifests and RenderPlans await milestone 2 |
| `packages/renderer-detailed` | Empty milestone 3 boundary for native detailed composition with PixiJS v8 |
| `packages/renderer-pixel` | Empty milestone 3 boundary for deterministic native CPU RGBA composition |
| `tools/asset-validator` | Empty boundary for future portable Node asset audits; no audit CLI yet |
| `assets/source` | Reserved for versioned approved source imagery |
| `assets/detailed`, `assets/pixel` | Reserved for independently authored target-native asset families |
| `packages/character-engine` | Preserved legacy demo Character and DOM renderer contracts |
| `packages/renderer-pixi`, `packages/renderer-canvas` | Preserved empty-preview backends used by the current app |

Packages are private, consume each other with `workspace:*`, and export TypeScript
source for development in Vite and Vitest. Library builds generate ESM and declaration
artifacts in each package's `dist`; the application build is in `apps/studio/dist`.
They are not configured for external publishing. The detailed/pixel renderer and
asset-validator scaffolds export nothing until implemented. Builds also check
scaffold wiring; a successful build does not complete rendering milestones.
Core excludes DOM/Node ambient types and rejects platform/UI/rendering imports in
ESLint. The pixel package also excludes browser ambient types.

## Commands

```bash
pnpm dev          # Start the React application
pnpm typecheck    # Check root configs, smoke tests, and all workspace packages
pnpm lint         # ESLint with zero warnings permitted
pnpm test         # Run Vitest once
pnpm test:watch   # Run Vitest in watch mode
pnpm test:e2e:install # Install Playwright's Chromium headless shell
pnpm test:e2e     # Boot Vite and smoke-test the existing app in Chromium
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
Milestone 2 will
implement versioned manifests, coverage/compatibility diagnostics and render plans;
milestone 3 will implement the two target-native compositors and export. Milestone 4
will replace demo backend selection with target selection and add the complete
editor/export controls. Avoid changing the working demo to pretend those pipelines
exist before their contracts and tests are ready.

The canonical facings are N, NE, E, SE, S, SW, W, NW. Pixel sheets must be 512 × 384,
with row-major N, NE, E, SE / S, SW, W, NW. Internal layers stay transparent;
default final export uses pure `#00FF00` (RGBA `0,255,0,255`) and bright yellow
`#FFFF00` labels (RGBA `255,255,0,255`) at each cell's top-left. Transparent export
must be an explicit choice. No approved art, synthetic layered fixtures, compositor,
or export pipeline exists yet.

Six public-API integration tests cover core recipe save/load, compatibility and
seeded generation. Legacy unit tests cover schemas, state and mocked renderer lifecycles. Browser smoke
tests cover the real demo controls and preview initialization, not anatomical QA or
MVP pixel correctness. Later rendering tests must compare exact RGBA, integer native
coordinates/dimensions, palette isolation and deterministic hashes. Human visual
approval remains necessary for anatomical and garment coherence.
