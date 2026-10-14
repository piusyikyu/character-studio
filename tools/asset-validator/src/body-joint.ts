import { blankImage, drawRgba } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { bodyJointGeometry as g } from './body-joint-geometry';

type Polygon = readonly (readonly [number, number])[];
const contains = (x: number, y: number, polygon: Polygon) => { let yes = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a]!, [bx, by] = polygon[b]!; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) yes = !yes; } return yes; };
const distance = (x: number, y: number, polygon: Polygon) => Math.min(...polygon.map((a, j) => { const b = polygon[(j + 1) % polygon.length]!, dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy))); return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy); }));
const clean = (image: RgbaImage) => { for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8) image.data.fill(0, i, i + 4); return image; };
const match = (actual: RgbaImage, expected: RgbaImage, message: string) => { if (actual.data.some((v, i) => v !== expected.data[i])) throw new Error(message); };

/** Reconstruct one native neck/shoulder owner, without modifying the accepted standing head. */
export function validateBodyJoint(inputs: { original: RgbaImage; originalHead: RgbaImage; study: RgbaImage; body: RgbaImage; head: RgbaImage; jointMask: RgbaImage; skinMask: RgbaImage; headMask: RgbaImage; oldFront: RgbaImage; oldRear: RgbaImage; front: RgbaImage; rear: RgbaImage; toRear: RgbaImage; toFront: RgbaImage; settings: unknown }) {
  const settings = inputs.settings as { method?: string; minimumAlpha?: number; coverageSamples?: number; hairCoverage?: string; geometry?: unknown };
  if (settings.method !== 'native-single-neck-shoulder-joint' || settings.minimumAlpha !== 8 || settings.coverageSamples !== 4 || settings.hairCoverage !== 'native-binary-ownership' || JSON.stringify(settings.geometry) !== JSON.stringify(g)) throw new Error('Native single neck/shoulder joint contours changed.');
  const body = { ...inputs.original, data: inputs.original.data.slice() }, head = { ...inputs.originalHead, data: inputs.originalHead.data.slice() }, front = { ...inputs.oldFront, data: inputs.oldFront.data.slice() }, rear = { ...inputs.oldRear, data: inputs.oldRear.data.slice() }, jointMask = blankImage(1024, 1536), skinMask = blankImage(1024, 1536), headMask = blankImage(1024, 1536), toRear = blankImage(1024, 1536), toFront = blankImage(1024, 1536), movedRear = blankImage(1024, 1536), movedFront = blankImage(1024, 1536);
  let jointPixels = 0, retiredNeckBasePixels = 0, rearPixels = 0, frontPixels = 0;
  for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) {
    const i = (y * 1024 + x) * 4, ha = y < g.headFade[0] ? 255 : y >= g.headFade[1] ? 0 : Math.round(255 * (g.headFade[1] - y) / (g.headFade[1] - g.headFade[0]));
    if (inputs.originalHead.data[i + 3]) { headMask.data.fill(255, i, i + 3); headMask.data[i + 3] = ha; head.data[i + 3] = Math.round(inputs.originalHead.data[i + 3]! * ha / 255); if (ha < 255) retiredNeckBasePixels++; }
    if (y >= 280 && y < 416 && x >= 348 && x < 676 && contains(x + .5, y + .5, g.joint)) {
      const coverage = Math.round(255 * Math.min(1, distance(x + .5, y + .5, g.joint) / g.feather));
      if (coverage >= 8) {
        jointMask.data.fill(255, i, i + 3); jointMask.data[i + 3] = coverage; jointPixels++;
        let samples = 0; for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (contains(x + (sx + .5) / 4, y + (sy + .5) / 4, g.silhouette)) samples++;
        const stencil = Math.round(samples * 255 / 16); if (stencil) { skinMask.data.fill(255, i, i + 3); skinMask.data[i + 3] = stencil; }
        const alpha = Math.round(inputs.study.data[i + 3]! * stencil / 255), na = alpha < 8 ? 0 : alpha;
        for (let c = 0; c < 4; c++) { const incoming = c === 3 ? na : na ? inputs.study.data[i + c]! : 0; body.data[i + c] = Math.round((inputs.original.data[i + c]! * (255 - coverage) + incoming * coverage) / 255); }
      }
    }
    if (y >= 302 && y < 355 && x >= 325 && x < 765) {
      if (contains(x + .5, y + .5, g.rearWindow) && (!g.frontCurls.some(p => contains(x + .5, y + .5, p)) || g.curlVoids.some(p => contains(x + .5, y + .5, p))) && inputs.oldFront.data[i + 3]) { toRear.data.fill(255, i, i + 4); movedRear.data.set(inputs.oldFront.data.subarray(i, i + 4), i); front.data.fill(0, i, i + 4); rearPixels++; }
      if (g.curlTips.some(p => contains(x + .5, y + .5, p)) && inputs.oldRear.data[i + 3]) { toFront.data.fill(255, i, i + 4); movedFront.data.set(inputs.oldRear.data.subarray(i, i + 4), i); rear.data.fill(0, i, i + 4); frontPixels++; }
    }
  }
  clean(body); clean(head); clean(headMask); drawRgba(rear, movedRear, 0, 0); drawRgba(front, movedFront, 0, 0);
  match(inputs.jointMask, jointMask, 'Native neck/shoulder ownership mask changed.'); match(inputs.skinMask, skinMask, 'Native joint skin silhouette changed.'); match(inputs.headMask, headMask, 'Native pose-specific head ownership mask changed.');
  match(inputs.toRear, toRear, 'Native rear hair ownership mask changed.'); match(inputs.toFront, toFront, 'Native front curl ownership mask changed.');
  match(inputs.body, body, 'Body pixels must retain native joint ownership and unchanged surrounding anatomy.'); match(inputs.head, head, 'Head pixels must retain native pose-specific ownership and the approved face/skull.'); match(inputs.front, front, 'Front hair must retain native local ownership.'); match(inputs.rear, rear, 'Rear hair must retain native local ownership.');
  return { jointPixels, retiredNeckBasePixels, movedToRearPixels: rearPixels, recoveredFrontCurlPixels: frontPixels };
}

