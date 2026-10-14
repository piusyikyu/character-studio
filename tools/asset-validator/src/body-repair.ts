import { blankImage, drawRgba } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { bodyRepairGeometry as geometry } from './body-repair-geometry';
const contains = (x: number, y: number, polygon: readonly (readonly [number, number])[]) => { let yes = false; for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) { const [ax, ay] = polygon[a]!, [bx, by] = polygon[b]!; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) yes = !yes; } return yes; };
const match = (actual: RgbaImage, expected: RgbaImage, message: string) => { if (actual.data.some((v, i) => v !== expected.data[i])) throw new Error(message); };

/** Native local ownership reconstruction; never transforms study pixels or approved hair. */
export function validateBodyRepair(inputs: { original: RgbaImage; stencil: RgbaImage; study: RgbaImage; body: RgbaImage; torsoMask: RgbaImage; front: RgbaImage; rear: RgbaImage; oldFront: RgbaImage; oldRear: RgbaImage; toRear: RgbaImage; toFront: RgbaImage; settings: unknown }) {
  const settings = inputs.settings as { method?: string; coverageSamples?: number; geometry?: unknown; minimumAlpha?: number; hairCoverage?: string };
  if (settings.method !== 'native-two-piece-underwear-and-hair-depth' || settings.coverageSamples !== 4 || settings.minimumAlpha !== 8 || settings.hairCoverage !== 'native-binary-ownership' || JSON.stringify(settings.geometry) !== JSON.stringify(geometry)) throw new Error('Native torso and hair ownership contours changed.');
  const body = { ...inputs.original, data: inputs.original.data.slice() }, front = { ...inputs.oldFront, data: inputs.oldFront.data.slice() }, rear = { ...inputs.oldRear, data: inputs.oldRear.data.slice() }, torsoMask = blankImage(1024, 1536), toRear = blankImage(1024, 1536), toFront = blankImage(1024, 1536), movedRear = blankImage(1024, 1536), movedFront = blankImage(1024, 1536);
  let torsoPixels = 0, rearPixels = 0, frontPixels = 0;
  for (let y = 324; y < 737; y++) for (let x = 371; x < 652; x++) {
    let samples = 0; for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (contains(x + (sx + .5) / 4, y + (sy + .5) / 4, geometry.torso)) samples++;
    if (!samples) continue;
    const i = (y * 1024 + x) * 4, coverage = Math.round(samples * 255 / 16), alpha = Math.round(inputs.study.data[i + 3]! * inputs.stencil.data[i + 3]! / 255), newAlpha = alpha < 8 ? 0 : alpha;
    torsoMask.data.fill(255, i, i + 3); torsoMask.data[i + 3] = coverage; torsoPixels++;
    for (let c = 0; c < 4; c++) { const incoming = c === 3 ? newAlpha : newAlpha ? inputs.study.data[i + c]! : 0; body.data[i + c] = Math.round((inputs.original.data[i + c]! * (255 - coverage) + incoming * coverage) / 255); }
    if (body.data[i + 3]! < 8) body.data.fill(0, i, i + 4);
  }
  for (let y = 323; y < 355; y++) for (let x = 325; x < 765; x++) {
    const i = (y * 1024 + x) * 4;
    if (contains(x + .5, y + .5, geometry.rearWindow) && (!geometry.frontCurls.some(p => contains(x + .5, y + .5, p)) || geometry.curlVoids.some(p => contains(x + .5, y + .5, p))) && inputs.oldFront.data[i + 3]) { toRear.data.fill(255, i, i + 4); movedRear.data.set(inputs.oldFront.data.subarray(i, i + 4), i); front.data.fill(0, i, i + 4); rearPixels++; }
    if (geometry.curlTips.some(p => contains(x + .5, y + .5, p)) && inputs.oldRear.data[i + 3]) { toFront.data.fill(255, i, i + 4); movedFront.data.set(inputs.oldRear.data.subarray(i, i + 4), i); rear.data.fill(0, i, i + 4); frontPixels++; }
  }
  drawRgba(rear, movedRear, 0, 0); drawRgba(front, movedFront, 0, 0);
  match(inputs.torsoMask, torsoMask, 'Native torso ownership mask changed.'); match(inputs.toRear, toRear, 'Native rear hair ownership mask changed.'); match(inputs.toFront, toFront, 'Native front curl ownership mask changed.');
  match(inputs.body, body, 'Body pixels must retain native torso ownership and unchanged surrounding anatomy.'); match(inputs.front, front, 'Front hair must retain native local ownership.'); match(inputs.rear, rear, 'Rear hair must retain native local ownership.');
  return { torsoPixels, movedToRearPixels: rearPixels, recoveredFrontCurlPixels: frontPixels };
}
