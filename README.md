# Female Character Studio

A TypeScript pnpm workspace for a layered character editor. This initial scaffold
includes shared character contracts, an asset registry, empty PixiJS v8 and Canvas
2D renderers, and a React application with direction and renderer controls.
Character composition, artwork, animation, and PNG export are intentionally future
work.

## WSL2 Ubuntu setup

Run all commands in Bash inside Ubuntu under WSL2. Keep the checkout and
`node_modules` on the Linux filesystem, such as
`/home/<user>/projects/character-studio`, rather than `/mnt/c`.

With NVM already installed:

```bash
source "$HOME/.nvm/nvm.sh"
nvm install
nvm use
npm install --global pnpm@10
pnpm install --frozen-lockfile
pnpm verify
pnpm dev
```

`.nvmrc` selects Node.js 24 LTS. `package.json` pins the pnpm version and restricts
Node to version 24. For an exact pnpm toolchain match, install the version in its
`packageManager` field. The dev server listens on `http://localhost:5173` by default.
Use the localhost URL in your browser; the development tools stay in Ubuntu.

## Workspace

| Location | Purpose |
| --- | --- |
| `apps/studio` | React, Vite, Tailwind CSS, Zustand application |
| `packages/character-engine` | Zod character schemas, pixel geometry, renderer contract, export policy |
| `packages/asset-registry` | Validated metadata registration and slot/direction lookup |
| `packages/renderer-pixi` | PixiJS v8 asynchronous lifecycle and transparent preview scaffold |
| `packages/renderer-canvas` | Canvas 2D lifecycle and transparent preview scaffold |

Packages are private, consume each other with `workspace:*`, and export TypeScript
source for development in Vite and Vitest. Library builds generate ESM and declaration
artifacts in each package's `dist`; the application build is in `apps/studio/dist`.
They are not configured for external publishing.

## Commands

```bash
pnpm dev          # Start the React application
pnpm typecheck    # Check all five packages
pnpm lint         # ESLint with zero warnings permitted
pnpm test         # Run Vitest once
pnpm test:watch   # Run Vitest in watch mode
pnpm build        # Build libraries and application in dependency order
pnpm verify       # Typecheck, lint, test, then build
pnpm --filter @female-character-studio/app preview
```

The scaffold uses [Tailwind's Vite integration](https://tailwindcss.com/docs/installation/using-vite)
and [PixiJS v8's asynchronous Application initialization](https://pixijs.com/8.x/guides/components/application).

## Character and asset contracts

The initial defaults are eight compass directions, six layer slots, and a 64 × 96
native frame. These are starting conventions rather than a completed art format.
The Zod schemas reject fractional dimensions and offsets, unsupported directions,
and duplicate layer slots. Asset IDs are unique within a registry. Asset sources
are local `/assets/...png` or `/assets/...webp` paths with integer dimensions and
anchors; registry reads return copies to protect stored metadata.

The registry starts empty. Source artwork belongs in `apps/studio/public/assets`;
register metadata explicitly through `createAssetRegistry`. No sample character or
compositor is included. Both renderers return `{ status: 'scaffold', composedLayers: 0 }`
and leave their previews transparent even if given character layers.

Internal art uses transparency. The future final PNG export must use an exact
`#00FF00` background (RGBA `0,255,0,255`) and yellow direction labels (`#FFFF00`,
RGBA `255,255,0,255`). Pixel comparisons must use exact RGBA values, integer
positions, and native dimensions. Current tests validate the contracts and renderer
lifecycle with mocks; real GPU rendering and exported PNG pixel tests will be needed
when the compositor and export pipeline exist. No image processing or platform
specific graphics libraries are required at this stage.
