import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect,it } from 'vitest';
import { blankImage,decodePng,drawRgba } from '@character-studio/render-utils';
import { assembleWardrobeSurface,fitWardrobeOnSurface } from './wardrobe-surface-fit';
import type { AuthoredWardrobeGarment } from './wardrobe-surface-fit';
import { sha256 } from './reference-import';
import { auditWardrobeFoundation } from './wardrobe-foundation-audit';

it('fits multiple underwear cuts to one complete surface and rejects underwear peeking through a slit without clipping it away',() => {
  // Abstract blocks only: these exercise fit contracts, not anatomical artwork.
  const footprint = blankImage(8,12),base = blankImage(8,12),chest = blankImage(8,12),pelvis = blankImage(8,12);
  for (let y = 1; y < 11; y++) for (let x = 1; x < 7; x++) {
    const p = (y * 8 + x) * 4;
    footprint.data.set([120,140,160,255],p);
    if (y === 3 || y === 4) chest.data[p + 3] = 255;
    else if (y === 7 || y === 8) pelvis.data[p + 3] = 255;
    else base.data.set(footprint.data.subarray(p,p+4),p);
  }
  const spec = { schemaVersion: 1,id: 'surface.s.fixture',bodyId: 'body.fixture',direction: 'S',replacements: [{ regionId: 'chest',surfaceId: 'chest.fixture' },{ regionId: 'pelvis',surfaceId: 'pelvis.fixture' }] };
  const part = { bodyId: spec.bodyId,direction: spec.direction,image: footprint };
  const input = { bodyId: spec.bodyId,direction: spec.direction,bodyFootprint: footprint,baseSkin: base,regions: new Map([['chest',chest],['pelvis',pelvis]]),parts: new Map([['chest.fixture',part],['pelvis.fixture',part]]) };
  const before = sha256(base.data),surface = assembleWardrobeSurface(spec,input);
  expect(surface.image.data).toEqual(footprint.data);
  const garment = (id: string, rows: number[], left = 1,right = 7): AuthoredWardrobeGarment => {
    const image = blankImage(8,12);
    for (const y of rows) for (let x = left; x < right; x++) image.data.set([20,40,60,255],(y * 8 + x) * 4);
    return { id,bodyId: spec.bodyId,direction: spec.direction,requiredSurfaceIds: [id.includes('top') ? 'chest.fixture' : 'pelvis.fixture'],role: 'underwear',image };
  };
  const bust = blankImage(8,12),core = blankImage(8,12);
  for (const x of [2,5]) bust.data[(3 * 8 + x) * 4 + 3] = 255;
  core.data[(8 * 8 + 3) * 4 + 3] = 255;
  const masks = new Map([['top.fixture',bust],['pelvis.fixture',core]]);
  const profile = { schemaVersion: 1,outfitId: 'underwear.fixture',surfaceId: surface.id,direction: 'S',requiredZones: [{ id: 'top',maskId: 'top.fixture' },{ id: 'bottom',maskId: 'pelvis.fixture' }],minimumOpaqueAlpha: 250 };
  const top = garment('top',[3,4]),smallTop = garment('small-panel-top',[3],2,6),daily = garment('daily',[7,8]),lowRise = garment('low-rise-high-cut',[8],2,6),highWaist = garment('high-waist',[6,7,8]);
  for (const bottom of [daily,lowRise,highWaist]) {
    const fit = fitWardrobeOnSurface(profile,{ surface,garments: [smallTop,bottom],masks,concealUnderwear: false });
    expect(fit.coverage.coveredPixels).toEqual({ top: 2,bottom: 1 });
    expect(fit.image.data[(5 * 8 + 3) * 4 + 3]).toBe(255); // Open midriff has surface, not a hole.
    expect(fit.image.data[(4 * 8 + 3) * 4 + 3]).toBe(255); // Chest beside smaller panels has surface too.
  }
  const outer = garment('slit-outfit',[8],2,6); outer.role = 'outerwear'; outer.requiredSurfaceIds = ['chest.fixture','pelvis.fixture']; drawRgba(outer.image,top.image,0,0);
  expect(() => fitWardrobeOnSurface(profile,{ surface,garments: [outer,top,daily],masks,concealUnderwear: true })).toThrow('WARDROBE_UNDERLAYER_PEEK: daily');
  const fitted = fitWardrobeOnSurface(profile,{ surface,garments: [outer,top,lowRise],masks,concealUnderwear: true });
  expect(fitted.image.data[(7 * 8 + 1) * 4 + 3]).toBe(255); // Exposed hip uses the same completed surface.
  expect(() => fitWardrobeOnSurface(profile,{ surface,garments: [top,{ ...lowRise,requiredSurfaceIds: ['other-surface'] }],masks,concealUnderwear: false })).toThrow('WARDROBE_GARMENT_FIT_MISSING');
  const alternate = assembleWardrobeSurface({ ...spec,id: 'alternate-chest-body.fixture',replacements: [{ regionId: 'chest',surfaceId: 'alternate-chest.fixture' },spec.replacements[1]] },{ ...input,parts: new Map([...input.parts,['alternate-chest.fixture',part]]) });
  const alternateProfile = { ...profile,surfaceId: alternate.id };
  expect(() => fitWardrobeOnSurface(alternateProfile,{ surface: alternate,garments: [top,lowRise],masks,concealUnderwear: false })).toThrow('WARDROBE_GARMENT_FIT_MISSING: top');
  // A new chest needs its own top variant; the same pelvic surface retains the same panties.
  expect(fitWardrobeOnSurface(alternateProfile,{ surface: alternate,garments: [{ ...top,requiredSurfaceIds: ['alternate-chest.fixture'] },lowRise],masks,concealUnderwear: false }).coverage.coveredPixels.bottom).toBe(1);
  expect(() => assembleWardrobeSurface(spec,{ ...input,parts: new Map([['chest.fixture',part]]) })).toThrow('WARDROBE_SURFACE_MISSING: pelvis.fixture');
  expect(() => assembleWardrobeSurface(spec,{ ...input,parts: new Map([['chest.fixture',{ ...part,direction: 'N' }],['pelvis.fixture',part]]) })).toThrow('WARDROBE_FACING_MISMATCH');
  const damaged = { ...footprint,data: footprint.data.slice() }; damaged.data[(7 * 8 + 1) * 4 + 3] = 200;
  expect(() => assembleWardrobeSurface(spec,{ ...input,parts: new Map([['chest.fixture',part],['pelvis.fixture',{ ...part,image: damaged }]]) })).toThrow('WARDROBE_SURFACE_GAP');
  expect(sha256(base.data)).toBe(before);
  expect(sha256(surface.image.data)).toBe(sha256(footprint.data));
  expect(fitWardrobeOnSurface(profile,{ surface,garments: [outer,top,lowRise],masks,concealUnderwear: true })).toEqual(fitted);
});

