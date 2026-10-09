import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import {
  ANATOMY_PRESETS, characterRecipeSchema, createCharacterRecipe,
  deserializeCharacterRecipe, generateRandomCharacter, resolveAncestryTraits,
  serializeCharacterRecipe, directionSchema, renderTargetSchema,
} from '@character-studio/core';
import type { Ancestry, BodyPresetId, CharacterRecipe, Direction, RenderTarget } from '@character-studio/core';

export const PRESETS_STORAGE_KEY = 'character-studio.presets.v1';
const HISTORY_LIMIT = 100;
export interface SavedPreset { name: string; json: string }
export interface PresetStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }

export function describeError(error: unknown): string {
  if (error && typeof error === 'object' && 'issues' in error && Array.isArray(error.issues)) {
    return error.issues.map((issue: { path?: unknown[]; message?: string }) => `${issue.path?.join('.') || 'Character'}: ${issue.message}`).join('\n');
  }
  return error instanceof Error ? [error.message, error.cause ? describeError(error.cause) : ''].filter(Boolean).join('\n') : String(error);
}

/** Save documents pin the catalog; bare core recipes remain accepted imports. */
export function serializePreset(recipe: CharacterRecipe, catalogVersion: string): string {
  return JSON.stringify({ schemaVersion: 1, catalogVersion, recipe: JSON.parse(serializeCharacterRecipe(recipe)) }, null, 2);
}
export function parsePreset(json: string, catalogVersion: string): CharacterRecipe {
  const value: unknown = JSON.parse(json);
  if (value && typeof value === 'object' && 'recipe' in value) {
    if (!('schemaVersion' in value) || value.schemaVersion !== 1 || !('catalogVersion' in value) || typeof value.catalogVersion !== 'string' || Object.keys(value).some((key) => !['schemaVersion', 'catalogVersion', 'recipe'].includes(key))) {
      throw new Error('Unsupported preset document. Expected schemaVersion 1, catalogVersion and recipe.');
    }
    if (value.catalogVersion !== catalogVersion) throw new Error(`Preset requires catalog ${value.catalogVersion}; the loaded catalog is ${catalogVersion}. Load the matching asset catalog.`);
    return characterRecipeSchema.parse(value.recipe);
  }
  return deserializeCharacterRecipe(json);
}

export interface StudioState {
  recipe: CharacterRecipe;
  past: readonly CharacterRecipe[];
  future: readonly CharacterRecipe[];
  target: RenderTarget;
  direction: Direction;
  compare: boolean;
  zoom: number;
  background: 'checker' | 'dark' | 'green';
  seed: string;
  warning: string | null;
  catalogVersion: string | null;
  presets: readonly SavedPreset[];
  applyRecipe(value: unknown): boolean;
  edit(update: (recipe: CharacterRecipe) => unknown): boolean;
  setAncestry(ancestry: Ancestry): void;
  setBody(preset: BodyPresetId): void;
  setView(view: Partial<Pick<StudioState, 'target' | 'direction' | 'compare' | 'zoom' | 'background'>>): void;
  setSeed(seed: string): void;
  randomize(): void;
  undo(): void;
  redo(): void;
  reset(): void;
  setWarning(warning: string | null): void;
  connectCatalog(version: string, validate: (recipe: CharacterRecipe) => void): void;
  disconnectCatalog(): void;
  importJson(json: string): boolean;
  exportJson(): string;
  hydratePresets(storage: PresetStorage): void;
  savePreset(name: string, storage: PresetStorage): boolean;
  loadPreset(name: string): boolean;
  deletePreset(name: string, storage: PresetStorage): void;
}

