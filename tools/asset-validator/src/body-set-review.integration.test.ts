import { mkdir, mkdtemp, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { DIRECTIONS } from '@character-studio/core';
import { blankImage, decodePng, encodePng } from '@character-studio/render-utils';
import { checkerPreview } from './inspection';
import { sha256 } from './reference-import';
import { bodySetFacings, bodySetSelectionSchema, prepareBodySetReview } from './body-set-review';

const repository = fileURLToPath(new URL('../../../', import.meta.url));

it('rebuilds all eight approved body fits into native sheets, preserves source art, and rejects stale or foreign-facing selections', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-body-set-test-'));
  try {
    const assetDirectory = resolve(repository, 'assets/source/heroine-v1'), selectionDirectory = resolve(assetDirectory, 'body/assembly-v1');
    const options = { selectionDirectory, assetDirectory, referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(temporary, 'review') };
    const bytes = await readFile(resolve(selectionDirectory, 'review-selection-v3.json')), selection = bodySetSelectionSchema.parse(JSON.parse(bytes.toString('utf8')));
    const paths = [resolve(selectionDirectory, 'review-selection-v3.json'), ...DIRECTIONS.flatMap(d => {
      const p = bodySetFacings[d]; return [resolve(assetDirectory, p.directory, p.configuration), resolve(assetDirectory, p.directory, p.approval)];
    })];
    const before = await Promise.all(paths.map(async path => ({ path, sha256: sha256(await readFile(path)), mtimeMs: (await stat(path)).mtimeMs })));
    const report = await prepareBodySetReview(options);
    expect(report).toMatchObject({ status: 'needs-cross-facing-human-review', supportedReviewDirections: DIRECTIONS, individualFitsMatchApprovals: true, pendingCandidateDirections: [], crossFacingBodySetApproved: false, newArtwork: false, published: false, productionAnatomyApproved: false, concealedJointsApproved: false, separateUnderwearAuthored: false, footwearCompatibilityApproved: false, finalStep6CAccepted: false, step6DStarted: false, grid: { columns: 4, rows: 2, cellWidth: 1024, cellHeight: 1536, sampling: 'native-copy-no-transforms' } });
    for (const output of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
    const fitSheet = decodePng(await readFile(resolve(options.outputDirectory, 'overview.png'))), bareSheet = decodePng(await readFile(resolve(options.outputDirectory, 'anatomy-overview.png')));
    // Compare every copied panel to an independently approved native export; source pixels and label/checker decoration must be exact.
    for (const [index, direction] of DIRECTIONS.entries()) {
      const p = bodySetFacings[direction], accepted = JSON.parse(await readFile(resolve(assetDirectory, p.directory, p.approval), 'utf8'));
      const selected = report.frames[index]!;
      expect(selected.direction).toBe(direction); expect(selected.approvedBaselineFitSha256).toBe(accepted.fitSha256); expect(selected.approvedBaselineBareSha256).toBe(accepted.bareSha256);
      if (direction !== 'SW') { expect(selected.fitSha256).toBe(accepted.fitSha256); expect(selected.bareSha256).toBe(accepted.bareSha256); }
      else { expect(selected.individualFitApproved).toBe(true); expect(selected.fitSha256).not.toBe(accepted.fitSha256); }
      const stage = p.directory + (direction === 'W' ? '/west' : direction === 'SW' ? '/southwest' : direction === 'NW' ? '/northwest' : '');
      for (const [sheet, suffix, digest] of [[fitSheet, '', selected.fitSha256], [bareSheet, '-anatomy', selected.bareSha256]] as const) {
        const nativeBytes = await readFile(resolve(repository, 'assets/staging/heroine-v1', stage, `fit/${direction}${suffix}.png`));
        expect(sha256(nativeBytes)).toBe(digest);
        const expected = checkerPreview(decodePng(nativeBytes), direction), panel = blankImage(1024, 1536), x = index % 4 * 1024, y = Math.floor(index / 4) * 1536;
        for (let row = 0; row < 1536; row++) panel.data.set(sheet.data.subarray(((y + row) * 4096 + x) * 4, ((y + row) * 4096 + x + 1024) * 4), row * 4096);
        expect(sha256(encodePng(panel))).toBe(sha256(encodePng(expected)));
      }
    }
    const viewer = await readFile(resolve(options.outputDirectory, report.interactiveInspection.path));
    expect(sha256(viewer)).toBe(report.interactiveInspection.sha256);
    expect(await prepareBodySetReview({ ...options, outputDirectory: resolve(temporary, 'repeat') })).toEqual(report);
    const forged = resolve(temporary, 'forged'); await mkdir(forged);
    await writeFile(resolve(forged, 'review-selection-v3.json'), bytes);
    selection.southwestClothingApproval!.sourceSha256 = '0'.repeat(64);
    await writeFile(resolve(forged, 'review-selection-v3.json'), JSON.stringify(selection));
    await expect(prepareBodySetReview({ ...options, selectionDirectory: forged, outputDirectory: resolve(temporary, 'stale-clothing') })).rejects.toThrow('pinned input changed');
    selection.southwestClothingApproval = bodySetSelectionSchema.parse(JSON.parse(bytes.toString('utf8'))).southwestClothingApproval;
    selection.frames.NW = selection.frames.NE;
    await writeFile(resolve(forged, 'review-selection-v3.json'), JSON.stringify(selection));
    await expect(prepareBodySetReview({ ...options, selectionDirectory: forged, outputDirectory: resolve(temporary, 'wrong-facing') })).rejects.toThrow('independently authored selected body pack');
    selection.frames.NW = bodySetSelectionSchema.parse(JSON.parse(bytes.toString('utf8'))).frames.NW;
    selection.frames.NW.approval.sourceSha256 = '0'.repeat(64);
    await writeFile(resolve(forged, 'review-selection-v3.json'), JSON.stringify(selection));
    await expect(prepareBodySetReview({ ...options, selectionDirectory: forged, outputDirectory: resolve(temporary, 'stale') })).rejects.toThrow('pinned input changed');
    await expect(prepareBodySetReview({ ...options, outputDirectory: resolve(assetDirectory, 'unsafe') })).rejects.toThrow('must be disjoint');
    const unsafe = resolve(temporary, 'unsafe'); await mkdir(unsafe); await symlink(resolve(assetDirectory, 'body/reference-v1/S-body-v4.png'), resolve(unsafe, 'overview.png'));
    await expect(prepareBodySetReview({ ...options, outputDirectory: unsafe })).rejects.toThrow('output symlinks forbidden');
    for (const file of before) { expect(sha256(await readFile(file.path))).toBe(file.sha256); expect((await stat(file.path)).mtimeMs).toBe(file.mtimeMs); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 300_000);
