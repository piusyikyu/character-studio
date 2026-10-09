import { z } from 'zod';

export const SPECIES = ['human', 'elf', 'vampire'] as const;
export const VISIBLE_TRAITS = ['rounded-ears', 'pointed-ears', 'fangs'] as const;
export const speciesSchema = z.enum(SPECIES);
export const visibleTraitSchema = z.enum(VISIBLE_TRAITS);
export type Species = z.infer<typeof speciesSchema>;
export type VisibleTrait = z.infer<typeof visibleTraitSchema>;

export const ancestrySchema = z.strictObject({
  primary: speciesSchema,
  secondary: speciesSchema.optional(),
}).superRefine((ancestry, ctx) => {
  if (ancestry.primary === ancestry.secondary) {
    ctx.addIssue({ code: 'custom', path: ['secondary'], message: 'Secondary ancestry must differ from primary ancestry; omit it for a single species.' });
  }
}).readonly();

export type Ancestry = z.infer<typeof ancestrySchema>;

export const SPECIES_TRAITS: Readonly<Record<Species, readonly VisibleTrait[]>> = Object.freeze({
  human: Object.freeze(['rounded-ears'] as const),
  elf: Object.freeze(['pointed-ears'] as const),
  vampire: Object.freeze(['rounded-ears', 'fangs'] as const),
});

export function getAvailableVisibleTraits(input: Ancestry): readonly VisibleTrait[] {
  const ancestry = ancestrySchema.parse(input);
  const inherited = new Set<VisibleTrait>(SPECIES_TRAITS[ancestry.primary]);
  if (ancestry.secondary) SPECIES_TRAITS[ancestry.secondary].forEach((trait) => inherited.add(trait));
  return Object.freeze(VISIBLE_TRAITS.filter((trait) => inherited.has(trait)));
}

// Defaults prefer inherited pointed ears over rounded ears; explicit selections
// may use either supported ear shape. Fangs are optional when vampire ancestry exists.
export function resolveAncestryTraits(input: Ancestry): readonly VisibleTrait[] {
  const available = getAvailableVisibleTraits(input);
  const ears: VisibleTrait = available.includes('pointed-ears') ? 'pointed-ears' : 'rounded-ears';
  return Object.freeze(available.includes('fangs') ? [ears, 'fangs'] : [ears]);
}
