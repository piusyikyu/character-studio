import { blankImage, drawRgba } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';

/** S-only study geometry. Independent garment fitting, not a reusable anatomy or rig declaration. */
export const southWardrobeGeometry = {
  braWindow: [403, 309, 622, 486], briefsWindow: [350, 598, 660, 716], ownershipPadding: 2, sideSeamAllowance: 10,
  dressEnvelope: [[447,389],[470,391],[499,417],[512,441],[541,408],[575,389],[598,391],[619,419],[621,445],[593,486],[579,517],[599,547],[624,572],[653,620],[691,690],[727,742],[761,860],[781,921],[742,975],[757,1052],[814,1130],[846,1170],[880,1250],[922,1375],[876,1408],[797,1437],[699,1440],[613,1401],[513,1402],[435,1401],[346,1440],[261,1435],[196,1413],[140,1370],[170,1300],[179,1200],[239,1084],[300,959],[339,921],[356,844],[347,738],[369,669],[378,621],[400,573],[415,551],[438,529],[444,500],[427,468],[408,444],[407,419],[419,402]],
  leftBust: [465,449,42,26], rightBust: [559,449,42,26],
  pelvis: [[475,643],[548,643],[544,674],[530,694],[518,706],[501,706],[488,684]],
  midriffOpening: [486, 580], minimumCoverageAlpha: 250,
} as const;
export const wardrobeLayerNames = ['skinBase','bra','panties','skinPatches','dress','lining'] as const;
export type WardrobeLayers = Record<typeof wardrobeLayerNames[number], RgbaImage>;
const inside = (x: number, y: number, poly: readonly (readonly number[])[]) => {
  let yes = false;
  for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
    const p = poly[a]!, q = poly[b]!;
    if ((p[1]! > y) !== (q[1]! > y) && x < (q[0]! - p[0]!) * (y - p[1]!) / (q[1]! - p[1]!) + p[0]!) yes = !yes;
  }
  return yes;
};
export function wardrobeCoverageRegion(x: number, y: number): 'bust' | 'pelvis' | null {
  if ([southWardrobeGeometry.leftBust,southWardrobeGeometry.rightBust].some(([cx,cy,rx,ry]) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1)) return 'bust';
  return inside(x + .5, y + .5, southWardrobeGeometry.pelvis) ? 'pelvis' : null;
}
const native = (images: readonly RgbaImage[]) => { if (images.some(im => im.width !== 1024 || im.height !== 1536)) throw new Error('Native S wardrobe inputs must be 1024x1536.'); };

