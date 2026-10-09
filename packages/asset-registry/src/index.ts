import { assetIdSchema, directionSchema, layerSlotSchema, pixelPointSchema, pixelSizeSchema } from '@character-studio/character-engine';
import type { Direction, LayerSlot } from '@character-studio/character-engine';
import { z } from 'zod';

export const assetSchema = z.object({
  id: assetIdSchema,
  name: z.string().trim().min(1),
  slot: layerSlotSchema,
  direction: directionSchema,
  source: z.string().regex(/^\/assets\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:png|webp)$/),
  size: pixelSizeSchema,
  anchor: pixelPointSchema,
});

export type CharacterAsset = z.infer<typeof assetSchema>;

export function createAssetRegistry(initialAssets: readonly CharacterAsset[] = []) {
  const assets = new Map<string, CharacterAsset>();

  function register(input: CharacterAsset): void {
    const asset = assetSchema.parse(input);
    if (assets.has(asset.id)) throw new Error(`Duplicate asset ID: ${asset.id}`);
    assets.set(asset.id, asset);
  }

  initialAssets.forEach(register);

  return {
    register,
    get(id: string): CharacterAsset | undefined {
      const asset = assets.get(id);
      return asset ? assetSchema.parse(asset) : undefined;
    },
    list(filter: { slot?: LayerSlot; direction?: Direction } = {}): CharacterAsset[] {
      return [...assets.values()]
        .filter((asset) => (!filter.slot || asset.slot === filter.slot) && (!filter.direction || asset.direction === filter.direction))
        .map((asset) => assetSchema.parse(asset));
    },
  };
}

export type AssetRegistry = ReturnType<typeof createAssetRegistry>;
