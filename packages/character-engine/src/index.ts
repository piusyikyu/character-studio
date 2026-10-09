import { z } from 'zod';

export const DIRECTIONS = ['south', 'south-west', 'west', 'north-west', 'north', 'north-east', 'east', 'south-east'] as const;
export const LAYER_SLOTS = ['body', 'bottom', 'top', 'shoes', 'hair', 'accessory'] as const;
export const RENDERER_IDS = ['pixi', 'canvas'] as const;
export const NATIVE_SIZE = Object.freeze({ width: 64, height: 96 });

// Export policy only: PNG export and character composition are future work.
export const EXPORT_BACKGROUND = '#00FF00';
export const DIRECTION_LABEL_COLOR = '#FFFF00';
export const EXPORT_BACKGROUND_RGBA = Object.freeze([0, 255, 0, 255] as const);
export const DIRECTION_LABEL_RGBA = Object.freeze([255, 255, 0, 255] as const);
export const INTERNAL_BACKGROUND_RGBA = Object.freeze([0, 0, 0, 0] as const);

export const directionSchema = z.enum(DIRECTIONS);
export const layerSlotSchema = z.enum(LAYER_SLOTS);
export const rendererIdSchema = z.enum(RENDERER_IDS);
export const pixelPointSchema = z.object({ x: z.number().int(), y: z.number().int() });
export const pixelSizeSchema = z.object({ width: z.number().int().positive(), height: z.number().int().positive() });
export const assetIdSchema = z.string().regex(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/);
export const characterSchema = z.object({
  version: z.literal(1),
  name: z.string().trim().min(1).max(80),
  direction: directionSchema,
  layers: z.array(z.object({ slot: layerSlotSchema, assetId: assetIdSchema, offset: pixelPointSchema })),
}).superRefine((character, ctx) => {
  const seen = new Set<string>();
  character.layers.forEach((layer, index) => {
    if (seen.has(layer.slot)) ctx.addIssue({ code: 'custom', path: ['layers', index, 'slot'], message: 'Only one asset per layer slot is allowed.' });
    seen.add(layer.slot);
  });
});

export type Direction = z.infer<typeof directionSchema>;
export type LayerSlot = z.infer<typeof layerSlotSchema>;
export type RendererId = z.infer<typeof rendererIdSchema>;
export type PixelSize = z.infer<typeof pixelSizeSchema>;
export type Character = z.infer<typeof characterSchema>;

export function createCharacter(name = 'Untitled character'): Character {
  return characterSchema.parse({ version: 1, name, direction: 'south', layers: [] });
}

export interface RenderRequest {
  character: Character;
  size: PixelSize;
}

export interface RenderResult {
  status: 'scaffold';
  composedLayers: 0;
}

export interface CharacterRenderer {
  readonly id: RendererId;
  mount(host: HTMLElement, size: PixelSize): Promise<void>;
  render(request: RenderRequest): RenderResult;
  destroy(): void;
}

export function validateRenderRequest(request: RenderRequest): RenderRequest {
  return { character: characterSchema.parse(request.character), size: pixelSizeSchema.parse(request.size) };
}
