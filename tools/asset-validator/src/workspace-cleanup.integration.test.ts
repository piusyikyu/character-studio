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
    const profiles = `${face}/profiles`, profileMetadata = { outputs: [{ path: 'fit/E.png' }, { path: 'fit/W.png' }, { path: 'overview.png' }] };
    const ears = 'assets/staging/heroine-v1/ears/human-v1/profiles', earMetadata = { outputs: [{ path: 'fit/E-human.png' }, { path: 'fit/W-earless.png' }, { path: 'anatomy-overview.png' }] };
    const diagonalEars = 'assets/staging/heroine-v1/ears/human-v1/front-diagonals', diagonalEarMetadata = { outputs: [{ path: 'fit/SE-human.png' }, { path: 'fit/SW-earless.png' }, { path: 'anatomy-overview.png' }] };
    const backEars = 'assets/staging/heroine-v1/ears/human-v1/back-diagonals', backEarMetadata = { outputs: [{ path: 'fit/NE-human.png' }, { path: 'fit/NW-earless.png' }, { path: 'anatomy-overview.png' }] };
    const north = 'assets/staging/heroine-v1/head/soft-oval-v1/north', northMetadata = { outputs: [{ path: 'fit/N.png' }, { path: 'layers/N-head.png' }, { path: 'overview.png' }] };
    const metadata = { outputs: [{ path: 'fit/S.png' }], interactiveInspection: { path: 'inspection/head-reference-overlay.html' } };
    const preserved = [`${diagonalEars}/fit/SE-human.png`, `${diagonalEars}/fit/SW-earless.png`, `${diagonalEars}/anatomy-overview.png`, `${ears}/fit/E-human.png`, `${ears}/fit/W-earless.png`, `${ears}/anatomy-overview.png`, `${profiles}/fit/E.png`, `${profiles}/fit/W.png`, `${profiles}/overview.png`, `${diagonal}/fit/SE.png`, `${diagonal}/fit/SW.png`, `${diagonal}/overview.png`,'assets/source/heroine-v1/face/reference-v1/authoring-v4.json', 'assets/source/heroine-v1/head/soft-oval-v1/approved.png', 'assets/references/heroine-v1/detailed/S.png', 'packages/renderer-canvas/src/index.ts', `${face}/fit/S.png`, `${face}/inspection/head-reference-overlay.html`, `${refs}/transparent/S.png`, `${refs}/audit.md`, `${refs}/metadata.json`];
    const obsolete = [`${diagonalEars}/historical-v0/overview.png`, `${ears}/historical-v0/overview.png`, `${profiles}/historical-v0/overview.png`, `${diagonal}/historical-v0/overview.png`,`${face}/historical-v3/overview.png`, `${refs}/inspection/checker/S.png`, 'assets/staging/heroine-v1/head/soft-oval-v1/overview.png', 'assets/detailed/placeholder-v1/S.png', 'test-results/report.json', 'packages/core/dist/index.js'];
    for (const path of [...preserved, ...obsolete]) await save(path);
    for (const file of backEarMetadata.outputs) { const path = `${backEars}/${file.path}`; preserved.push(path); await save(path); }
    for (const file of northMetadata.outputs) { const path = `${north}/${file.path}`; preserved.push(path); await save(path); }
    obsolete.push(`${north}/historical-v0/overview.png`); await save(obsolete.at(-1)!);
    obsolete.push(`${backEars}/historical-v0/overview.png`); await save(obsolete.at(-1)!);
    await save(`${face}/metadata.json`, JSON.stringify(metadata));
    await save(`${diagonal}/metadata.json`, JSON.stringify(diagonalMetadata));
    await save(`${profiles}/metadata.json`, JSON.stringify(profileMetadata));
    await save(`${ears}/metadata.json`, JSON.stringify(earMetadata));
    await save(`${diagonalEars}/metadata.json`, JSON.stringify(diagonalEarMetadata));
    await save(`${backEars}/metadata.json`, JSON.stringify(backEarMetadata));
    await save(`${north}/metadata.json`, JSON.stringify(northMetadata));
    const dry = await cleanWorkspace({ repository, dryRun: true, buildOutputs: true });
    expect(dry.files.map(file => file.path).sort()).toEqual(obsolete.slice().sort());
    for (const path of obsolete) expect(await readFile(resolve(repository, path), 'utf8')).toBe(path);
    // A forged output cannot protect or redirect removal into source artwork.
    await save(`${face}/metadata.json`, JSON.stringify({ outputs: [{ path: '../../../../source/approved.png' }] }));
    await expect(cleanWorkspace({ repository, buildOutputs: true })).rejects.toThrow('unsafe output path');
    for (const path of obsolete) expect(await readFile(resolve(repository, path), 'utf8')).toBe(path);
    await save(`${face}/metadata.json`, JSON.stringify(metadata));
    await save(`${north}/metadata.json`, JSON.stringify({ outputs: [{ path: '../../../../../../source/approved.png' }] }));
    await expect(cleanWorkspace({ repository, buildOutputs: true })).rejects.toThrow('unsafe output path');
    for (const path of obsolete) expect(await readFile(resolve(repository, path), 'utf8')).toBe(path);
    await save(`${north}/metadata.json`, JSON.stringify(northMetadata));
    await save(`${backEars}/metadata.json`, JSON.stringify({ outputs: [{ path: '../../../../../../source/approved.png' }] }));
    await expect(cleanWorkspace({ repository, buildOutputs: true })).rejects.toThrow('unsafe output path');
    for (const path of obsolete) expect(await readFile(resolve(repository, path), 'utf8')).toBe(path);
    await save(`${backEars}/metadata.json`, JSON.stringify(backEarMetadata));
    await save(`${diagonalEars}/metadata.json`, JSON.stringify({ outputs: [{ path: '../../../../../../source/approved.png' }] }));
    await expect(cleanWorkspace({ repository, buildOutputs: true })).rejects.toThrow('unsafe output path');
    for (const path of obsolete) expect(await readFile(resolve(repository, path), 'utf8')).toBe(path);
    await save(`${diagonalEars}/metadata.json`, JSON.stringify(diagonalEarMetadata));
    await save(`${ears}/metadata.json`, JSON.stringify({ outputs: [{ path: '../../../../../../source/approved.png' }] }));
    await expect(cleanWorkspace({ repository, buildOutputs: true })).rejects.toThrow('unsafe output path');
    for (const path of obsolete) expect(await readFile(resolve(repository, path), 'utf8')).toBe(path);
    await save(`${ears}/metadata.json`, JSON.stringify(earMetadata));
    await save(`${diagonal}/metadata.json`, JSON.stringify(diagonalMetadata));
    await save(`${profiles}/metadata.json`, JSON.stringify({ outputs: [{ path: '../../../../../source/approved.png' }] }));
    await expect(cleanWorkspace({ repository, buildOutputs: true })).rejects.toThrow('unsafe output path');
    for (const path of obsolete) expect(await readFile(resolve(repository, path), 'utf8')).toBe(path);
    await save(`${profiles}/metadata.json`, JSON.stringify(profileMetadata));
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
