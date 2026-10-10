import { z } from 'zod';
import type { RgbaImage } from '@character-studio/render-utils';
import { encodePng } from '@character-studio/render-utils';
import { headReviewSchema } from './head-review-schema';
import type { HeadReviewDraft } from './head-review-schema';
import { sha256 } from './reference-import';

const point = z.tuple([z.number().int().min(350).max(665), z.number().int().min(170).max(270)]);
const earPoint = z.tuple([z.number().int().min(544).max(625), z.number().int().min(180).max(268)]);
const neckPoint = z.tuple([z.number().int().min(432).max(604), z.number().int().min(229).max(360)]);
const settingsSchema = z.strictObject({
  schemaVersion: z.literal(1), direction: z.literal('S'),
  method: z.literal('shared-study/native-local-seam-ownership'),
  polygons: z.array(z.array(point).min(3)).min(2).max(4),
  earPolygons: z.array(z.array(earPoint).min(3)).length(1),
  earFrontPolygons: z.array(z.array(earPoint).min(3)).length(1),
  earMaximumRedMinusBlue: z.literal(15),
  neckPolygons: z.array(z.array(neckPoint).min(3)).length(2),
  neckFrontPolygons: z.array(z.array(neckPoint).min(3)).length(2),
  neckMaximumRedMinusBlue: z.literal(15),
  protection: z.literal('keep-exposed-head-neck-and-reject-warm-study-skin'),
});
const approvalSchema = z.object({
  schemaVersion: z.literal(1), assetVersion: z.literal(2),
  status: z.literal('approved-standing-reference-fit-candidate'), configSha256: z.string(),
  inputs: z.array(z.object({ source: z.string(), sourceSha256: z.string() })),
});
const inside = (x: number, y: number, polygon: [number, number][]) => {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]!, [xj, yj] = polygon[j]!;
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result;
  }
  return result;
};

