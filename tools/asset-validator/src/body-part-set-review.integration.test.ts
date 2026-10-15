import { mkdir, mkdtemp, readFile, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { expect, it } from 'vitest';
import { DIRECTIONS } from '@character-studio/core';
import { blankImage, decodePng, encodePng } from '@character-studio/render-utils';
import { bodyPartSetFacings, bodyPartSetSelectionSchema, prepareBodyPartSetReview } from './body-part-set-review';
import { checkerPreview } from './inspection';
import { sha256 } from './reference-import';
const repository = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const alphaHash = (data: Uint8Array | Uint8ClampedArray) => sha256(Uint8Array.from({ length: data.length / 4 }, (_, i) => data[i * 4 + 3]!));

it('rebuilds eight approved native part fits, exposes unavailable profile limbs, and isolates actual layers in the browser without changing source art', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-body-part-set-test-'));
  try {
    const assets = resolve(repository, 'assets/source/heroine-v1'), staging = resolve(repository, 'assets/staging/heroine-v1');
    const selectionDirectory = resolve(assets, 'body/parts-assembly-v1'), options = { selectionDirectory, assetDirectory: assets, referenceDirectory: resolve(staging, 'references/import-v1/transparent'), stagingDirectory: staging, outputDirectory: resolve(temporary, 'review') };
    const bytes = await readFile(resolve(selectionDirectory, 'review-selection.json')), selection = bodyPartSetSelectionSchema.parse(JSON.parse(bytes.toString('utf8')));
    const paths = [resolve(selectionDirectory, 'review-selection.json'), ...DIRECTIONS.flatMap(d => ['authoring.json', 'review-fit-v1.json'].map(name => resolve(assets, bodyPartSetFacings[d].directory, name)))];
    const before = await Promise.all(paths.map(async path => ({ path, sha256: sha256(await readFile(path)), mtimeMs: (await stat(path)).mtimeMs })));
    const forged = resolve(temporary, 'forged'); await mkdir(forged);
    const save = () => writeFile(resolve(forged, 'review-selection.json'), JSON.stringify(selection));
    selection.frames.NW = selection.frames.NE; await save();
    await expect(prepareBodyPartSetReview({ ...options, selectionDirectory: forged })).rejects.toThrow('same-facing part pack');
    selection.frames.NW = bodyPartSetSelectionSchema.parse(JSON.parse(bytes.toString('utf8'))).frames.NW;
    selection.frames.NW.approval.sourceSha256 = '0'.repeat(64); await save();
    await expect(prepareBodyPartSetReview({ ...options, selectionDirectory: forged })).rejects.toThrow('pinned input changed');
    await expect(prepareBodyPartSetReview({ ...options, outputDirectory: resolve(assets, 'unsafe') })).rejects.toThrow('must be disjoint');
    await expect(prepareBodyPartSetReview({ ...options, outputDirectory: resolve(staging, 'body/parts-v1') })).rejects.toThrow('must be disjoint');
    const unsafe = resolve(temporary, 'unsafe'); await mkdir(resolve(unsafe, 'inspection'), { recursive: true }); await symlink(resolve(assets, 'body/parts-v1/authoring.json'), resolve(unsafe, 'inspection/body-parts-review.html'));
    await expect(prepareBodyPartSetReview({ ...options, outputDirectory: unsafe })).rejects.toThrow('output symlinks forbidden');
    const report = await prepareBodyPartSetReview(options);
    expect(report).toMatchObject({ supportedReviewDirections: DIRECTIONS, individualPartsMatchApprovals: true, crossFacingPartSetApproved: false, newArtwork: false, published: false, productionAnatomyApproved: false, concealedJointsApproved: false, separateUnderwearAuthored: false, footwearCompatibilityApproved: false, finalStep6CAccepted: false, step6DStarted: false, unavailableGeometry: [{ direction: 'E', parts: ['left-arm','left-leg'] },{ direction: 'W', parts: ['right-arm','right-leg'] }] });
    const expected = blankImage(4096, 3072), alphas: string[] = [];
    for (const [index, direction] of DIRECTIONS.entries()) {
      const frame = report.frames[index]!, pack = bodyPartSetFacings[direction], approval = JSON.parse(await readFile(resolve(assets, pack.directory, 'review-fit-v1.json'), 'utf8'));
      expect(frame).toMatchObject({ direction, bodySha256: approval.bodySha256, bareSha256: approval.bareSha256, fitSha256: approval.fitSha256, exactApprovedFit: true });
      expect(frame.hiddenFrontalLayers).toEqual(['N','NE','NW'].includes(direction) ? ['eyes','eyebrows','mouth','hair-front'] : []);
      for (const p of frame.parts) if (p.visibility === 'occluded-unavailable') expect(p.artwork).toBeUndefined();
      const native = await readFile(resolve(staging, pack.directory, `fit/${direction}-body-only.png`)); expect(sha256(native)).toBe(frame.bodySha256);
      const image = decodePng(native); alphas.push(alphaHash(image.data));
      const panel = checkerPreview(image, direction), x = index % 4 * 1024, y = Math.floor(index / 4) * 1536;
      for (let row = 0; row < 1536; row++) expected.data.set(panel.data.subarray(row * 4096, (row + 1) * 4096), ((y + row) * 4096 + x) * 4);
    }
    expect(sha256(await readFile(resolve(options.outputDirectory, 'body-only-overview.png')))).toBe(sha256(encodePng(expected)));
    for (const output of [...report.outputs, report.interactiveInspection]) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
    for (const input of report.dependencies) expect(sha256(await readFile(resolve(input.root === 'source' ? assets : input.root === 'staging' ? staging : selectionDirectory, input.path)))).toBe(input.sha256);
    // Serve only this repo and the scratch review so the real relative image URLs are tested.
    const server = createServer(async (request, response) => {
      try {
        const path = decodeURIComponent(new URL(request.url!, 'http://localhost').pathname);
        if (![repository, temporary].some(base => path.startsWith(base + '/'))) { response.writeHead(403).end(); return; }
        response.setHeader('Content-Type', path.endsWith('.html') ? 'text/html' : 'image/png'); response.end(await readFile(path));
      } catch { response.writeHead(404).end(); }
    });
    await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    try {
      const browser = await chromium.launch({ headless: true });
      try {
        const page = await browser.newPage(), errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
        await page.goto(`http://127.0.0.1:${(server.address() as { port: number }).port}${options.outputDirectory}/inspection/body-parts-review.html`);
        const ready = () => page.waitForSelector('#grid[data-ready="true"]'); await ready();
        const actual = await page.evaluate(`(async () => Promise.all([...document.querySelectorAll('canvas')].map(async canvas => {const rgba=canvas.getContext('2d').getImageData(0,0,1024,1536).data,alpha=new Uint8Array(1024*1536);for(let i=0;i<alpha.length;i++)alpha[i]=rgba[i*4+3];return [...new Uint8Array(await crypto.subtle.digest('SHA-256',alpha))].map(n=>n.toString(16).padStart(2,'0')).join('');})))()`);
        expect(actual).toEqual(alphas);
        await page.selectOption('#direction', 'S'); await ready();
        for (const id of ['right-arm','left-arm','right-leg','left-leg']) await page.locator(`input[data-part="${id}"]`).uncheck();
        await ready();
        const torso = decodePng(await readFile(resolve(assets, 'body/parts-v1/S-torso-v1.png')));
        const torsoHash = await page.evaluate(`(async () => {const rgba=document.querySelector('#frame-S canvas').getContext('2d').getImageData(0,0,1024,1536).data,alpha=new Uint8Array(1024*1536);for(let i=0;i<alpha.length;i++)alpha[i]=rgba[i*4+3];return [...new Uint8Array(await crypto.subtle.digest('SHA-256',alpha))].map(n=>n.toString(16).padStart(2,'0')).join('');})()`);
        expect(torsoHash).toBe(alphaHash(torso.data));
        await page.click('#reset'); await ready(); expect(await page.locator('input:checked').count()).toBe(5);
        await page.selectOption('#direction', 'E'); await ready(); expect(await page.locator('#frame-E p').textContent()).toContain('Unavailable: left arm, left leg');
        await page.selectOption('#mode', 'hair'); await ready(); expect(await page.locator('input[data-part="torso"]').isDisabled()).toBe(true);
        await page.selectOption('#direction', 'NW'); await page.selectOption('#mode', 'anatomy'); await page.selectOption('#zoom', '1'); await page.selectOption('#background', 'black'); await ready();
        expect(await page.locator('#frame-NW canvas').evaluate(canvas => canvas.getBoundingClientRect().width)).toBe(1024);
        expect(await page.locator('#grid').getAttribute('data-background')).toBe('black'); expect(errors).toEqual([]); expect(await page.locator('#error').textContent()).toBe('');
      } finally { await browser.close(); }
    } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
    for (const file of before) { expect(sha256(await readFile(file.path))).toBe(file.sha256); expect((await stat(file.path)).mtimeMs).toBe(file.mtimeMs); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 360_000);
