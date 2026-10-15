import { blankImage } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';

export const southeastBodyPartLayout = [
  { id: 'torso', plane: 'body-torso', characterSide: 'center', visibility: 'visible' },
  { id: 'right-arm', plane: 'body-front-arm', characterSide: 'right', visibility: 'visible' },
  { id: 'left-arm', plane: 'body-back-arm', characterSide: 'left', visibility: 'visible' },
  { id: 'right-leg', plane: 'body-front-leg', characterSide: 'right', visibility: 'visible' },
  { id: 'left-leg', plane: 'body-back-leg', characterSide: 'left', visibility: 'visible' },
] as const;
/** Native SE ownership cuts; no concealed joints, limb deformation or rig anchors. */
export const southeastBodyPartsGeometry = {
  armBottom: 420,
  rightArmRoot: [[478,278],[485,300],[484,322],[466,340],[443,352],[443,420]],
  leftArmRoot: [[616,288],[627,305],[648,328],[672,350],[697,367],[710,390],[715,420]],
  legSeam: [[584,694],[585,740],[581,800],[567,880],[550,960],[560,1100],[560,1536]],
  rightThighRoot: [[466,571],[495,581],[526,606],[548,639],[566,677],[584,695]],
  leftThighRoot: [[584,695],[610,675],[636,646],[661,620],[676,608]],
} as const;
const lineValue = (value: number, line: readonly (readonly [number, number])[], axis: 0 | 1) => {
  const output = axis === 0 ? 1 : 0;
  if (value <= line[0]![axis]) return line[0]![output];
  for (let j = 1; j < line.length; j++) {
    const a = line[j - 1]!, b = line[j]!;
    if (value <= b[axis]) return a[output] + (b[output] - a[output]) * (value - a[axis]) / (b[axis] - a[axis]);
  }
  return line.at(-1)![output];
};
export function partitionSoutheastBody(body: RgbaImage) {
  if (body.width !== 1024 || body.height !== 1536) throw new Error('Native SE body required.');
  const g = southeastBodyPartsGeometry, parts = southeastBodyPartLayout.map(() => blankImage(1024, 1536)), pixelCounts = southeastBodyPartLayout.map(() => 0);
  for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) {
    const p = (y * 1024 + x) * 4; if (body.data[p + 3]! < 8) continue;
    const px = x + .5, py = y + .5, rightLeg = px < lineValue(py, g.legSeam, 1);
    const owner = py < g.armBottom && px < lineValue(py, g.rightArmRoot, 1) ? 1
      : py < g.armBottom && px >= lineValue(py, g.leftArmRoot, 1) ? 2
        : rightLeg && py >= lineValue(px, g.rightThighRoot, 0) ? 3
          : !rightLeg && py >= lineValue(px, g.leftThighRoot, 0) ? 4 : 0;
    parts[owner]!.data.set(body.data.subarray(p, p + 4), p); pixelCounts[owner]!++;
  }
  return { parts, pixelCounts };
}
