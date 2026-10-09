# Core scaffold

Reserved for MVP milestone 1: versioned CharacterRecipe, Zod validation, visible
traits, anatomy, compatibility, and deterministic resolution models. No character
logic is implemented in this package yet.

TypeScript excludes DOM and ambient Node types. ESLint disallows React, PixiJS,
Node built-ins, registry, renderer, and legacy character-engine imports. Core must
not decode images or own rendering. Read the architecture, asset specification,
and MVP documents before implementing contracts.

`packages/character-engine` remains the original working demo, whose Character
and DOM renderer contracts are not the specified CharacterRecipe. Do not re-export
that demo as core. Migrate its consumers when milestone 1 is implemented.
