import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { expect, it } from 'vitest';
import { cleanWorkspace } from './workspace-cleanup';

it('removes generated previews and optional builds while preserving authoring inputs and project files', async () => {
  const repository = await mkdtemp(resolve(tmpdir(), 'character-workspace-cleanup-'));
  try {
    const save = async (path: string) => {
      await mkdir(resolve(repository, path, '..'), { recursive: true });
      await writeFile(resolve(repository, path), path);
    };
    const preserved = ['assets/source/body-v1/master.png', 'assets/references/heroine-v1/detailed/S.png', 'docs/project-context.md', 'packages/core/src/index.ts', 'node_modules/dependency/index.js'];
    const generated = ['assets/staging/anatomy-v1/metadata.json', 'assets/staging/anatomy-v1/preview.png', 'assets/detailed/placeholder-v1/S.png', 'assets/pixel/placeholder-v1/S.png', 'apps/studio/public/placeholder-assets/catalog.json', 'artifacts/render-demo/S.png', 'test-results/report.json'];
    const builds = ['packages/core/dist/index.js', 'tools/asset-validator/dist/import-cli.js', 'apps/studio/dist/index.html'];
    for (const path of [...preserved, ...generated, ...builds]) await save(path);
    const dry = await cleanWorkspace({ repository, dryRun: true });
    expect(dry.files.map(file => file.path).sort()).toEqual(generated.slice().sort());
    for (const path of generated) expect(await readFile(resolve(repository, path), 'utf8')).toBe(path);
    const result = await cleanWorkspace({ repository });
    expect(result.files).toEqual(dry.files);
    for (const path of generated) await expect(readFile(resolve(repository, path))).rejects.toThrow('ENOENT');
    for (const path of [...preserved, ...builds]) expect(await readFile(resolve(repository, path), 'utf8')).toBe(path);
    const built = await cleanWorkspace({ repository, buildOutputs: true });
    expect(built.files.map(file => file.path).sort()).toEqual(builds.slice().sort());
    for (const path of builds) await expect(readFile(resolve(repository, path))).rejects.toThrow('ENOENT');
    for (const path of preserved) expect(await readFile(resolve(repository, path), 'utf8')).toBe(path);
    expect((await cleanWorkspace({ repository, buildOutputs: true })).deletedFiles).toBe(0);
  } finally { await rm(repository, { recursive: true, force: true }); }
});

it('rejects symlink traversal before deleting any planned output', async () => {
  const repository = await mkdtemp(resolve(tmpdir(), 'character-cleanup-symlink-'));
  try {
    await mkdir(resolve(repository, 'assets/staging'), { recursive: true });
    await mkdir(resolve(repository, 'assets/source'), { recursive: true });
    const preview = resolve(repository, 'assets/staging/a-preview.png');
    const original = resolve(repository, 'assets/source/master.png');
    await writeFile(preview, 'preview');
    await writeFile(original, 'source');
    await symlink(resolve(repository, 'assets/source'), resolve(repository, 'assets/staging/z-source-link'));
    await expect(cleanWorkspace({ repository })).rejects.toThrow('cannot traverse symlinks');
    expect(await readFile(preview, 'utf8')).toBe('preview');
    expect(await readFile(original, 'utf8')).toBe('source');
  } finally { await rm(repository, { recursive: true, force: true }); }
});
