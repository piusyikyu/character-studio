import { describe, expect, it } from 'vitest';
import { createCharacterRecipe, DIRECTIONS, RENDER_TARGETS, serializeCharacterRecipe } from '@character-studio/core';
import { createManifestRegistry } from '@character-studio/asset-registry';
import { createSyntheticCatalog } from '@character-studio/asset-registry/testing';
import { createStudioStore, PRESETS_STORAGE_KEY } from './store';
import type { PresetStorage } from './store';

const registry = createManifestRegistry(createSyntheticCatalog());
function connectedStore() {
  const store = createStudioStore();
  store.getState().connectCatalog(registry.catalogVersion, (recipe) => {
    for (const target of RENDER_TARGETS) for (const direction of DIRECTIONS) registry.resolve(recipe, target, direction);
  });
  return store;
}
describe('editor workflows', () => {
  it('edits authored anatomy and hybrid traits atomically, rejects incompatible changes, and preserves view through history', () => {
    const store = connectedStore(); const actions = store.getState();
    actions.setView({ target: 'pixel', direction: 'NW', compare: true, zoom: 3, background: 'green' });
    actions.setBody('slender');
    actions.setAncestry({ primary: 'elf', secondary: 'vampire' });
    const character = store.getState().recipe;
    expect(character.anatomy).toMatchObject({ bodyPreset: 'slender', height: 'tall', chestSize: 'small' });
    expect(character.outfit.fit).toBe('slender'); expect(character.visibleTraits).toEqual(['pointed-ears', 'fangs']);
    expect(actions.edit((recipe) => ({ ...recipe, anatomy: { ...recipe.anatomy, chestSize: 'medium' } }))).toBe(false);
    expect(store.getState().recipe).toBe(character); expect(store.getState().past).toHaveLength(2);
    expect(store.getState().warning).toContain('requires chestSize');
    actions.undo(); expect(store.getState().recipe.ancestry.primary).toBe('human');
    actions.redo(); expect(store.getState().recipe).toEqual(character);
    actions.undo(); actions.edit((recipe) => ({ ...recipe, expression: 'stern' }));
    expect(store.getState().future).toHaveLength(0);
    expect(store.getState()).toMatchObject({ target: 'pixel', direction: 'NW', compare: true, zoom: 3, background: 'green' });
    const last = store.getState().recipe;
    store.getState().connectCatalog('limited.v1', () => { throw new Error('Missing long-waves assets for pixel NW.'); });
    expect(actions.edit((recipe) => ({ ...recipe, hair: { ...recipe.hair, style: 'long-waves' } }))).toBe(false);
    expect(store.getState().recipe).toBe(last); expect(store.getState().warning).toContain('Missing long-waves');
  });

  it('round-trips catalog-pinned JSON and local presets, replays seeded generation, and keeps the character on import/storage failures', () => {
    const store = connectedStore(); const actions = store.getState();
    const items = new Map<string, string>();
    const storage: PresetStorage = { getItem: (key) => items.get(key) ?? null, setItem: (key, value) => { items.set(key, value); } };
    actions.setSeed('my-reproducible-character'); actions.randomize();
    const random = serializeCharacterRecipe(store.getState().recipe);
    const document = actions.exportJson(); expect(JSON.parse(document).catalogVersion).toBe(registry.catalogVersion);
    expect(actions.savePreset(' Hybrid ', storage)).toBe(true);
    actions.reset(); actions.randomize(); expect(serializeCharacterRecipe(store.getState().recipe)).toBe(random);
    actions.reset(); expect(actions.importJson(document)).toBe(true);
    expect(serializeCharacterRecipe(store.getState().recipe)).toBe(random);
    const reopened = connectedStore(); reopened.getState().hydratePresets(storage);
    expect(reopened.getState().loadPreset('Hybrid')).toBe(true); expect(serializeCharacterRecipe(reopened.getState().recipe)).toBe(random);
    const previous = store.getState().recipe;
    expect(actions.importJson(document.replace(registry.catalogVersion, 'missing.v99'))).toBe(false);
    expect(store.getState().warning).toContain('matching asset catalog');
    expect(actions.importJson('{broken')).toBe(false); expect(store.getState().recipe).toBe(previous);
    expect(actions.importJson(JSON.stringify(createCharacterRecipe()))).toBe(true);
    const failedStorage: PresetStorage = { getItem: () => 'broken', setItem: () => { throw new Error('Storage is full'); } };
    expect(actions.savePreset('No space', failedStorage)).toBe(false); expect(store.getState().presets).toHaveLength(1);
    actions.hydratePresets(failedStorage); expect(store.getState().warning).toContain('Could not read saved presets');
    actions.deletePreset('Hybrid', storage); expect(items.get(PRESETS_STORAGE_KEY)).toBe('[]');
  });
});
