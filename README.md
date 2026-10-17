# Female Character Studio

A TypeScript pnpm workspace for a modular character editor with one versioned
CharacterRecipe and two independent asset-backed render targets: detailed
1024 × 1536 artwork and native 128 × 192 pixel sprites, each in eight facings.

The editor, asset planner, palettes and exporters work with synthetic modular
artwork. Production anatomy, outfit fitting and a complete game asset bundle
remain unfinished. Read [the product target](docs/character-vision.md),
[current handoff](docs/project-context.md), [architecture](docs/architecture.md),
[asset specification](docs/asset-spec.md) and [milestones](docs/mvp.md).

The alternative authoring direction starts with coherent complete anatomy
masters, then prepares compatible parts and material/shading maps. Old heroine
extraction studies and their dedicated repair tools have been removed from this
branch; the original eight design references remain. Git history and the local
`master` checkpoint `a8da310` retain the previous work.

## WSL2 Ubuntu setup

Keep the checkout and dependencies under `/home`, rather than `/mnt/c`.
Use Bash inside WSL2, Node.js 24 LTS and pnpm 10.34.6:

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

Open `http://localhost:5173` in the Windows browser. Playwright runs in WSL;
Chromium system dependencies may need `pnpm exec playwright install-deps chromium`.

## Workspace

| Location | Purpose |
| --- | --- |
| `apps/studio` | React/Vite/Tailwind/Zustand editor and native exports |
| `packages/core` | Recipe, traits, target-native anchors/planes and RenderPlan schemas |
| `packages/asset-registry` | Versioned manifests, compatibility and deterministic planning |
| `packages/renderer-detailed` | PixiJS composition of detailed artwork |
| `packages/renderer-pixel` | Deterministic integer RGBA composition of native pixel artwork |
| `packages/render-utils` | PNG codec, material palettes and export decoration |
| `tools/render-demo` | Synthetic asset generation, read-only demo and export verification |
| `tools/asset-validator` | Reference import, image audits, offline wardrobe checks and cleanup |
| `assets/references` | Original flattened design references and pinned import settings |
| `assets/source` | Future versioned authoring masters, parts and material maps |
| `assets/detailed`, `assets/pixel` | Independently prepared target-native asset families |
| `assets/staging` | Ignored, disposable previews and inspection outputs |

Packages are private workspace libraries. Core has no UI, renderer or platform
imports. The editor assembles prepared assets; it does not generate images.

## Commands

```bash
pnpm dev               # Generate temporary assets and start the editor
pnpm demo:assets       # Regenerate the synthetic catalog and native PNGs
pnpm demo:export       # Export the read-only demonstration
pnpm reference:import  # Audit/import the retained original design references
pnpm assets:clean --dry-run # Inspect generated cleanup without deleting
pnpm assets:clean      # Remove staging, previews, placeholders and test reports
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

For cleanup flags, use `pnpm assets:clean --dry-run` or
`pnpm assets:clean --build-outputs`. Cleanup never removes authoring sources,
original references, code or dependencies. Development/build commands regenerate
placeholder artwork. See [cleanup](docs/asset-cleanup.md),
[reference import](docs/reference-import.md), [studio](apps/studio/README.md) and
[render demo](tools/render-demo/README.md) for scope and limitations.
