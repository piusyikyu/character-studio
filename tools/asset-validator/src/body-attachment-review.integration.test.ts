import { cp, mkdtemp, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { ANCHORS } from '@character-studio/core';
import { attachmentReviewSchema, prepareAttachmentReview } from './body-attachment-review';
import { sha256 } from './reference-import';
const repository = fileURLToPath(new URL('../../../', import.meta.url));

it('reviews real S registrations with explicit unavailable hips, retained artwork and safe source/output boundaries', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-attachment-test-'));
  try {
    const assets = resolve(repository, 'assets/source/heroine-v1'), source = resolve(assets, 'body/attachments-v1');
    const options = { sourceDirectory: source, assetDirectory: assets, referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), reviewDirectory: resolve(repository, 'assets/staging/heroine-v1/body'), outputDirectory: resolve(temporary, 'review') };
    const bytes = await readFile(resolve(source, 'authoring.json')), config = attachmentReviewSchema.parse(JSON.parse(bytes.toString('utf8')));
    const paths = [resolve(source, 'authoring.json'), resolve(assets, config.shoulderApproval.source), resolve(options.reviewDirectory, 'parts-v1/fit/S-anatomy.png'), resolve(options.reviewDirectory, 'shoulders-v1/fit/S.png')];
    const before = await Promise.all(paths.map(async path => ({ path, sha256: sha256(await readFile(path)), mtimeMs: (await stat(path)).mtimeMs })));
    const report = await prepareAttachmentReview(options);
    expect(report).toMatchObject({ direction: 'S', sourcePose: 'tpose-study', availableCandidates: 11, unavailableAnchors: ['hip_left', 'hip_right'], measuredBaselineY: 1472, baselineAlphaThreshold: 128, approvedCompositionVerified: true, completeAnchorTableProduced: false, productionRigApproved: false, concealedJointsApproved: false, footwearCompatibilityApproved: false, finalStep6CAccepted: false, step6DStarted: false });
    expect(new Set(report.landmarks.map(a => a.id))).toEqual(new Set(ANCHORS));
    const htmlPath = resolve(options.outputDirectory, report.outputs[0]!.path), html = await readFile(htmlPath, 'utf8');
    expect(sha256(Buffer.from(html))).toBe(report.outputs[0]!.sha256);
    expect(html).not.toMatch(/<script|<button|data:image/);
    // Both native external images must resolve and match the approved replay hashes.
    const images = [...html.matchAll(/<image href="([^"]+)" width="1024" height="1536"/g)];
    expect(images).toHaveLength(2);
    for (const [i, image] of images.entries()) expect(sha256(await readFile(resolve(dirname(htmlPath), image[1]!)))).toBe(report.dependencies[i]!.sourceSha256);
    expect(html.match(/<circle /g)).toHaveLength(20);
    const repeat = await prepareAttachmentReview({ ...options, outputDirectory: resolve(temporary, 'repeat') });
    expect(repeat).toEqual(report);
    const forged = resolve(temporary, 'forged'); await cp(source, forged, { recursive: true });
    const mutate = async (change: (c: typeof config) => void) => { const c = attachmentReviewSchema.parse(JSON.parse(bytes.toString('utf8'))); change(c); await writeFile(resolve(forged, 'authoring.json'), JSON.stringify(c)); };
    await mutate(c => { c.landmarks.find(a => a.id === 'hip_left')!.position = { x: 585, y: 710 }; });
    await expect(prepareAttachmentReview({ ...options, sourceDirectory: forged })).rejects.toThrow('Concealed hips must stay unavailable');
    await mutate(c => { c.landmarks.find(a => a.id === 'hand_right')!.position = { x: 947, y: 380 }; });
    await expect(prepareAttachmentReview({ ...options, sourceDirectory: forged })).rejects.toThrow('physical-side attachment identity');
    await mutate(c => { c.landmarks.find(a => a.id === 'ground_baseline')!.position = { x: 512, y: 1473 }; });
    await expect(prepareAttachmentReview({ ...options, sourceDirectory: forged })).rejects.toThrow('measured ground baseline disagree');
    await mutate(c => { c.baselineConfiguration.source = 'body/parts-v1/north/authoring.json'; });
    await expect(prepareAttachmentReview({ ...options, sourceDirectory: forged })).rejects.toThrow('accepted S configurations');
    await expect(prepareAttachmentReview({ ...options, outputDirectory: resolve(assets, 'unsafe') })).rejects.toThrow('must be disjoint');
    const linked = resolve(temporary, 'linked'); await symlink(source, linked);
    await expect(prepareAttachmentReview({ ...options, outputDirectory: resolve(linked, 'unsafe') })).rejects.toThrow('symlinks forbidden');
    for (const file of before) { expect(sha256(await readFile(file.path))).toBe(file.sha256); expect((await stat(file.path)).mtimeMs).toBe(file.mtimeMs); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 180_000);
