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
| `assets/source` | Versioned offline artwork, selected studies, masks and approval records |
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
pnpm assets:clean # Remove generated caches; preserve current face review and transparent references
pnpm hair:review # Prepare S/N modular hair draft inspection; human approval required
pnpm hair:review:profiles # Prepare independent E/W hair draft inspection
pnpm hair:review:front-diagonals # Prepare SE/SW reference/study/masked-reconstruction inspection
pnpm hair:review:front-diagonals:completion # Review approved SE/SW rear roots and connections
pnpm hair:review:back-diagonals # Prepare approved independent NE/NW rear hair
pnpm head:review:all # Compare all eight approved head fits and hair-free anatomy before body authoring
pnpm head:review:north # Review retained N full-back anatomy independently before ear separation
pnpm head:review # Review revision-5 S ear depth with coherent hair and unchanged N anatomy draft
pnpm head:review:v1 # Reproduce the initial S mismatch separately
pnpm head:review:v2 # Reproduce the approved S fit before temple/ear-mask repair
pnpm head:review:v3 # Reproduce rejected local seam patches separately
pnpm head:review:v4 # Reproduce the coherent hair fit before lower-ear correction
pnpm head:review:front-diagonals # Review revision-4 SW neck ownership and unchanged SE
pnpm head:review:front-diagonals:v3 # Reproduce the generally approved nose/jaw/neck fit with the abrupt hair fragment
pnpm head:review:front-diagonals:v2 # Reproduce the prior ear/SE-nose repair and SW fragment cleanup
pnpm head:review:front-diagonals:v1 # Reproduce the rejected visible-only ear/offset nose/noisy hair draft
pnpm head:review:back-diagonals # Review independent NE/NW posterior head/neck candidates with approved rear hair
pnpm ears:review # Review smaller S human-ear revision 2 against reference and accepted oversized-ear fit
pnpm ears:review:v1 # Reproduce the original exact ear separation separately
pnpm face:review:front-diagonals # Review revision-6 right-brow cleanup with the accepted complete SE left eye
pnpm face:review:front-diagonals:v5 # Reproduce the accepted complete left eye before local brow cleanup
pnpm face:review:front-diagonals:v4 # Reproduce the incomplete extraction-only eye predecessor
pnpm face:review:front-diagonals:v3 # Reproduce the rejected narrow far-eye extraction
pnpm face:review:front-diagonals:v2 # Reproduce the approved facial fit before far-eye ownership correction
pnpm face:review:front-diagonals:v1 # Reproduce the preceding facial fit with SE cheek tint
pnpm body:review # S revision-6 final local curl-spill pass over the qualified body/neck
pnpm body:review:v5 # Rebuild the preceding antialiased curl candidate with colour spill
pnpm body:review:v4 # Rebuild the mostly approved body/neck with the curl-edge nitpick
pnpm body:review:v3 # Rebuild the preceding single-joint shoulder/neck candidate
pnpm body:review:v2 # Rebuild the preceding daily bra/panties and hair-depth candidate
pnpm body:review:v1 # Rebuild the original body study
pnpm face:review:brows # Review complete native E/SE/SW/W brows with genuine foreground occlusion
pnpm face:review:profiles # Review independent E/W visible facial layers over approved profile anatomy
pnpm ears:review:profiles # Review new E/W ear-free root skin and exact separate-ear human fits
pnpm ears:review:north # Review separate N ears and new ear-free scalp roots
pnpm ears:review:back-diagonals # Review new NE/NW ear-free roots and exact posterior human fits
pnpm ears:review:front-diagonals # Review independent SE/SW ear-free contours and exact near-ear human fits
pnpm face:review # Review revision-11 unchanged S brows beneath restored foreground fringe
pnpm face:review:v1 # Reproduce the rejected reference-coordinate facial fit separately
pnpm face:review:v2 # Reproduce the rejected eye redesign on the broader head separately
pnpm face:review:v3 # Reproduce the preceding slimmer-face candidate and alignment presets
pnpm face:review:v4 # Reproduce the preceding head/ear fit and disconnected neck-side strips
pnpm face:review:v5 # Reproduce the approved S neck-side fit with unfinished eyebrows
pnpm face:review:v6 # Reproduce the rejected gapped/shortened native brow extraction
pnpm face:review:v7 # Reproduce the rejected fringe-crossing brow extraction
pnpm face:review:v8 # Reproduce the rejected abrupt-tail and sharp-transition fit
pnpm face:review:v9 # Reproduce the rejected thin-right and short-left brow fit
pnpm face:review:v10 # Reproduce the fuller brow candidate with excessive tail reveal
pnpm head:review:profiles # Review E/W local ear size/placement and visible-hair fit candidates
pnpm head:review:profiles:v1 # Reproduce the original profile hair mismatch separately
pnpm head:review:profiles:v2 # Reproduce the rejected large/misaligned profile ear fit
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
production T-pose or head/body fit. The [head/neck drafts](docs/modular-head.md)
provide S/N anatomy and the generally approved revision-5 S fit with known hair
noise. Independent E/W skin candidates now have a versioned local ear correction, native masks and comparison
outputs. Profile revision 1 exposed nose obstruction and E scalp exposure.
Revision 2 corrected facial/scalp exposure but its ears were rejected as too
large and misaligned. Revision 3 repairs the ears locally, preserving each
facing's visible reference ear pixels at native size and position with corrected
fringe ownership. Concealed ear surfaces and mask edges need review; hair hidden
by the standing body remains unfinished. Complete production heads and hair remain unfinished; approved
sources and S/N stay unchanged.

Independent SE/SW head drafts now include complete ear studies, a local SE
face/nose correction and manually masked SW face/neck fragment cleanup.
Revision 3 corrects the remaining SW nose offset and jaw/neck ownership with
native masks and a locally authored curl. SE's layers and assembled fit are
byte-identical to revision 2; approved source imagery remains unchanged.
Revision 3 has general standing-reference fit approval with abrupt SW neck hair
flagged. Revision 4 clears 157 duplicate foreground pixels already retained in
the rear behind skin. Revision 4 is approved for now; abrupt neck/shoulder hair
starts must be checked under the future body's actual occlusion. See the overview and before/after comparisons in
[modular-head.md](docs/modular-head.md).

Independent NE/NW posterior head/neck drafts are now reviewed separately with
their approved rear hair. The frontal fringe stays hidden and no eye, brow or
mouth layers are authored. Their standing-reference anatomy/hair fit is approved
in `back-diagonals-review-fit-v1.json`; actual body/clothing and production T-pose
fit remain unfinished. [Separate S human-ear components](docs/modular-ears.md)
now have native attachment patches and a concealed skin underlay awaiting review;
their human-specific head retention mask preserves the accepted S fit exactly.

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
