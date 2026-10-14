import { blankImage } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';

export const bodyPartLayout = [
  { id: 'torso', plane: 'body-torso', characterSide: 'center', screenSide: 'center' },
  { id: 'right-arm', plane: 'body-back-arm', characterSide: 'right', screenSide: 'left' },
  { id: 'left-arm', plane: 'body-front-arm', characterSide: 'left', screenSide: 'right' },
  { id: 'right-leg', plane: 'body-back-leg', characterSide: 'right', screenSide: 'left' },
  { id: 'left-leg', plane: 'body-front-leg', characterSide: 'left', screenSide: 'right' },
] as const;

/** Test cuts only; these coordinates do not certify concealed joints or rig anchors. */
export const bodyPartsGeometry = {
  armBottom: 430,
  rightArmRoot: [[440,309],[432,336],[420,370],[414,412],[414,430]],
  leftArmRoot: [[584,309],[591,338],[606,371],[614,412],[614,430]],
  legCenter: 512,
  rightThighRoot: [[368,727],[428,735],[491,730],[511,733]],
  leftThighRoot: [[513,733],[538,732],[591,736],[652,729]],
} as const;
// N contours are drawn against its own accepted anatomy, never transformed S cuts.
export const northBodyPartLayout = [
  { id: 'torso', plane: 'body-torso', characterSide: 'center', screenSide: 'center' },
  { id: 'right-arm', plane: 'body-back-arm', characterSide: 'right', screenSide: 'right' },
  { id: 'left-arm', plane: 'body-front-arm', characterSide: 'left', screenSide: 'left' },
  { id: 'right-leg', plane: 'body-back-leg', characterSide: 'right', screenSide: 'right' },
  { id: 'left-leg', plane: 'body-front-leg', characterSide: 'left', screenSide: 'left' },
] as const;
export const northBodyPartsGeometry = {
  armBottom: 460,
  rightArmRoot: [[592,317],[592,345],[599,375],[608,405],[610,430],[610,460]],
  leftArmRoot: [[432,317],[432,345],[426,375],[417,405],[414,430],[414,460]],
  legCenter: 512,
  rightThighRoot: [[512,771],[536,783],[608,772],[663,755]],
  leftThighRoot: [[359,760],[417,774],[485,780],[511,771]],
} as const;
const profiles = {
  S: { layout: bodyPartLayout, geometry: bodyPartsGeometry, method: 'native-exclusive-s-body-parts' },
  N: { layout: northBodyPartLayout, geometry: northBodyPartsGeometry, method: 'native-exclusive-n-body-parts' },
} as const;
type Line = readonly (readonly [number, number])[];
const lineValue = (value: number, line: Line, axis: 0 | 1) => {
  const output = axis === 0 ? 1 : 0;
  if (value <= line[0]![axis]) return line[0]![output];
  for (let j = 1; j < line.length; j++) { const a = line[j - 1]!, b = line[j]!; if (value <= b[axis]) return a[output] + (b[output] - a[output]) * (value - a[axis]) / (b[axis] - a[axis]); }
  return line.at(-1)![output];
};

export function partitionNativeBody(body: RgbaImage, direction: 'S' | 'N' = 'S') {
  if (direction !== 'S' && direction !== 'N') throw new Error('An explicitly authored S or N part profile is required.');
  if (body.width !== 1024 || body.height !== 1536) throw new Error('Native body framing required.');
  const profile = profiles[direction], geometry = profile.geometry;
  const parts = profile.layout.map(() => blankImage(1024, 1536)), pixelCounts = profile.layout.map(() => 0);
  for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) {
    const i = (y * 1024 + x) * 4; if (!body.data[i + 3]) continue;
    const px = x + .5, py = y + .5;
    const rightArm = direction === 'S' ? px < lineValue(py, geometry.rightArmRoot, 1) : px >= lineValue(py, geometry.rightArmRoot, 1);
    const leftArm = direction === 'S' ? px >= lineValue(py, geometry.leftArmRoot, 1) : px < lineValue(py, geometry.leftArmRoot, 1);
    const rightLeg = direction === 'S' ? px < geometry.legCenter : px >= geometry.legCenter;
    const owner = py < geometry.armBottom && rightArm ? 1
      : py < geometry.armBottom && leftArm ? 2
        : rightLeg && py >= lineValue(px, geometry.rightThighRoot, 0) ? 3
          : !rightLeg && py >= lineValue(px, geometry.leftThighRoot, 0) ? 4 : 0;
    parts[owner]!.data.set(body.data.subarray(i, i + 4), i); pixelCounts[owner]!++;
  }
  return { parts, pixelCounts };
}

export function validateNativeBodyParts(body: RgbaImage, actual: readonly RgbaImage[], settings: unknown, direction: 'S' | 'N' = 'S') {
  if (direction !== 'S' && direction !== 'N') throw new Error('An explicitly authored S or N part profile is required.');
  const profile = profiles[direction];
  const s = settings as { method?: string; geometry?: unknown; minimumAlpha?: number };
  if (s.method !== profile.method || s.minimumAlpha !== 8 || JSON.stringify(s.geometry) !== JSON.stringify(profile.geometry)) throw new Error('Native body part ownership contours changed.');
  const expected = partitionNativeBody(body, direction);
  if (actual.length !== profile.layout.length) throw new Error('All five body parts are required.');
  for (const [j, part] of actual.entries()) {
    if (part.width !== 1024 || part.height !== 1536 || part.data.some((v, i) => v !== expected.parts[j]!.data[i])) throw new Error(profile.layout[j]!.id + ': native body part ownership changed.');
    if (!expected.pixelCounts[j]) throw new Error('Every body part must contain native source artwork.');
  }
  return { parts: profile.layout.map((part, j) => ({ ...part, selectedPixels: expected.pixelCounts[j]!, nativePosition: { x: 0, y: 0 } })), overlapPixels: 0, unownedPixels: 0, generatedAnatomy: false, concealedJointsApproved: false, separateUnderwearAuthored: false };
}