/** Interior skin shading only: preserve both alpha silhouettes and every surrounding pixel. */
export function validateNeckShading(inputs: { originalBody: RgbaImage; originalHead: RgbaImage; study: RgbaImage; body: RgbaImage; head: RgbaImage; mask: RgbaImage; settings: unknown }) {
  const polygon: Polygon = [[495, 278], [530, 278], [538, 295], [546, 312], [535, 323], [503, 323], [488, 313], [492, 295]];
  const settings = inputs.settings as { method?: string; feather?: number; polygon?: unknown };
  if (settings.method !== 'native-neck-shading-only' || settings.feather !== 5 || JSON.stringify(settings.polygon) !== JSON.stringify(polygon)) throw new Error('Native neck shading contours changed.');
  const body = { ...inputs.originalBody, data: inputs.originalBody.data.slice() }, head = { ...inputs.originalHead, data: inputs.originalHead.data.slice() }, mask = blankImage(1024, 1536);
  let selectedNeckPixels = 0;
  for (let y = 278; y < 323; y++) for (let x = 488; x < 546; x++) {
    if (!contains(x + .5, y + .5, polygon)) continue;
    const i = (y * 1024 + x) * 4, coverage = Math.round(255 * Math.min(1, distance(x + .5, y + .5, polygon) / 5));
    if (coverage < 8) continue;
    if (inputs.study.data[i + 3]! < 240) throw new Error('Neck shading study must provide opaque native interior skin.');
    mask.data.fill(255, i, i + 3); mask.data[i + 3] = coverage; selectedNeckPixels++;
    for (const layer of [body, head]) if (layer.data[i + 3]) for (let c = 0; c < 3; c++) layer.data[i + c] = Math.round((layer.data[i + c]! * (255 - coverage) + inputs.study.data[i + c]! * coverage) / 255);
  }
  match(inputs.mask, mask, 'Native neck shading ownership mask changed.');
  match(inputs.body, body, 'Body pixels must retain native neck shading ownership and unchanged proportions.');
  match(inputs.head, head, 'Head pixels must retain native neck shading ownership and unchanged face anatomy.');
  return { selectedNeckPixels, silhouetteChanged: false, bodyProportionsChanged: false };
}
