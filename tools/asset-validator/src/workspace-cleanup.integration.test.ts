import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { expect, it } from 'vitest';
import { cleanWorkspace } from './workspace-cleanup';

it('cleans generated data while preserving current reviews and sources, and rejects unsafe metadata or symlinks before deletion', async () => {
  const repository = await mkdtemp(resolve(tmpdir(), 'character-workspace-cleanup-'));
  try {
    const face = 'assets/staging/heroine-v1/face/reference-v1', refs = 'assets/staging/heroine-v1/references/import-v1';
    const save = async (path: string, data = path) => { await mkdir(resolve(repository, path, '..'), { recursive: true }); await writeFile(resolve(repository, path), data); };
    const diagonal = `${face}/front-diagonals`, diagonalMetadata = { outputs: [{ path: 'fit/SE.png' }, { path: 'fit/SW.png' }, { path: 'overview.png' }] };
    const metadata = { outputs: [{ path: 'fit/S.png' }], interactiveInspection: { path: 'inspection/head-reference-overlay.html' } };
    const preserved = [`${diagonal}/fit/SE.png`, `${diagonal}/fit/SW.png`, `${diagonal}/overview.png`,'assets/source/heroine-v1/face/reference-v1/authoring-v4.json', 'assets/source/heroine-v1/head/soft-oval-v1/approved.png', 'assets/references/heroine-v1/detailed/S.png', 'packages/renderer-canvas/src/index.ts', `${face}/fit/S.png`, `${face}/inspection/head-reference-overlay.html`, `${refs}/transparent/S.png`, `${refs}/audit.md`, `${refs}/metadata.json`];
    const obsolete = [`${diagonal}/historical-v0/overview.png`,`${face}/historical-v3/overview.png`, `${refs}/inspection/checker/S.png`, 'assets/staging/heroine-v1/head/soft-oval-v1/overview.png', 'assets/detailed/placeholder-v1/S.png', 'test-results/report.json', 'packages/core/dist/index.js'];
    for (const path of [...preserved, ...obsolete]) await save(path);
    await save(`${face}/metadata.json`, JSON.stringify(metadata));
    await save(`${diagonal}/metadata.json`, JSON.stringify(diagonalMetadata));
    const dry = await cleanWorkspace({ repository, dryRun: true, buildOutputs: true });
    expect(dry.files.map(file => file.path).sort()).toEqual(obsolete.slice().sort());
    for (const path of obsolete) expect(await readFile(resolve(repository, path), 'utf8')).toBe(path);
    // A forged output cannot protect or redirect removal into source artwork.
    await save(`${face}/metadata.json`, JSON.stringify({ outputs: [{ path: '../../../../source/approved.png' }] }));
    await expect(cleanWorkspace({ repository, buildOutputs: true })).rejects.toThrow('unsafe output path');
    for (const path of obsolete) expect(await readFile(resolve(repository, path), 'utf8')).toBe(path);
    await save(`${face}/metadata.json`, JSON.stringify(metadata));
    await save(`${diagonal}/metadata.json`, JSON.stringify(diagonalMetadata));
    await save(`${diagonal}/metadata.json`, JSON.stringify({ outputs: [{ path: '../../../../../source/approved.png' }] }));
    await expect(cleanWorkspace({ repository, buildOutputs: true })).rejects.toThrow('unsafe output path');
    for (const path of obsolete) expect(await readFile(resolve(repository, path), 'utf8')).toBe(path);
    await save(`${diagonal}/metadata.json`, JSON.stringify(diagonalMetadata));
    const link = resolve(repository, 'assets/staging/source-link'); await symlink(resolve(repository, 'assets/source'), link);
    await expect(cleanWorkspace({ repository, buildOutputs: true })).rejects.toThrow('cannot traverse symlinks');
    for (const path of obsolete) expect(await readFile(resolve(repository, path), 'utf8')).toBe(path);
    await rm(link);
    const result = await cleanWorkspace({ repository, buildOutputs: true }); expect(result.files).toEqual(dry.files);
    for (const path of obsolete) await expect(readFile(resolve(repository, path))).rejects.toThrow('ENOENT');
    for (const path of preserved) expect(await readFile(resolve(repository, path), 'utf8')).toBe(path);
    expect((await cleanWorkspace({ repository, buildOutputs: true })).deletedFiles).toBe(0);
  } finally { await rm(repository, { recursive: true, force: true }); }
});
