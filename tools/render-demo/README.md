# Placeholder renderer demonstration

Run commands in Ubuntu under WSL2 with Node 24/NVM and pnpm.

```bash
pnpm install --frozen-lockfile
pnpm demo:assets
pnpm dev
```

Open **http://localhost:5173/render-demo.html**. The read-only page shows one
elf/vampire recipe in all eight facings for both native targets. Download links
provide eight 1024 × 1536 detailed PNGs, eight 128 × 192 pixel PNGs, and the
labelled 512 × 384 pixel sheet. Previews use internal transparent images; downloads
use pure green and yellow labels. Pixel previews use integer 2× nearest display.
The original editor at `/` is unchanged; there are no character-creator controls.

For headless exports with Chromium installed:

```bash
pnpm test:e2e:install
pnpm demo:export
```

This generates fixtures, starts a temporary Vite server at port 5174, renders with
real Chromium/WebGL, saves 17 PNG exports and `demo.png` to `artifacts/render-demo`,
then closes the browser/server. Source and output artifacts are reproducible and
ignored by Git; the tracked native authoring code is `src/placeholders.ts`.
Run `pnpm verify` and `pnpm test:e2e` to verify the workspace and real browser paths.

## Temporary assets

The generator writes 864 PNG layers/material maps to the reserved generated paths
`assets/detailed/placeholder-v1` and `assets/pixel/placeholder-v1`, plus a versioned
catalog in `assets/placeholder-v1`. It copies those assets into the app's generated
public directory so the demo also builds as a static page. It never writes approved
source artwork. The generation command owns these temporary directories.

Detailed T-poses and pixel idle poses have separate native dimension/landmark
tables. Each facing has its own image references, positions and geometric features;
there is no downsampling, rotation or mirroring. Discrete body/head/hair/face choices
are authored as modular cells with transparent backgrounds and indexed maps.
Rear eyes/front-only details are absent from plans, profile eyes retain side
identity, and rear clothing/hair have distinct depth ordering. These schematic
shapes exercise the pipeline; they are not approved anatomical or clothing artwork.

Three API integration tests cover exact pixel RGBA, opacity, masks, palette
isolation, nearest display, eight-facing exports and byte-correct sheet placement.
Two renderer E2E workflows use actual Pixi/WebGL and PNGs to verify native sizes,
bounds, front/back visibility, depth, directional positions, palette isolation,
readback orientation/alpha, repeatable export and working download links.
