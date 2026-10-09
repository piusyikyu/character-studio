import { create } from 'zustand';
import { createCharacter, directionSchema, rendererIdSchema } from '@female-character-studio/character-engine';
import type { Character, Direction, RendererId } from '@female-character-studio/character-engine';

interface StudioState {
  character: Character;
  rendererId: RendererId;
  setDirection(direction: Direction): void;
  setRenderer(rendererId: RendererId): void;
  reset(): void;
}

export const useStudioStore = create<StudioState>((set) => ({
  character: createCharacter(),
  rendererId: 'pixi',
  setDirection: (direction) => set((state) => ({ character: { ...state.character, direction: directionSchema.parse(direction) } })),
  setRenderer: (rendererId) => set({ rendererId: rendererIdSchema.parse(rendererId) }),
  reset: () => set({ character: createCharacter(), rendererId: 'pixi' }),
}));
