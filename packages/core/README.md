# Character core

Platform-independent appearance contracts for MVP milestone 1. Core exports a
strict version-1 CharacterRecipe parser, authored anatomy presets, composable
human/elf/vampire ancestry traits, compatibility diagnostics, defaults, canonical
JSON serialization, and the eight directions/two native target specifications.
It also provides seeded random generation and six validated example recipes.

```ts
import {
  createCharacterRecipe, characterRecipeSchema,
  serializeCharacterRecipe, deserializeCharacterRecipe,
  generateRandomCharacter, EXAMPLE_CHARACTER_RECIPES,
} from '@character-studio/core';

const recipe = createCharacterRecipe({
  ancestry: { primary: 'elf', secondary: 'vampire' },
  anatomy: { bodyPreset: 'slender', headShape: 'angular' },
  hair: { style: 'long-waves', colour: 'hair.silver' },
  eyes: { leftColour: 'eyes.blue', rightColour: 'eyes.crimson' },
});
const imported = deserializeCharacterRecipe(serializeCharacterRecipe(recipe));
characterRecipeSchema.parse(imported);
const random = generateRandomCharacter('my-character-seed');
const example = EXAMPLE_CHARACTER_RECIPES.find(({ id }) => id === 'elf-vampire');
```

## Recipe contract

Recipes describe appearance and contain no target, direction, image paths or
layout offsets. Every field is required when parsing imported data; unknown keys
and unsupported schema versions fail. `createCharacterRecipe` is the typed
partial-options factory that supplies defaults and validates the resulting recipe.
The schema infers the exported `CharacterRecipe` type. Parsed recipes, nested
objects and trait arrays are frozen; edits should construct a new recipe.

- `schemaVersion`: exactly `1`.
- `anatomy`: family `female-humanoid-v1`, body preset, chest size, proportions,
  height and head shape. Head choices are `soft-oval` and `angular`.
- `ancestry`: primary human/elf/vampire, optionally one different secondary species.
- `visibleTraits`: inherited semantic choices, not percentages or pixel blending.
- `hair`: `short-bob`/`long-waves` and a hair palette ID.
- `skinTone`: a skin palette ID; `expression`: neutral/stern.
- `eyes`: independent `leftColour` and `rightColour` eye palette IDs.
- `outfit`: `starter-outfit`, body-matching `fit`, and outfit palette ID.

Palette IDs are scoped semantic selections (e.g. `hair.silver` or `eyes.blue`),
not RGB values or asset filenames. Material ramps, approved image availability,
catalog versions and RenderPlan construction belong to subsequent milestones.

## Anatomy and compatibility

| Body preset | Chest | Proportions | Height |
| --- | --- | --- | --- |
| `balanced` | `medium` | `balanced` | `average` |
| `slender` | `small` | `slender` | `tall` |

Height is a discrete authored category, not centimetres or a scale factor. Changing
`bodyPreset` in the factory derives its chest/proportions/height and the corresponding
outfit fit. Explicitly contradictory overrides fail rather than silently adjusting
body geometry. The single starter outfit has semantic fit selections for both
presets; this does not claim that any matching artwork has been authored yet.

Human ancestry provides rounded ears, elf ancestry pointed ears, and vampire
ancestry rounded ears/fangs. A hybrid may select traits from either ancestor,
but exactly one ear shape is required and duplicates are rejected. Fangs are
optional if vampire ancestry exists and forbidden otherwise. Defaults prefer
pointed ears if inherited, plus fangs if inherited. Explicit choices may omit
optional traits without changing ancestry. Skin/hair/eye palettes are independent
of ancestry and never blended.

`getRecipeCompatibilityIssues` accepts structurally validated recipe data and returns
actionable codes, paths and messages for body/fit/trait mismatches. Use
`characterRecipeSchema.safeParse` for untrusted data; it checks structure and
compatibility and attaches compatibility codes to custom Zod issue parameters.

Serialization validates first and emits compact canonical JSON with schema key
order and canonical trait order. Deserialization validates again, preserving all
appearance choices; malformed JSON raises SyntaxError and invalid recipes raise
ZodError. No migration is performed for an unsupported version.

## Deterministic generation and examples

`generateRandomCharacter(seed)` accepts any string (including empty/Unicode strings)
or safe integer, including zero and negative values. Fractional, non-finite and
unsafe numeric seeds and unsupported runtime types fail explicitly. Numeric `42`
and string `"42"` use distinct seed namespaces. Each call owns its generator state;
no clock, platform API or `Math.random` is used.

`RANDOM_GENERATION_VERSION` is `2`: a tagged UTF-16 seed is hashed with 32-bit
FNV-1a arithmetic and drives a Mulberry-style sequence. Option order and draw order
are part of this generation version and guarded by a fixed regression recipe.
Version 2 uses the renamed `character-studio` seed prefix, changing generated
appearances for existing seeds. Changes to these rules require a deliberate
generation-version change. Seeds are
not stored in CharacterRecipe; serialized appearance reproduces the selected
identity without requiring random generation later. Target/direction/catalog
availability is never guessed by this generator.

Generation chooses single-species or two-species ancestry, compatible ear/fang
traits, one authored body preset, and independent material choices. Matching chest,
proportions, height and outfit fit are derived by the same validated factory used
for hand-authored recipes.

`EXAMPLE_CHARACTER_RECIPES` contains immutable `{ id, recipe }` entries:
`human-balanced`, `elf-slender`, `vampire-balanced`, `human-elf`, `elf-vampire`, and
`human-vampire`. Every example validates and round-trips through recipe JSON. They
are semantic recipe fixtures, not assets or approval records.

## Testing approach

The six tests in `src/core.integration.test.ts` exercise the public API as workflows:
creating and saving/loading a hybrid appearance, using the example recipes,
rejecting invalid imports, returning actionable compatibility diagnostics, and
reproducing valid seeded characters. They replace repetitive helper/enum unit tests.

Prefer Playwright E2E tests for user-visible editor behavior as it becomes available.
The studio now edits this CharacterRecipe directly. Browser workflows cover live
controls, history, seed replay and JSON import/export; these six tests retain the
platform-independent API validation and compatibility boundaries.

TypeScript excludes DOM and ambient Node types. ESLint disallows React, PixiJS,
Node built-ins, registry, renderer, and legacy character-engine imports. Core must
not decode images or own rendering. Read the architecture, asset specification,
and MVP documents before implementing contracts.

No image decoding, rendering, asset resolution or UI control is implemented here.
Core also exports the version-1 `renderPlanSchema`/`RenderPlan`, thirteen rig
landmarks, native geometry and material-map schemas, and direction-dependent
plane ordering. Plans contain only visible, concretely positioned source cells;
their immutable metadata includes palette assignments and optional occlusion
masks. Parsing enforces target dimensions/pose, anchor placement, integer pixel
coordinates, bounds, draw order and hidden rear eyes/front-only details. Registry
resolution lives in `packages/asset-registry`. Both renderers now consume these
plans with temporary native placeholder assets; see `tools/render-demo/README.md`.

`packages/character-engine` remains the original working demo, whose Character
and DOM renderer contracts are not the specified CharacterRecipe. Do not re-export
that demo as core. The interactive editor has migrated to CharacterRecipe and RenderPlan; the legacy
packages remain available independently.