/** Deterministic source partition and bounded selections from the fully clothed generated study. */
export function constructSouthWardrobe(torso: RgbaImage, study: RgbaImage): WardrobeLayers {
  native([torso,study]);
  const result = Object.fromEntries(wardrobeLayerNames.map(key => [key, blankImage(1024,1536)])) as WardrobeLayers;
  const owners = new Uint8Array(1024 * 1536);
  for (const [index, box] of [southWardrobeGeometry.braWindow,southWardrobeGeometry.briefsWindow].entries()) {
    for (let y = box[1]; y < box[3]; y++) for (let x = box[0]; x < box[2]; x++) {
      const p = (y * 1024 + x) * 4, r = torso.data[p]!, g = torso.data[p + 1]!, b = torso.data[p + 2]!;
      if (torso.data[p + 3]! < 8 || r >= 245 || Math.max(r,g,b) - Math.min(r,g,b) > 38 || b < g - 8) continue;
      // A small explicit ownership pad retains antialiased cloth/skin boundaries; no RGB is erased from approved files.
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= box[0] && nx < box[2] && ny >= box[1] && ny < box[3] && torso.data[(ny * 1024 + nx) * 4 + 3]) owners[ny * 1024 + nx] = index + 1;
      }
    }
  }
  for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) {
    const pixel = y * 1024 + x, p = pixel * 4, owner = owners[pixel];
    const target = owner === 1 ? result.bra : owner === 2 ? result.panties : result.skinBase;
    target.data.set(torso.data.subarray(p,p+4),p);
    if (y < 389 || y >= 1441 || x < 140 || x > 922 || !inside(x + .5,y + .5,southWardrobeGeometry.dressEnvelope)) continue;
    const r = study.data[p]!, g = study.data[p + 1]!, b = study.data[p + 2]!, alpha = study.data[p + 3]!;
    const fabric = (g < 100 && b >= r * .65 && b <= r + 65) || (r > 130 && g < 95 && b > r * .1 && b < r * .65) || (Math.max(r,g,b) < 150 && g < 100);
    if (alpha >= 8 && fabric) {
      result.dress.data.set(study.data.subarray(p,p+3),p);
      // The selected cloth is opaque. Normalise the generator's 253-alpha interior; retain its edge coverage.
      result.dress.data[p + 3] = Math.min(255,Math.round(alpha * 255 / 253));
    }
  }
  // The new corset study is a few pixels narrower than the accepted bra at its lateral seams.
  // Fit only those new garment seams to the unchanged native body, using adjacent fabric RGB.
  // No approved body pixel is shifted, scaled or repainted; this is an explicit garment allowance.
  const seamSource = result.dress.data.slice();
  for (let y = 430; y < 486; y++) for (let x = 403; x < 622; x++) {
    const p = (y * 1024 + x) * 4;
    if (owners[y * 1024 + x] !== 1 || torso.data[p + 3]! < 245 || study.data[p + 3]! >= 245) continue;
    const direction = x < 512 ? 1 : -1;
    for (let distance = 1; distance <= southWardrobeGeometry.sideSeamAllowance; distance++) {
      const q = (y * 1024 + x + direction * distance) * 4;
      if (seamSource[q + 3]! < 250) continue;
      const oldInk = Math.max(torso.data[p]!,torso.data[p + 1]!,torso.data[p + 2]!) < 100;
      result.dress.data.set((oldInk ? torso.data : seamSource).subarray(oldInk ? p : q,(oldInk ? p : q) + 3),p);
      result.dress.data[p + 3] = torso.data[p + 3]!;
      break;
    }
  }
  for (let y = 309; y < 716; y++) for (let x = 350; x < 660; x++) {
    const p = (y * 1024 + x) * 4;
    if (!owners[y * 1024 + x]) continue;
    // Interface patches retain the clothed study's skin and its antialiased neckline/slit ink.
    // No skin is invented inside the independent bust/pelvic coverage regions.
    if (result.dress.data[p + 3]! < 250 && !wardrobeCoverageRegion(x,y) && study.data[p + 3]! >= 245) {
      result.skinPatches.data.set(study.data.subarray(p,p+3),p);
      result.skinPatches.data[p + 3] = torso.data[p + 3]!;
    }
    // Opaque inner bust cups and high-cut pelvic panel remain independent of the outer gown.
    // They are not a skin fill, and never extend into the exposed belly or leg slit.
    if (wardrobeCoverageRegion(x,y)) {
      result.lining.data.set(study.data.subarray(p,p+3),p); result.lining.data[p + 3] = 255;
    }
  }
  for (const layer of Object.values(result)) for (let p = 0; p < layer.data.length; p += 4) if (!layer.data[p + 3]) layer.data.fill(0,p,p+4);
  return result;
}

export type WardrobeLook = 'daily-underwear' | 'reference-dress' | 'midriff-high-slit';
export function wardrobeClothing(layers: WardrobeLayers, look: WardrobeLook) {
  native(Object.values(layers));
  if (look === 'daily-underwear') return [layers.bra,layers.panties];
  const outer = { ...layers.dress, data: layers.dress.data.slice() };
  if (look === 'midriff-high-slit') {
    const [top,bottom] = southWardrobeGeometry.midriffOpening;
    // Keep the draped red sash; expose the native waist down to its independently fitted upper edge.
    for (let x = 0; x < 1024; x++) {
      let hem: number = bottom;
      for (let y = 530; y < bottom; y++) {
        const p = (y * 1024 + x) * 4, r = outer.data[p]!, g = outer.data[p + 1]!, b = outer.data[p + 2]!;
        if (outer.data[p + 3] && r > 130 && g < 100 && b < r * .65) { hem = Math.max(top,y - 1); break; }
      }
      for (let y = top; y < hem; y++) outer.data.fill(0,(y * 1024 + x) * 4,(y * 1024 + x) * 4 + 4);
    }
  } else if (look !== 'reference-dress') throw new Error('Unsupported S wardrobe look.');
  return [layers.lining,outer];
}
/** Fail before preview/export: coverage is independent at the bust and pelvis; belly exposure is allowed. */
export function validateWardrobeCoverage(clothing: readonly RgbaImage[]) {
  native(clothing);
  const covered = blankImage(1024,1536);
  for (const layer of clothing) drawRgba(covered,layer,0,0);
  const counts = { bust: 0, pelvis: 0 };
  for (let y = 389; y < 716; y++) for (let x = 350; x < 660; x++) {
    const region = wardrobeCoverageRegion(x,y);
    if (region) {
      if (covered.data[(y * 1024 + x) * 4 + 3]! < southWardrobeGeometry.minimumCoverageAlpha) throw new Error('WARDROBE_COVERAGE_MISSING: ' + region + ' needs opaque underwear or fitted lining/clothing.');
      counts[region]++;
    }
  }
  return counts;
}
