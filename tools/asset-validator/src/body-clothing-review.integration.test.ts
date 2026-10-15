import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { decodePng, encodePng } from '@character-studio/render-utils';
import { prepareSouthwestClothingReview, southwestClothingReviewSchema } from './body-clothing-review';
import { sha256 } from './reference-import';

const repository = fileURLToPath(new URL('../../../', import.meta.url));

it('isolates the actual SW fabric correction from skin, alpha and head/hair, and rejects a re-pinned skin edit', async () => {
  const source = resolve(repository, 'assets/source/heroine-v1/body/front-diagonals-v1'), stage = resolve(repository, 'assets/staging/heroine-v1/body/front-diagonals-v1/southwest');
  const config = southwestClothingReviewSchema.parse(JSON.parse(await readFile(resolve(source, 'authoring-sw-v5.json'), 'utf8')));
  const load = async (base: string, path: string) => decodePng(await readFile(resolve(base, path)));
  const [original, body, mask, guide, anatomy, fit] = await Promise.all([load(source, config.originalBody.source), load(source, config.body.source), load(source, config.selection.source), load(source, config.guide.source), load(stage, 'fit/SW-anatomy.png'), load(stage, 'fit/SW.png')]);
  const metadata = JSON.parse(await readFile(resolve(stage, 'metadata.json'), 'utf8'));
  expect(metadata.configuration).toBe('authoring-sw-v5.json');
  expect(metadata.configSha256).toBe(sha256(await readFile(resolve(source, 'authoring-sw-v5.json'))));
  const outsideFit = fit.data.slice(), outsideBare = anatomy.data.slice();
  let selected = 0, changedOutside = 0, alphaChanges = 0, bareOutsideChanges = 0, originalLuminance = 0, newLuminance = 0;
  for (let p = 0; p < body.data.length; p += 4) {
    if (body.data[p + 3] !== original.data[p + 3]) alphaChanges++;
    if (!mask.data[p + 3]) {
      for (let c = 0; c < 4; c++) { if (body.data[p + c] !== original.data[p + c]) changedOutside++; if (anatomy.data[p + c] !== guide.data[p + c]) bareOutsideChanges++; }
    } else {
      selected++; originalLuminance += (original.data[p]! + original.data[p + 1]! + original.data[p + 2]!) / 3;
      newLuminance += (body.data[p]! + body.data[p + 1]! + body.data[p + 2]!) / 3;
      outsideFit.fill(0, p, p + 4); outsideBare.fill(0, p, p + 4);
    }
  }
  expect(selected).toBe(21207); expect(changedOutside).toBe(0); expect(alphaChanges).toBe(0); expect(bareOutsideChanges).toBe(0);
  expect((newLuminance - originalLuminance) / selected).toBeGreaterThan(25);
  expect(sha256(outsideFit)).toBe(metadata.baselineOutsideClothingFitSha256);
  expect(sha256(outsideBare)).toBe(metadata.baselineOutsideClothingBareSha256);
  for (const [x, y] of [[450, 550], [560, 780], [430, 900], [780, 375]]) { const p = (y! * 1024 + x!) * 4; expect(body.data.subarray(p, p + 4)).toEqual(original.data.subarray(p, p + 4)); }
  for (const output of metadata.outputs) expect(sha256(await readFile(resolve(stage, output.path)))).toBe(output.sha256);
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-sw-clothing-boundary-'));
  try {
    const forged = resolve(temporary, 'source'); await mkdir(forged);
    const paths = new Set(['authoring-sw-v4.json', 'review-fit-sw-v4.json', ...[config.originalBody, config.body, config.selection, config.settings, config.provenance, config.study, config.guide, config.colourReference, config.front, config.rear].map(p => p.source)]);
    for (const path of paths) { await mkdir(dirname(resolve(forged, path)), { recursive: true }); await copyFile(resolve(source, path), resolve(forged, path)); }
    const altered = { ...body, data: body.data.slice() }, p = (550 * 1024 + 450) * 4; altered.data[p] = altered.data[p]! ^ 1;
    const bytes = encodePng(altered); await writeFile(resolve(forged, config.body.source), bytes); config.body.sourceSha256 = sha256(bytes);
    await writeFile(resolve(forged, 'authoring-sw-v5.json'), JSON.stringify(config));
    await expect(prepareSouthwestClothingReview({ sourceDirectory: forged, assetDirectory: resolve(repository, 'assets/source/heroine-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(temporary, 'bad') })).rejects.toThrow('fabric-only tone transfer');
  } finally { await rm(temporary, { recursive: true, force: true }); }
});