export function createStudioStore() {
  let validateAssets: ((recipe: CharacterRecipe) => void) | undefined;
  return createStore<StudioState>()((set, get) => ({
    recipe: createCharacterRecipe(), past: [], future: [], target: 'detailed', direction: 'S',
    compare: false, zoom: 2, background: 'checker', seed: 'studio-1', warning: null,
    catalogVersion: null, presets: [],
    applyRecipe(value) {
      try {
        const recipe = characterRecipeSchema.parse(value);
        validateAssets?.(recipe);
        const current = get();
        if (serializeCharacterRecipe(recipe) === serializeCharacterRecipe(current.recipe)) { set({ warning: null }); return true; }
        set({ recipe, past: [...current.past, current.recipe].slice(-HISTORY_LIMIT), future: [], warning: null });
        return true;
      } catch (error) { set({ warning: `Change was not applied. ${describeError(error)}` }); return false; }
    },
    edit(update) {
      try { return get().applyRecipe(update(get().recipe)); }
      catch (error) { set({ warning: `Change was not applied. ${describeError(error)}` }); return false; }
    },
    setAncestry(ancestry) {
      get().edit((recipe) => ({ ...recipe, ancestry, visibleTraits: resolveAncestryTraits(ancestry) }));
    },
    setBody(preset) {
      get().edit((recipe) => ({ ...recipe, anatomy: { ...recipe.anatomy, ...ANATOMY_PRESETS[preset] }, outfit: { ...recipe.outfit, fit: preset } }));
    },
    setView(view) {
      set({ ...view, ...(view.target ? { target: renderTargetSchema.parse(view.target) } : {}), ...(view.direction ? { direction: directionSchema.parse(view.direction) } : {}), ...(view.zoom !== undefined ? { zoom: Math.max(1, Math.min(4, Math.round(view.zoom))) } : {}) });
    },
    setSeed: (seed) => set({ seed }),
    randomize() { get().applyRecipe(generateRandomCharacter(get().seed)); },
    undo() {
      const { past, recipe, future } = get(); const previous = past.at(-1);
      if (!previous) return;
      try { validateAssets?.(previous); set({ recipe: previous, past: past.slice(0, -1), future: [recipe, ...future], warning: null }); }
      catch (error) { set({ warning: describeError(error) }); }
    },
    redo() {
      const { past, recipe, future } = get(); const next = future[0];
      if (!next) return;
      try { validateAssets?.(next); set({ recipe: next, past: [...past, recipe].slice(-HISTORY_LIMIT), future: future.slice(1), warning: null }); }
      catch (error) { set({ warning: describeError(error) }); }
    },
    reset() { get().applyRecipe(createCharacterRecipe()); },
    setWarning: (warning) => set({ warning }),
    connectCatalog(version, validate) { validateAssets = validate; set({ catalogVersion: version }); },
    disconnectCatalog() { validateAssets = undefined; set({ catalogVersion: null }); },
    importJson(json) {
      try {
        const version = get().catalogVersion;
        if (!version) throw new Error('Wait for the asset catalog before importing a character.');
        return get().applyRecipe(parsePreset(json, version));
      } catch (error) { set({ warning: `Import was not applied. ${describeError(error)}` }); return false; }
    },
    exportJson() {
      const { recipe, catalogVersion } = get();
      if (!catalogVersion) throw new Error('The asset catalog is not ready.');
      return serializePreset(recipe, catalogVersion);
    },
    hydratePresets(storage) {
      try {
        const raw = storage.getItem(PRESETS_STORAGE_KEY);
        if (!raw) return;
        const values: unknown = JSON.parse(raw);
        if (!Array.isArray(values) || values.some((item: unknown) => !item || typeof item !== 'object' || !('name' in item) || typeof item.name !== 'string' || !('json' in item) || typeof item.json !== 'string') || new Set(values.map((item: SavedPreset) => item.name)).size !== values.length) throw new Error('Saved presets are malformed. Import a valid character JSON or save a new preset.');
        set({ presets: values as SavedPreset[] });
      } catch (error) { set({ warning: `Could not read saved presets. ${describeError(error)}` }); }
    },
    savePreset(name, storage) {
      try {
        const trimmed = name.trim();
        if (!trimmed) throw new Error('Enter a preset name.');
        const presets = [...get().presets.filter((item) => item.name !== trimmed), { name: trimmed, json: get().exportJson() }];
        storage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
        set({ presets, warning: null }); return true;
      } catch (error) { set({ warning: `Could not save preset. ${describeError(error)}` }); return false; }
    },
    loadPreset(name) {
      const preset = get().presets.find((item) => item.name === name);
      if (!preset) { set({ warning: 'Select a saved preset to load.' }); return false; }
      return get().importJson(preset.json);
    },
    deletePreset(name, storage) {
      try {
        const presets = get().presets.filter((item) => item.name !== name);
        storage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets)); set({ presets, warning: null });
      } catch (error) { set({ warning: `Could not delete preset. ${describeError(error)}` }); }
    },
  }));
}
export const studioStore = createStudioStore();
export function useStudioStore<T>(selector: (state: StudioState) => T): T { return useStore(studioStore, selector); }
