import {
  BODY_PRESETS, CHEST_SIZES, HEIGHTS, SPECIES, HAIR_STYLES, HEAD_SHAPES,
  FACIAL_EXPRESSIONS, SKIN_TONES, HAIR_COLOURS, EYE_COLOURS, OUTFIT_COLOURS,
  ANATOMY_PRESETS, getAvailableVisibleTraits,
} from '@character-studio/core';
import type { Species, VisibleTrait } from '@character-studio/core';
import { useStudioStore } from './store';

export const optionLabel = (value: string): string => value.replace(/^(skin|hair|eyes|outfit)\./, '').replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
interface SelectProps<T extends string> { label: string; value: T; values: readonly T[]; onChange(value: T): void }
export function SelectField<T extends string>({ label, value, values, onChange }: SelectProps<T>) {
  if (values.length === 1) return <div className="field"><span>{label}</span><p className="fixed-value">{optionLabel(value)} · inherited</p></div>;
  return <label className="field"><span>{label}</span><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value as T)}>{values.map((item) => <option key={item} value={item}>{optionLabel(item)}</option>)}</select></label>;
}

export function CharacterControls({ disabled }: { disabled: boolean }) {
  const state = useStudioStore((current) => current);
  const { recipe, edit, setAncestry, setBody } = state;
  const available = getAvailableVisibleTraits(recipe.ancestry);
  function primary(value: Species) {
    const secondary = recipe.ancestry.secondary;
    setAncestry(secondary && secondary !== value ? { primary: value, secondary } : { primary: value });
  }
  function ears(value: VisibleTrait) {
    edit((current) => ({ ...current, visibleTraits: [value, ...current.visibleTraits.filter((trait) => trait === 'fangs')] }));
  }
  return <aside className="panel character-panel" aria-label="Character controls">
    <div className="panel-heading"><p className="eyebrow">01 / CHARACTER</p><h2>Shape & identity</h2></div>
    <fieldset disabled={disabled}>
      <section className="control-section"><h3>Ancestry</h3>
        <SelectField label="Primary ancestry" value={recipe.ancestry.primary} values={SPECIES} onChange={primary} />
        <label className="field"><span>Secondary ancestry</span><select aria-label="Secondary ancestry" value={recipe.ancestry.secondary ?? ''} onChange={(event) => setAncestry(event.target.value ? { primary: recipe.ancestry.primary, secondary: event.target.value as Species } : { primary: recipe.ancestry.primary })}>
          <option value="">None · single ancestry</option>{SPECIES.filter((species) => species !== recipe.ancestry.primary).map((species) => <option key={species} value={species}>{optionLabel(species)}</option>)}
        </select></label>
        <p className="hint">Hybrids inherit compatible ears and facial traits.</p>
      </section>
      <section className="control-section"><h3>Anatomy</h3>
        <SelectField label="Body build" value={recipe.anatomy.bodyPreset} values={BODY_PRESETS} onChange={setBody} />
        <div className="field-pair">
          <SelectField label="Height" value={recipe.anatomy.height} values={HEIGHTS} onChange={(height) => setBody(BODY_PRESETS.find((id) => ANATOMY_PRESETS[id].height === height)!)} />
          <SelectField label="Chest preset" value={recipe.anatomy.chestSize} values={CHEST_SIZES} onChange={(chest) => setBody(BODY_PRESETS.find((id) => ANATOMY_PRESETS[id].chestSize === chest)!)} />
        </div>
        <p className="hint">Authored presets link build, height and chest: balanced / average / medium or slender / tall / small. Clothes follow the fit.</p>
      </section>
      <section className="control-section"><h3>Hair & face</h3>
        <SelectField label="Hair length / style" value={recipe.hair.style} values={HAIR_STYLES} onChange={(style) => edit((current) => ({ ...current, hair: { ...current.hair, style } }))} />
        <SelectField label="Head shape" value={recipe.anatomy.headShape} values={HEAD_SHAPES} onChange={(headShape) => edit((current) => ({ ...current, anatomy: { ...current.anatomy, headShape } }))} />
        <SelectField label="Expression" value={recipe.expression} values={FACIAL_EXPRESSIONS} onChange={(expression) => edit((current) => ({ ...current, expression }))} />
        <SelectField label="Ear shape" value={recipe.visibleTraits.includes('pointed-ears') ? 'pointed-ears' : 'rounded-ears'} values={available.filter((trait) => trait !== 'fangs')} onChange={ears} />
        {available.includes('fangs') ? <label className="check-field"><input type="checkbox" checked={recipe.visibleTraits.includes('fangs')} onChange={(event) => edit((current) => ({ ...current, visibleTraits: event.target.checked ? [...current.visibleTraits, 'fangs'] : current.visibleTraits.filter((trait) => trait !== 'fangs') }))} />Visible fangs</label> : <p className="hint">Fangs are available with vampire ancestry.</p>}
      </section>
      <section className="control-section"><h3>Outfit selection</h3>
        <div className="outfit-card"><strong>Starter outfit</strong><span>Selected · {recipe.outfit.fit} fit</span></div>
        <p className="hint">One outfit is available in this catalog. Both body fits have separate front and rear layers.</p>
      </section>
    </fieldset>
  </aside>;
}

export function PaletteControls({ disabled }: { disabled: boolean }) {
  const { recipe, edit } = useStudioStore((state) => state);
  return <fieldset disabled={disabled} className="control-section"><legend>Material palettes</legend>
    <SelectField label="Skin palette" value={recipe.skinTone} values={SKIN_TONES} onChange={(skinTone) => edit((current) => ({ ...current, skinTone }))} />
    <SelectField label="Hair palette" value={recipe.hair.colour} values={HAIR_COLOURS} onChange={(colour) => edit((current) => ({ ...current, hair: { ...current.hair, colour } }))} />
    <div className="field-pair">
      <SelectField label="Left eye palette" value={recipe.eyes.leftColour} values={EYE_COLOURS} onChange={(leftColour) => edit((current) => ({ ...current, eyes: { ...current.eyes, leftColour } }))} />
      <SelectField label="Right eye palette" value={recipe.eyes.rightColour} values={EYE_COLOURS} onChange={(rightColour) => edit((current) => ({ ...current, eyes: { ...current.eyes, rightColour } }))} />
    </div>
    <SelectField label="Outfit palette" value={recipe.outfit.colour} values={OUTFIT_COLOURS} onChange={(colour) => edit((current) => ({ ...current, outfit: { ...current.outfit, colour } }))} />
    <p className="hint">Palette regions preserve outlines and unrelated materials.</p>
  </fieldset>;
}
