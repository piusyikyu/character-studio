import { blankImage } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { wardrobeLayerNames } from './body-wardrobe';
import type { WardrobeLayers } from './body-wardrobe';
import { validateAuthoredWardrobeCompatibility } from './wardrobe-compatibility';

/** Independently selected posterior geometry; S neckline, pelvis and slit masks are never reflected. */
export const northWardrobeGeometry = {
  braWindow: [409,317,617,495], briefsWindow: [373,615,650,760], ownershipPadding: 2, sideSeamAllowance: 12, shoulderEdgeAlpha: 200, seamRows: [428,560], seamFabricInset: 2, sidePanelWindow: [495,530,460,564],
  envelope: [[410,411],[615,411],[620,554],[680,700],[740,900],[800,1100],[891,1342],[820,1420],[650,1420],[520,1390],[360,1420],[168,1380],[160,1325],[240,1190],[300,1000],[292,800],[360,670],[410,570]],
  pelvis: [[438,650],[585,650],[580,693],[538,738],[487,738],[443,693]],
  rearSkirt: [450,760,574,1100], waistOpening: [495,580], minimumOpaqueAlpha: 250,
} as const;
const inside = (x: number,y: number,poly: readonly (readonly number[])[]) => {
  let yes = false;
  for (let a = 0,b = poly.length - 1; a < poly.length; b = a++) { const p = poly[a]!,q = poly[b]!; if ((p[1]! > y) !== (q[1]! > y) && x < (q[0]! - p[0]!) * (y - p[1]!) / (q[1]! - p[1]!) + p[0]!) yes = !yes; }
  return yes;
};
const native = (images: readonly RgbaImage[]) => { if (images.some(im => im.width !== 1024 || im.height !== 1536)) throw new Error('Native N wardrobe inputs must be 1024x1536.'); };
export function constructNorthWardrobe(torso: RgbaImage,study: RgbaImage): WardrobeLayers {
  native([torso,study]);
  const result = Object.fromEntries(wardrobeLayerNames.map(key => [key,blankImage(1024,1536)])) as WardrobeLayers;
  const owners = new Uint8Array(1024 * 1536);
  for (const [i,box] of [northWardrobeGeometry.braWindow,northWardrobeGeometry.briefsWindow].entries()) for (let y = box[1]; y < box[3]; y++) for (let x = box[0]; x < box[2]; x++) {
    const p = (y * 1024 + x) * 4,r = torso.data[p]!,g = torso.data[p + 1]!,b = torso.data[p + 2]!;
    if (torso.data[p + 3]! < 8 || r >= 245 || Math.max(r,g,b) - Math.min(r,g,b) > 38 || b < g - 8) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const nx = x + dx,ny = y + dy;
      if (nx >= box[0] && nx < box[2] && ny >= box[1] && ny < box[3] && torso.data[(ny * 1024 + nx) * 4 + 3]) owners[ny * 1024 + nx] = i + 1;
    }
  }
  for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) {
    const p = (y * 1024 + x) * 4,owner = owners[y * 1024 + x];
    (owner === 1 ? result.bra : owner === 2 ? result.panties : result.skinBase).data.set(torso.data.subarray(p,p+4),p);
    const r = study.data[p]!,g = study.data[p + 1]!,b = study.data[p + 2]!;
    const fabric = (g < 100 && b >= r * .65 && b <= r + 65) || (r > 130 && g < 95 && b > r * .1 && b < r * .65) || (Math.max(r,g,b) < 150 && g < 100);
    if (y >= 411 && y < 1420 && x >= 160 && x < 891 && inside(x+.5,y+.5,northWardrobeGeometry.envelope) && study.data[p + 3]! >= 8 && fabric) {
      result.dress.data.set(study.data.subarray(p,p+3),p); result.dress.data[p + 3] = Math.min(255,Math.round(study.data[p + 3]! * 255 / 253));
    }
    const pelvic = inside(x+.5,y+.5,northWardrobeGeometry.pelvis);
    if (owner && !pelvic && (study.data[p + 3]! >= 245 || (owner === 1 && y < 328 && study.data[p + 3]! >= northWardrobeGeometry.shoulderEdgeAlpha))) { result.skinPatches.data.set(study.data.subarray(p,p+3),p); result.skinPatches.data[p + 3] = torso.data[p + 3]!; }
    if (pelvic && owner === 2) { result.lining.data.set(study.data.subarray(p,p+3),p); result.lining.data[p + 3] = 255; }
  }
  // Fit the newly authored posterior garment to the existing body-owned lateral band edges.
  const seamSource = result.dress.data.slice();
  for (let y = northWardrobeGeometry.seamRows[0]; y < northWardrobeGeometry.seamRows[1]; y++) for (let x = 409; x < 617; x++) {
    const p = (y * 1024 + x) * 4;
    if ((owners[y * 1024 + x] !== 1 && x >= 460 && x < 564) || torso.data[p + 3]! < 245 || result.dress.data[p + 3]! >= 250) continue;
    const step = x < 512 ? 1 : -1;
    for (let distance = 1; distance <= northWardrobeGeometry.sideSeamAllowance; distance++) {
      let q = (y * 1024 + x + step * distance) * 4;
      if (seamSource[q + 3]! < 250) continue;
      const inset = q + step * northWardrobeGeometry.seamFabricInset * 4;
      if (seamSource[inset + 3]! >= 250) q = inset;
      const oldInk = Math.max(torso.data[p]!,torso.data[p + 1]!,torso.data[p + 2]!) < 100;
      result.dress.data.set((oldInk ? torso.data : seamSource).subarray(oldInk ? p : q,(oldInk ? p : q) + 3),p);
      result.dress.data[p + 3] = torso.data[p + 3]!; break;
    }
  }
  for (const layer of Object.values(result)) for (let p = 0; p < layer.data.length; p += 4) if (!layer.data[p + 3]) layer.data.fill(0,p,p+4);
  return result;
}
export type NorthWardrobeLook = 'daily-underwear' | 'reference-dress' | 'waist-opening-test';
export function northWardrobeClothing(layers: WardrobeLayers,look: NorthWardrobeLook) {
  native(Object.values(layers));
  if (look === 'daily-underwear') return [layers.bra,layers.panties];
  const outer = { ...layers.dress,data: layers.dress.data.slice() };
  if (look === 'waist-opening-test') {
    const [top,bottom] = northWardrobeGeometry.waistOpening;
    for (let x = 0; x < 1024; x++) {
      let hem: number = bottom;
      for (let y = 530; y < bottom; y++) { const p = (y * 1024 + x) * 4,r = outer.data[p]!,g = outer.data[p + 1]!,b = outer.data[p + 2]!; if (outer.data[p + 3] && r > 130 && g < 100 && b < r * .65) { hem = Math.max(top,y - 1); break; } }
      for (let y = top; y < hem; y++) outer.data.fill(0,(y * 1024 + x) * 4,(y * 1024 + x) * 4 + 4);
    }
  } else if (look !== 'reference-dress') throw new Error('Unsupported N wardrobe look.');
  return [layers.lining,outer];
}
export function validateNorthWardrobeCoverage(clothing: readonly RgbaImage[],look: NorthWardrobeLook,surface: RgbaImage) {
  native([...clothing,surface]);
  const sidePanels = blankImage(1024,1536),pelvis = blankImage(1024,1536),rearSkirt = blankImage(1024,1536),[x0,y0,x1,y1] = northWardrobeGeometry.rearSkirt;
  for (let y = 650; y < 1100; y++) for (let x = 430; x < 590; x++) {
    const p = (y * 1024 + x) * 4 + 3;
    if (inside(x+.5,y+.5,northWardrobeGeometry.pelvis)) pelvis.data[p] = 255;
    if (x >= x0 && x < x1 && y >= y0 && y < y1) rearSkirt.data[p] = 255;
  }
  const [sideTop,sideBottom,leftInner,rightInner] = northWardrobeGeometry.sidePanelWindow;
  for (let y = sideTop; y < sideBottom; y++) for (let x = 409; x < 617; x++) {
    const p = (y * 1024 + x) * 4 + 3;
    if ((x < leftInner || x >= rightInner) && surface.data[p]! >= northWardrobeGeometry.minimumOpaqueAlpha) sidePanels.data[p] = 255;
  }
  const requiredZones = [{ id: 'pelvis',maskId: 'pelvis.n.v1' }];
  if (look === 'reference-dress') requiredZones.push({ id: 'closed-bodice-sides',maskId: 'closed-bodice-sides.n.v1' });
  if (look !== 'daily-underwear') requiredZones.push({ id: 'closed-rear-skirt',maskId: 'closed-rear-skirt.n.v1' });
  return validateAuthoredWardrobeCompatibility({ schemaVersion: 1,outfitId: 'reference-gown-study.n.v1',surfaceId: 'exposed-surface-torso.n.v1',direction: 'N',requiredZones,minimumOpaqueAlpha: 250 },{ direction: 'N',availableSurfaceIds: ['exposed-surface-torso.n.v1'],masks: new Map([['pelvis.n.v1',pelvis],['closed-rear-skirt.n.v1',rearSkirt],['closed-bodice-sides.n.v1',sidePanels]]),clothing }).coveredPixels;
}