/** Apply only reviewed native seam ownership; never change approved anatomy or fit inputs. */
export async function inspectHeadFitRepair(
  draft: HeadReviewDraft, sourceDirectory: string,
  read: (directory: string, source: string, hash?: string) => Promise<Buffer>,
  load: (directory: string, source: string, hash: string) => Promise<RgbaImage>,
  baseFront: RgbaImage, baseRear: RgbaImage, head: RgbaImage, neck: RgbaImage, reference: RgbaImage,
) {
  const repair = draft.seamRepair!;
  const baselineBytes = await read(sourceDirectory, repair.baseline.source, repair.baseline.sourceSha256);
  const baseline = headReviewSchema.parse(JSON.parse(baselineBytes.toString('utf8')));
  const approval = approvalSchema.parse(JSON.parse((await read(sourceDirectory, repair.approval.source, repair.approval.sourceSha256)).toString('utf8')));
  if (baseline.assetVersion !== 2 || approval.configSha256 !== sha256(baselineBytes) || JSON.stringify(baseline.frames) !== JSON.stringify(draft.frames) || JSON.stringify(baseline.fringeFit) !== JSON.stringify(draft.fringeFit)) throw new Error('Seam repair must inherit the approved revision-2 anatomy and fit unchanged.');
  for (const input of approval.inputs) await read(sourceDirectory, input.source, input.sourceSha256);
  const settings = settingsSchema.parse(JSON.parse((await read(sourceDirectory, repair.settings.source, repair.settings.sourceSha256)).toString('utf8')));
  const [study, mask, earMask, neckMask, front, rear] = await Promise.all([
    load(sourceDirectory, repair.study.source, repair.study.sourceSha256),
    load(sourceDirectory, repair.selection.source, repair.selection.sourceSha256),
    load(sourceDirectory, repair.earSelection.source, repair.earSelection.sourceSha256),
    load(sourceDirectory, repair.neckSelection.source, repair.neckSelection.sourceSha256),
    load(sourceDirectory, repair.front.source, repair.front.sourceSha256),
    load(sourceDirectory, repair.rear.source, repair.rear.sourceSha256),
  ]);
  let pixelCount = 0, earPixelCount = 0, earHairPixelCount = 0, earHairOverHead = 0, earRearHairPixelCount = 0, neckPixelCount = 0, neckSkinPixelsCleared = 0, exposedSkinProtected = 0;
  for (let i = 0; i < front.data.length; i += 4) {
    const x = (i / 4) % 1024, y = Math.floor(i / 4 / 1024);
    const inPolygon = settings.polygons.some((p) => inside(x + 0.5, y + 0.5, p));
    const exposedSkin = (head.data[i + 3]! >= 8 || neck.data[i + 3]! >= 8) && baseFront.data[i + 3]! < 8;
    const warmSkin = study.data[i]! - study.data[i + 2]! > 40 && study.data[i + 1]! - study.data[i + 2]! > 15;
    const selected = inPolygon && !exposedSkin && !warmSkin;
    const earSelected = settings.earPolygons.some((p) => inside(x + 0.5, y + 0.5, p));
    const earHair = reference.data[i + 3]! >= 8 && reference.data[i]! - reference.data[i + 2]! <= settings.earMaximumRedMinusBlue;
    const earFront = earSelected && earHair && settings.earFrontPolygons.some((p) => inside(x + 0.5, y + 0.5, p));
    const neckSelected = settings.neckPolygons.some((p) => inside(x + 0.5, y + 0.5, p));
    const neckHair = neckSelected && reference.data[i + 3]! >= 8 && reference.data[i]! - reference.data[i + 2]! <= settings.neckMaximumRedMinusBlue && settings.neckFrontPolygons.some((p) => inside(x + 0.5, y + 0.5, p));
    if (inPolygon && exposedSkin) exposedSkinProtected++;
    if (mask.data.subarray(i, i + 4).some((v) => v !== (selected ? 255 : 0)) || earMask.data.subarray(i, i + 4).some((v) => v !== (earSelected ? 255 : 0)) || neckMask.data.subarray(i, i + 4).some((v) => v !== (neckSelected ? 255 : 0))) throw new Error('Seam repair masks must match localized polygons and skin protection exactly.');
    // The generated study has background haze; never copy it outside S's own silhouette.
    const studyVisible = study.data[i + 3]! >= 8 && reference.data[i + 3]! >= 8;
    for (let c = 0; c < 4; c++) {
      const expectedFront = neckSelected ? (neckHair ? reference.data[i + c] : 0) : earSelected ? (earFront ? reference.data[i + c] : 0) : selected ? (studyVisible ? study.data[i + c] : 0) : baseFront.data[i + c];
      const expectedRear = earSelected ? (earFront || (neckSelected && neckHair) ? 0 : earHair ? reference.data[i + c] : baseRear.data[i + c]) : selected ? 0 : baseRear.data[i + c];
      if (front.data[i + c] !== expectedFront || rear.data[i + c] !== expectedRear) throw new Error('Seam repair must preserve approved pixels outside its masks and exact study/reference depth ownership inside.');
    }
    if (selected) pixelCount++;
    if (earSelected) { earPixelCount++; if (earFront) { earHairPixelCount++; if (head.data[i + 3]! >= 8 && baseFront.data[i + 3]! < 8) earHairOverHead++; } else if (earHair) earRearHairPixelCount++; }
    if (neckSelected) { neckPixelCount++; if (!neckHair && baseFront.data[i + 3]! >= 8) neckSkinPixelsCleared++; }
  }
  if (!pixelCount || pixelCount !== repair.pixelCount || earPixelCount !== repair.earPixelCount || neckPixelCount !== repair.neckPixelCount || !earHairOverHead || !earRearHairPixelCount || !neckSkinPixelsCleared) throw new Error('Seam repair, ear depth or neck cleanup coverage changed.');
  for (const { name, position: { x, y } } of draft.fringeFit!.facialLandmarks) if (front.data[(y * 1024 + x) * 4 + 3] !== 0) throw new Error(`Seam repair obstructs ${name}.`);
  return { front, rear, mask, earMask, neckMask, measurement: { pixelCount, earPixelCount, earHairPixelCount, earRearHairPixelCount, earHairOverHead, neckPixelCount, neckSkinPixelsCleared, exposedSkinProtected, baselineConfigSha256: repair.baseline.sourceSha256, studySha256: repair.study.sourceSha256, frontSha256: sha256(encodePng(front)), rearSha256: sha256(encodePng(rear)), facialLandmarksClear: true } };
}
