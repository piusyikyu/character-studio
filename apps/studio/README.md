# Interactive Character Studio

From the workspace root in WSL Ubuntu, run `nvm use` and `pnpm dev`, then open
`http://localhost:5173`. The command generates the versioned temporary PNG catalog
before starting Vite. `pnpm build` also includes generated assets in the app output;
`pnpm --filter @character-studio/app preview` serves that build.

The React application edits the shared `CharacterRecipe` through a Zustand store.
The registry validates both targets/all eight facings before accepting recipe
changes. The detailed preview uses PixiJS v8; the pixel preview uses the existing
integer RGBA compositor. Native RGBA is presented on transparent canvases, with
integer nearest-neighbour enlargement for pixel previews. Stale asynchronous
results are discarded when recipe, target, facing or comparison changes.

- Left: primary/secondary human, elf or vampire ancestry, linked authored
  build/height/chest presets, short/long hair, head/expression and inherited ears/fangs.
  There is one starter outfit; its selected fit updates with the body automatically.
- Centre: detailed/pixel, eight independently authored facings, S/N comparison,
  target-native size, zoom and transparency-grid/dark/green preview backgrounds.
- Right: independent skin/hair/eye/outfit palettes, ordered visible layer metadata,
  compatibility diagnostics, PNG/sheet/JSON exports and local preset save/load/delete.

Undo/redo remembers up to 100 recipe edits and preserves view settings. It includes
example loading, randomization, reset and JSON/preset imports. Buttons and
Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y work outside editable inputs. A new edit
clears redo; identical recipes do not add history. The seed is a string, so the
same seed reproduces the same recipe using the core's generation version.

Presets are stored under `character-studio.presets.v1` in localStorage. Saving the
same name replaces it. Exported JSON has `{ schemaVersion: 1, catalogVersion,
recipe }`; the inner recipe is the canonical core schema. Imports accept that
strict catalog-pinned envelope or a bare core recipe, validate before applying,
and reject mismatched catalog versions. File and pasted JSON imports are supported.
Storage or import failures leave the current character intact and show a warning.

Standalone PNG export renders the current target/facing at 1024×1536 or 128×192.
Pixel sheets are 512×384, ordered N NE E SE / S SW W NW, regardless of the current
preview target. All exports default to pure green and yellow direction labels;
transparent background is an explicit option. Zoom and preview background are
view-only. Exports snapshot the current recipe and never resize native output.
Select each facing for standalone outputs; `pnpm demo:export` remains a separate
fixed-recipe batch demonstration, not an export of the current editor state.

Unavailable manifest combinations are rejected with actionable diagnostics and
keep the previous character. Missing/corrupt image sources clear the whole preview
and disable PNG downloads, avoiding partial characters. Restore the asset package
and use Retry preview; missing catalog errors offer Reload assets. Failed source
loads are evicted from the cache so retries can recover.

Two public store integration workflows cover atomic changes/history and
seed/save/load/failure handling. Four Playwright editor workflows exercise the
real browser controls, native downloads, local persistence and missing-asset
recovery. Existing renderer workflows retain exact RGBA and direction/plane checks.
Production anatomy and garment approval remain milestone 5.
