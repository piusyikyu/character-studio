# Asset registry and composition planner

MVP milestone 2 provides version-1 manifest/catalog parsers, indexed manifest and
rig-profile lookups, coverage diagnostics and immutable RenderPlans. The new API
uses `@character-studio/core` and Zod; it performs no file I/O, React work, PixiJS
work or image rendering. The original `createAssetRegistry` API is preserved in
`src/legacy.ts` for the existing demo; new code uses `createManifestRegistry`.

```ts
import { createCharacterRecipe } from '@character-studio/core';
import { createManifestRegistry, resolveRenderPlan } from '@character-studio/asset-registry';
import { createSyntheticCatalog } from '@character-studio/asset-registry/testing';

const registry = createManifestRegistry(createSyntheticCatalog());
const recipe = createCharacterRecipe({
  ancestry: { primary: 'elf', secondary: 'vampire' },
  hair: { style: 'long-waves', colour: 'hair.silver' },
});
const plan = resolveRenderPlan(registry, recipe, 'pixel', 'NE');
console.log(plan.layers); // ordered cells; no eyes or front-only details
console.log(registry.coverageIssues()); // [] for the complete synthetic catalog
```

## Versioned data

`assetManifestSchema` validates `schemaVersion: 1`, stable unique `id`, positive
`assetVersion`, `status` (`draft`/`published`), category, compatible rigs/bodies,
required/excluded visible traits, material slots and target-native variants.
Variant keys explicitly declare supported targets; each has its required pose
and a direction-to-frame-list table. Frame IDs are unique within each facing.

Categories cover base bodies/body variants, heads/facial features, ears, horns,
wings, tails, hair, outfits and outfit pieces. One manifest can contain multiple
draw planes, such as front/rear hair or separate outfit pieces. Current recipes
do not select horns/wings/tails; these categories support explicit catalog
composition without inventing new ancestry choices or changing CharacterRecipe.

Each frame declares a package-relative PNG, native dimensions, plane/local order,
visibility, attachment landmark, image-local origin and native offset. Indexed
material maps declare native dimensions and index/material/shade regions. Index
zero is reserved for unlinked pixels; outlines need not join a palette region.
Optional occlusion masks retain source references and matching native dimensions.
No scale, rotation or mirror fields are accepted by these strict schemas.

`assetCatalogSchema` wraps `schemaVersion: 1`, a pinned `catalogVersion`, unique
manifests, native rig profiles and unique semantic bindings. Rig profiles are keyed
by rig/body/target (pose is fixed by target), with all thirteen named anchors in
each declared facing. Published manifests must declare all eight facings; drafts
can be incomplete for authoring and are reported by `coverageIssues()`.

## Resolution and diagnostics

`recipeAssetKeys()` derives explicit required selections:

- `body.<bodyPreset>`, `head.<headShape>`, `eyes`, `face.<expression>`
- `ears.<earTrait>`, `hair.<style>`, `outfit.<id>.<fit>`
- `trait.fangs` when fangs are selected

Each catalog binding maps one selection to one or more explicit asset IDs. Outfit
bindings can include fitted torso/back/front pieces; adding an asset to the
catalog alone never selects it. There is no arbitrary candidate selection or
fallback to another body, target or facing. Required traits must be present;
excluded traits must be absent. Ancestry without a selected visible trait does
not satisfy a requirement.

`resolve()`/`resolveRenderPlan()` validates the recipe, binding/manifests, target,
body/trait compatibility, all eight facings for each selected target and the native
rig profile, then computes `position = rigAnchor - assetOrigin + offset`.
`hidden` frames are omitted; `front-only` frames are omitted in N/NE/NW. Eyes are
forbidden in those rear facings. E/W and diagonals always use their own declared
references. Empty frame lists explicitly declare a hidden part, whereas omitted
direction keys are errors. Explicit profile visibility preserves eye-side identity.

Layers sort by core's direction-specific plane table, then local order, asset ID
and frame ID using code-point comparisons. Plan schema validation checks native
geometry/bounds, integer pixel coordinates, material assignments, mask/map
dimensions, visibility and draw order. Palette assignments come only from the
recipe and mapped material roles, including independent left/right eyes.
Plans and exposed parsed metadata are deeply frozen, serializable and deterministic
regardless of catalog insertion order.

`AssetPlanningError.issues` contains codes, paths and actionable messages for
invalid data, missing selections/assets/targets/facings/rigs, incompatible assets,
missing PNG sources and invalid plan geometry. `get(id)` and `list({ category,
rig, bodyPreset, target, pose, direction })` expose immutable lookup results.

An external loader/auditor may supply `{ availableSources: [...] }` to check that
every planned sprite/map/mask exists in its inventory. Without an inventory the
planner validates references and declared dimensions, not physical PNG existence,
decoded dimensions, alpha or pixels. Image audits and visual acceptance belong to
later tooling/rendering work.

## Synthetic coverage

`src/testing/synthetic-catalog.ts` contains metadata fixtures for all categories,
both targets, both bodies, eight facings and every current recipe choice. Its PNG
references are intentionally fictional. No artwork or compositor is included.

Seven public-API integration tests exercise complete recipe-to-plan workflows,
anchors/baselines, direction-specific draw order/visibility, palette assignment,
compatibility diagnostics and missing/invalid data. The legacy tests remain for
the preserved demo. Browser coverage of this planner awaits editor integration.
