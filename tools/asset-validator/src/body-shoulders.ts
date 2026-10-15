import { blankImage } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';

/** Native S proximal-root contours, independently traced from the selected two-arm study. */
export const southShoulderGeometry = {
  coverageSamples: 8,
  right: [[440,309],[475,310],[474,320],[468,335],[458,352],[443,371],[428,389],[420,407],[414,430],[412,430],[412,412],[418,370],[430,336],[438,309]],
  left: [[584,309],[551,310],[553,322],[558,337],[568,354],[584,374],[599,395],[607,412],[614,430],[616,430],[616,412],[608,371],[593,338],[586,309]],
} as const;
const inside = (x: number, y: number, polygon: readonly (readonly [number, number])[]) => {
  let contained = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]!, b = polygon[j]!;
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) contained = !contained;
  }
  return contained;
};
/** Append study-owned concealed pixels only; never repaint any approved visible RGBA. */
export function completeSouthShoulders(study: RgbaImage, torso: RgbaImage, right: RgbaImage, left: RgbaImage) {
  if ([study, torso, right, left].some(im => im.width !== 1024 || im.height !== 1536)) throw new Error('Native 1024x1536 S shoulder inputs required.');
  const arms = [right, left].map(im => ({ ...im, data: im.data.slice() })), rightRetention = blankImage(1024, 1536), leftRetention = blankImage(1024, 1536), addedPixels = [0, 0];
  for (let p = 0; p < right.data.length; p += 4) if (right.data[p + 3]! >= 8) rightRetention.data[p + 3] = 255;
  for (let p = 0; p < left.data.length; p += 4) if (left.data[p + 3]! >= 8) leftRetention.data[p + 3] = 255;
  for (const [index, polygon] of [southShoulderGeometry.right, southShoulderGeometry.left].entries()) {
    const original = [right, left][index]!, arm = arms[index]!, samples = southShoulderGeometry.coverageSamples;
    for (let y = 309; y < 430; y++) for (let x = 410; x < 618; x++) {
      const p = (y * 1024 + x) * 4;
      if (original.data[p + 3] || torso.data[p + 3]! < 245) continue;
      let coverage = 0;
      for (let sy = 0; sy < samples; sy++) for (let sx = 0; sx < samples; sx++) if (inside(x + (sx + .5) / samples, y + (sy + .5) / samples, polygon)) coverage++;
      const alpha = Math.round(study.data[p + 3]! * coverage / (samples * samples));
      if (alpha < 8) continue;
      arm.data.set(study.data.subarray(p, p + 3), p); arm.data[p + 3] = alpha; addedPixels[index]!++;
    }
  }
  if (addedPixels.some(n => n < 500)) throw new Error('Both S shoulders require independently painted concealed root coverage.');
  return { right: arms[0]!, left: arms[1]!, rightRetention, leftRetention, addedPixels };
}
