import { blankImage, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { faceAlignmentViewer, reviewedHeadAlignments } from './face-alignment-viewer';

const crop = { x: 416, y: 144, width: 208, height: 164 } as const;
const regions = [
  { name: 'screen-left-cheek', x: 445, y: 211, width: 40, height: 56 },
  { name: 'screen-right-cheek', x: 542, y: 211, width: 50, height: 56 },
] as const;

/** Preview-only native overlays; opacity, contour colours and zoom never alter artwork. */
export function prepareFaceOverlayInspection(reference: RgbaImage, head: RgbaImage, assembled: RgbaImage, revision = 3) {
  const translucent = { ...head, data: head.data.slice() }, contour = blankImage(1024, 1536), gaps = blankImage(1024, 1536);
  for (let p = 0; p < 1024 * 1536; p++) {
    const i = p * 4, x = p % 1024, y = Math.floor(p / 1024);
    translucent.data[i + 3] = Math.round(head.data[i + 3]! * 0.5);
    if (head.data[i + 3]! >= 8 && [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].some(([nx, ny]) => nx! < 0 || nx! >= 1024 || ny! < 0 || ny! >= 1536 || head.data[(ny! * 1024 + nx!) * 4 + 3]! < 8)) contour.data.set([0, 210, 255, 255], i);
  }
  const gapMeasurements = regions.map((region) => {
    let pixels = 0, minX = 1024, minY = 1536, maxX = -1, maxY = -1;
    for (let y = region.y; y < region.y + region.height; y++) for (let x = region.x; x < region.x + region.width; x++) {
      const i = (y * 1024 + x) * 4;
      if (reference.data[i + 3]! >= 128 && assembled.data[i + 3]! < 8) {
        gaps.data.set([255, 0, 128, 255], i); pixels++; minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      }
    }
    return { region, pixels, bounds: pixels ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } : null };
  });
  const overlay = { ...reference, data: reference.data.slice() }; drawRgba(overlay, translucent, 0, 0);
  const outlined = { ...overlay, data: overlay.data.slice() }; drawRgba(outlined, contour, 0, 0);
  const gapReview = { ...assembled, data: assembled.data.slice() }; drawRgba(gapReview, gaps, 0, 0);
  const magnify = (image: RgbaImage) => {
    const closeup = blankImage(crop.width * 3, crop.height * 3);
    for (let y = 0; y < closeup.height; y++) for (let x = 0; x < closeup.width; x++) {
    const i = ((crop.y + Math.floor(y / 3)) * 1024 + crop.x + Math.floor(x / 3)) * 4, j = (y * closeup.width + x) * 4, alpha = image.data[i + 3]! / 255;
    const checker = (Math.floor(x / 24) + Math.floor(y / 24)) % 2 ? 195 : 235;
    for (let c = 0; c < 3; c++) closeup.data[j + c] = Math.round(image.data[i + c]! * alpha + checker * (1 - alpha));
    closeup.data[j + 3] = 255;
    }
    return closeup;
  };
  const url = (image: RgbaImage) => `data:image/png;base64,${Buffer.from(encodePng(image)).toString('base64')}`;
  const assets = { reference: url(reference), head: url(head), contour: url(contour), assembled: url(assembled), gaps: url(gaps) };
  const html = faceAlignmentViewer(assets, crop, revision);
  return {
    images: [
      { path: 'inspection/S-head-over-reference.png', image: overlay },
      { path: 'inspection/S-head-contour-over-reference.png', image: outlined },
      { path: 'inspection/S-head-overlay-closeup.png', image: magnify(outlined) },
      { path: 'inspection/S-cheek-gap-review.png', image: gapReview },
      { path: 'inspection/S-cheek-gap-closeup.png', image: magnify(gapReview) },
    ], html,
    metadata: { alignment: { scope: 'Temporary detailed inspection only; source, render plans and pixel assets remain native', parameters: ['rotationDegrees', 'offsetX', 'offsetY'], landmarks: ['chin', 'screen-left-jaw', 'screen-right-jaw'], fit: 'Equal-weight rigid least-squares fit across marked point pairs; one pair adjusts translation only', chinRole: 'Alignment landmark, not a fixed pivot', defaultTransform: { rotationDegrees: 0, offsetX: 0, offsetY: 0 }, rotationCenter: { x: crop.x + crop.width / 2, y: crop.y + crop.height / 2 }, reviewedComparisons: revision === 3 ? reviewedHeadAlignments : [], workingComparison: revision === 3 ? 'rotation-and-chin' : 'native-authored-fit' }, nativePosition: { x: 0, y: 0 }, anatomy: 'Actual masked head plus retained same-side ears; facial overlays and neck plane excluded', opacity: 0.5, crop, displayMagnification: 3, contourColour: '#00D2FF', gapColour: '#FF0080', gapMeasurements, gapDefinition: 'Reference alpha >=128 and assembled alpha <8 in bounded cheek regions; review candidates, not inferred skin/hair ownership or a repair mask.' },
  };
}
