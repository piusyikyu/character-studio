import { describe, expect, it } from 'vitest';
import { assetSchema, createAssetRegistry } from './index';
import type { CharacterAsset } from './index';

const asset: CharacterAsset = {
  id: 'hair.base.south', name: 'Base hair', slot: 'hair', direction: 'south',
  source: '/assets/hair/base-south.png', size: { width: 64, height: 96 }, anchor: { x: 32, y: 80 },
};

describe('asset registry', () => {
  it('starts empty and supports directional and slot lookup', () => {
    const registry = createAssetRegistry();
    expect(registry.list()).toEqual([]);
    registry.register(asset);
    expect(registry.get(asset.id)).toEqual(asset);
    expect(registry.list({ direction: 'north' })).toEqual([]);
    expect(registry.list({ slot: 'hair', direction: 'south' })).toEqual([asset]);
    expect(registry.get('missing')).toBeUndefined();
  });

  it('rejects duplicates and malformed pixel metadata', () => {
    const registry = createAssetRegistry([asset]);
    expect(() => registry.register(asset)).toThrow('Duplicate asset ID');
    expect(assetSchema.safeParse({ ...asset, anchor: { x: 0.5, y: 0 } }).success).toBe(false);
    expect(assetSchema.safeParse({ ...asset, source: '/assets/../secret.png' }).success).toBe(false);
  });

  it('protects registered metadata from external mutations', () => {
    const input = structuredClone(asset);
    const registry = createAssetRegistry([input]);
    input.size.width = 1;
    registry.get(asset.id)!.size.width = 2;
    registry.list()[0]!.size.width = 3;
    expect(registry.get(asset.id)?.size.width).toBe(64);
  });
});
