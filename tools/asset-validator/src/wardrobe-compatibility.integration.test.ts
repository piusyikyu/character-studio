import { expect,it } from 'vitest';
import { blankImage } from '@character-studio/render-utils';
import { validateAuthoredWardrobeCompatibility } from './wardrobe-compatibility';

it('requires an authored outfit/body-surface/facing combination and accepts its own small-panel coverage instead of a universal bra footprint',() => {
  // Tiny abstract fixtures represent masks and opaque fabric, never character anatomy or approved art.
  const required = blankImage(8,12),top = blankImage(8,12);
  for (const [x,y] of [[2,3],[5,3]]) { required.data[(y! * 8 + x!) * 4 + 3] = 255; top.data.set([20,90,100,255],(y! * 8 + x!) * 4); }
  const profile = { schemaVersion: 1,outfitId: 'strappy-fixture',surfaceId: 'chest.s.smooth-fixture',direction: 'S',requiredZones: [{ id: 'opaque-panels',maskId: 'top.s.fixture' }],minimumOpaqueAlpha: 250 };
  const context = { direction: 'S',availableSurfaceIds: ['chest.s.smooth-fixture'],masks: new Map([['top.s.fixture',required]]),clothing: [top] };
  expect(validateAuthoredWardrobeCompatibility(profile,context)).toMatchObject({ coveredPixels: { 'opaque-panels': 2 } });
  expect(top.data[(6 * 8 + 4) * 4 + 3]).toBe(0); // Exposed midriff is independent of the authored panel requirements.
  expect(() => validateAuthoredWardrobeCompatibility(profile,{ ...context,availableSurfaceIds: [] })).toThrow('WARDROBE_SURFACE_MISSING: chest.s.smooth-fixture');
  expect(() => validateAuthoredWardrobeCompatibility(profile,{ ...context,direction: 'N' })).toThrow('WARDROBE_FACING_MISMATCH');
  expect(() => validateAuthoredWardrobeCompatibility(profile,{ ...context,masks: new Map() })).toThrow('WARDROBE_COVERAGE_MASK_MISSING');
  expect(() => validateAuthoredWardrobeCompatibility(profile,{ ...context,masks: new Map([['top.s.fixture',blankImage(8,12)]]) })).toThrow('WARDROBE_COVERAGE_MASK_EMPTY');
  const damaged = { ...top,data: top.data.slice() }; damaged.data[(3 * 8 + 5) * 4 + 3] = 249;
  expect(() => validateAuthoredWardrobeCompatibility(profile,{ ...context,clothing: [damaged] })).toThrow('WARDROBE_COVERAGE_MISSING: opaque-panels');
});
