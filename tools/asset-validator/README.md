# Asset import and offline validation

Portable Node.js tools for reference import, image diagnostics, wardrobe fitting
contracts and generated cleanup. They are separate from runtime recipe planning.

- `pnpm reference:import` validates the eight retained heroine design references,
  produces RGBA staging and inspection reports, and preserves original files.
  See [reference import](../../docs/reference-import.md).
- `pnpm assets:clean --dry-run` reports disposable outputs. `pnpm assets:clean`
  removes staging, placeholders and test reports; add `--build-outputs` for
  workspace builds. Source artwork/references are never roots for cleanup, and
  symlink traversal is rejected before deletion. See
  [cleanup policy](../../docs/asset-cleanup.md).
- `wardrobe-compatibility.ts` checks independently authored facing/surface/coverage
  profiles against fitted garment pixels. Missing surfaces, wrong facings,
  empty masks and insufficient opaque coverage fail explicitly.
- `wardrobe-surface-fit.ts` composes authored surface alternatives and fitted
  underwear/outerwear, checks native geometry and rejects visible underwear
  when concealment is required. Its tests use abstract geometry, not approved art.

The heroine-specific hair/head/ear/face/body extraction and repair pipelines were
retired on `piusyikyu/alt`; their assets and tests remain in Git history.
No local image-generation job runner or production anatomy pipeline is implemented.

```bash
pnpm --filter @character-studio/asset-validator typecheck
pnpm --filter @character-studio/asset-validator build
pnpm exec vitest run tools/asset-validator/src
```
