import { lstat,readFile,realpath } from 'node:fs/promises';
import { isAbsolute,relative,resolve } from 'node:path';
import { z } from 'zod';
import { decodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { assembleWardrobeSurface } from './wardrobe-surface-fit';
import type { AuthoredSurfacePart } from './wardrobe-surface-fit';
import { sha256 } from './reference-import';

const pin = z.strictObject({ source: z.string().min(1),sourceSha256: z.string().regex(/^[a-f0-9]{64}$/) });
const rejectedAuthoringAttempt = z.strictObject({ mode: z.literal('built-in-imagegen'),status: z.literal('rejected-no-image'),requestId: z.string().min(1),reason: z.string().min(1),prompt: z.string().min(1) });
export const wardrobeFoundationPlanSchema = z.strictObject({
  schemaVersion: z.literal(1),id: z.literal('heroine.s.wardrobe-foundation-v1'),direction: z.literal('S'),bodyId: z.literal('heroine.s.body-v4'),surfaceId: z.literal('body.s.complete-surface-v1'),status: z.enum(['artwork-blocked','draft-needs-human-review']),
  baseSkin: pin,bodyFootprint: pin,
  replacements: z.tuple([
    z.strictObject({ regionId: z.literal('chest'),surfaceId: z.literal('chest.s.smooth-v1'),region: pin,image: pin.nullable() }),
    z.strictObject({ regionId: z.literal('pelvis'),surfaceId: z.literal('pelvis.s.smooth-v1'),region: pin,image: pin.nullable() }),
  ]),
  plannedUnderwearCuts: z.array(z.string().min(1)).min(1),
  authoringAttempt: rejectedAuthoringAttempt,
  coveredUnderwearAttempt: rejectedAuthoringAttempt.optional(),
  productionApproved: z.literal(false),
});

/** Read-only audit: never synthesise missing skin or claim that planned cuts already exist. */
export async function auditWardrobeFoundation(repository: string) {
  const root = await realpath(resolve(repository,'assets/source/heroine-v1'));
  const plan = wardrobeFoundationPlanSchema.parse(JSON.parse(await readFile(resolve(repository,'docs/wardrobe-foundation-pending.json'),'utf8')));
  const load = async (input: z.infer<typeof pin>) => {
    const path = resolve(root,input.source), relativePath = relative(root,path);
    if (isAbsolute(relativePath) || relativePath === '..' || relativePath.startsWith('../') || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error('Ordinary pinned foundation inputs inside source assets required.');
    const bytes = await readFile(path);
    if (sha256(bytes) !== input.sourceSha256) throw new Error('Wardrobe foundation input changed: ' + input.source);
    const image = decodePng(bytes);
    if (image.width !== 1024 || image.height !== 1536) throw new Error('Native 1024x1536 foundation input required.');
    return image;
  };
  const [baseSkin,bodyFootprint] = await Promise.all([load(plan.baseSkin),load(plan.bodyFootprint)]);
  const regions = new Map<string,RgbaImage>(),parts = new Map<string,AuthoredSurfacePart>(),surfaces = [];
  for (const replacement of plan.replacements) {
    const region = await load(replacement.region); regions.set(replacement.regionId,region);
    let replacementPixels = 0,missingBasePixels = 0;
    for (let p = 3; p < region.data.length; p += 4) if (region.data[p]) { replacementPixels++; if (baseSkin.data[p]! < bodyFootprint.data[p]!) missingBasePixels++; }
    if (replacement.image) parts.set(replacement.surfaceId,{ bodyId: plan.bodyId,direction: plan.direction,image: await load(replacement.image) });
    surfaces.push({ regionId: replacement.regionId,surfaceId: replacement.surfaceId,authored: replacement.image !== null,replacementPixels,missingBasePixels });
  }
  const missingSurfaces = surfaces.filter(s => !s.authored).map(s => s.surfaceId);
  // Once supplied, replacement art must pass the same native assembly checks exercised by fitting tests.
  if (!missingSurfaces.length) assembleWardrobeSurface({ schemaVersion: 1,id: plan.surfaceId,bodyId: plan.bodyId,direction: plan.direction,replacements: plan.replacements.map(({ regionId,surfaceId }) => ({ regionId,surfaceId })) },{ bodyId: plan.bodyId,direction: plan.direction,baseSkin,bodyFootprint,regions,parts });
  return { id: plan.id,direction: plan.direction,completeSurfaceAvailable: missingSurfaces.length === 0,arbitraryUnderwearCompatibilityApproved: false,surfaces,missingSurfaces,plannedCutsAwaitingSurfaceFit: plan.plannedUnderwearCuts,productionApproved: false };
}
