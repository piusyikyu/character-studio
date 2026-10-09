# Character core

Platform-independent appearance contracts for MVP milestone 1. Core exports a
strict version-1 CharacterRecipe parser, authored anatomy presets, composable
human/elf/vampire ancestry traits, compatibility diagnostics, defaults, canonical
JSON serialization, and the eight directions/two native target specifications.

```ts
import {
  createCharacterRecipe, characterRecipeSchema,
  serializeCharacterRecipe, deserializeCharacterRecipe,
} from '@female-character-studio/core';

const recipe = createCharacterRecipe({
  ancestry: { primary: 'elf', secondary: 'vampire' },
  anatomy: { bodyPreset: 'slender', headShape: 'angular' },
  hair: { style: 'long-waves', colour: 'hair.silver' },
  eyes: { leftColour: 'eyes.blue', rightColour: 'eyes.crimson' },
});
const imported = deserializeCharacterRecipe(serializeCharacterRecipe(recipe));
characterRecipeSchema.parse(imported);
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

TypeScript excludes DOM and ambient Node types. ESLint disallows React, PixiJS,
Node built-ins, registry, renderer, and legacy character-engine imports. Core must
not decode images or own rendering. Read the architecture, asset specification,
and MVP documents before implementing contracts.

No image decoding, rendering, asset resolution or UI control is implemented here.
`packages/character-engine` remains the original working demo, whose Character
and DOM renderer contracts are not the specified CharacterRecipe. Do not re-export
that demo as core. Migrate its consumers when milestone 1 is implemented.
