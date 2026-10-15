import { blankImage } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';

export const northeastBodyPartLayout = [
  { id: 'torso', plane: 'body-torso', characterSide: 'center', visibility: 'visible' },
  { id: 'right-arm', plane: 'body-front-arm', characterSide: 'right', visibility: 'visible' },
  { id: 'left-arm', plane: 'body-back-arm', characterSide: 'left', visibility: 'visible' },
  { id: 'right-leg', plane: 'body-front-leg', characterSide: 'right', visibility: 'visible' },
  { id: 'left-leg', plane: 'body-back-leg', characterSide: 'left', visibility: 'visible' },
] as const;
/** Independently traced NE revision-2 visible cuts; no rig anchors or concealed joints. */
export const northeastBodyPartsGeometry = {
  armBottom: 435,
  rightArmRoot: [[625,300],[617,320],[614,342],[622,360],[646,376],[716,388],[735,410],[740,435]],
  leftArmRoot: [[478,304],[470,322],[464,341],[465,361],[471,379],[480,405],[487,435]],
  legSeam: [[558,752],[574,800],[582,860],[577,920],[576,1000],[578,1100],[578,1536]],
  rightThighRoot: [[557,751],[578,719],[612,690],[649,671],[680,661],[696,663]],
  leftThighRoot: [[468,670],[473,699],[495,726],[525,743],[557,751]],
} as const;
export const northwestBodyPartLayout = [
  { id: 'torso', plane: 'body-torso', characterSide: 'center', visibility: 'visible' },
  { id: 'right-arm', plane: 'body-back-arm', characterSide: 'right', visibility: 'visible' },
  { id: 'left-arm', plane: 'body-front-arm', characterSide: 'left', visibility: 'visible' },
  { id: 'right-leg', plane: 'body-back-leg', characterSide: 'right', visibility: 'visible' },
  { id: 'left-leg', plane: 'body-front-leg', characterSide: 'left', visibility: 'visible' },
] as const;
/** Independently traced NW visible cuts on its approved source; no mirroring or concealed joints. */
export const northwestBodyPartsGeometry = {
  armBottom: 455,
  rightArmRoot: [[555,300],[568,322],[575,344],[571,365],[566,382],[557,408],[550,435],[545,455]],
  leftArmRoot: [[408,300],[421,320],[425,342],[415,365],[397,382],[332,397],[320,425],[315,455]],
  legSeam: [[505,752],[494,800],[486,880],[492,940],[505,1000],[510,1100],[510,1536]],
  rightThighRoot: [[505,752],[542,745],[568,731],[586,710],[597,685]],
  leftThighRoot: [[360,665],[390,657],[420,662],[450,677],[479,699],[503,727],[514,743]],
} as const;
type BodyPartsGeometry = { readonly armBottom: number } & Record<'rightArmRoot' | 'leftArmRoot' | 'legSeam' | 'rightThighRoot' | 'leftThighRoot', readonly (readonly [number, number])[]>;
const lineValue = (value: number, line: readonly (readonly [number,number])[], axis: 0 | 1) => {
  const output = axis === 0 ? 1 : 0;
  if (value <= line[0]![axis]) return line[0]![output];
  for (let j = 1; j < line.length; j++) {
    const a = line[j - 1]!, b = line[j]!;
    if (value <= b[axis]) return a[output] + (b[output] - a[output]) * (value - a[axis]) / (b[axis] - a[axis]);
  }
  return line.at(-1)![output];
};
export const partitionNortheastBody = (body: RgbaImage) => partitionPosteriorBody(body, northeastBodyPartsGeometry);
export const partitionNorthwestBody = (body: RgbaImage) => partitionPosteriorBody(body, northwestBodyPartsGeometry);
function partitionPosteriorBody(body: RgbaImage, g: BodyPartsGeometry) {
  if (body.width !== 1024 || body.height !== 1536) throw new Error('Native posterior body required.');
  const parts = Array.from({ length: 5 }, () => blankImage(1024, 1536)), pixelCounts = Array<number>(5).fill(0);
  for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) {
    const p = (y * 1024 + x) * 4; if (body.data[p + 3]! < 8) continue;
    const px = x + .5, py = y + .5, rightLeg = px >= lineValue(py, g.legSeam, 1);
    const owner = py < g.armBottom && px >= lineValue(py, g.rightArmRoot, 1) ? 1
      : py < g.armBottom && px < lineValue(py, g.leftArmRoot, 1) ? 2
        : rightLeg && py >= lineValue(px, g.rightThighRoot, 0) ? 3
          : !rightLeg && py >= lineValue(px, g.leftThighRoot, 0) ? 4 : 0;
    parts[owner]!.data.set(body.data.subarray(p, p + 4), p); pixelCounts[owner]!++;
  }
  return { parts, pixelCounts };
}