it('identifies missing chest and pelvis surfaces in the actual approved S partitions instead of certifying arbitrary underwear compatibility',async () => {
  const root = fileURLToPath(new URL('../../../assets/source/heroine-v1/',import.meta.url));
  const load = async (path: string) => decodePng(await readFile(root + path));
  const [baseSkin,bra,panties,bodyFootprint] = await Promise.all(['outfit/dress-v1/S-skinBase-v1.png','outfit/dress-v1/S-bra-v1.png','outfit/dress-v1/S-panties-v1.png','body/parts-v1/S-torso-v1.png'].map(load));
  const replay = { ...baseSkin!,data: baseSkin!.data.slice() };
  drawRgba(replay,bra!,0,0); drawRgba(replay,panties!,0,0);
  expect(sha256(replay.data)).toBe(sha256(bodyFootprint!.data));
  const context = { bodyId: 'heroine.s.body-v4',direction: 'S',baseSkin: baseSkin!,bodyFootprint: bodyFootprint!,regions: new Map([['chest',bra!],['pelvis',panties!]]),parts: new Map() };
  for (const [regionId,surfaceId] of [['chest','chest.s.smooth-v1'],['pelvis','pelvis.s.smooth-v1']]) {
    expect(() => assembleWardrobeSurface({ schemaVersion: 1,id: 'body.s.complete-surface-v1',bodyId: context.bodyId,direction: 'S',replacements: [{ regionId,surfaceId }] },context)).toThrow('WARDROBE_SURFACE_MISSING: ' + surfaceId);
  }
  const audit = await auditWardrobeFoundation(fileURLToPath(new URL('../../../',import.meta.url)));
  expect(audit).toMatchObject({ completeSurfaceAvailable: false,arbitraryUnderwearCompatibilityApproved: false,missingSurfaces: ['chest.s.smooth-v1','pelvis.s.smooth-v1'] });
  expect(audit.surfaces.every(s => s.missingBasePixels > 1000)).toBe(true);
},30_000);
