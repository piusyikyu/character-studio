import { lstat, readdir, realpath, rm, rmdir } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

const generated = ['assets/staging', 'assets/placeholder-v1', 'assets/detailed/placeholder-v1', 'assets/pixel/placeholder-v1', 'apps/studio/public/placeholder-assets', 'artifacts/render-demo', 'coverage', 'test-results', 'playwright-report', '.vite'];
const missing = (error: unknown) => (error as NodeJS.ErrnoException).code === 'ENOENT';

/** Delete only allowlisted generated data; source artwork and original references are never cleanup roots. */
export async function cleanWorkspace(options: { repository: string; dryRun?: boolean; buildOutputs?: boolean }) {
  const repository = await realpath(resolve(options.repository));
  const roots = generated.map(path => resolve(repository, path));
  if (options.buildOutputs) {
    for (const group of ['apps', 'packages', 'tools']) {
      try {
        for (const entry of await readdir(resolve(repository, group), { withFileTypes: true })) if (entry.isDirectory()) roots.push(resolve(repository, group, entry.name, 'dist'));
      } catch (error) { if (!missing(error)) throw error; }
    }
  }
  const files: { path: string; bytes: number }[] = [], directories: string[] = [];
  const scan = async (path: string) => {
    let info;
    try { info = await lstat(path); } catch (error) { if (missing(error)) return; throw error; }
    if (info.isSymbolicLink() || await realpath(path) !== path) throw new Error(`Generated cleanup cannot traverse symlinks: ${relative(repository, path)}`);
    if (info.isDirectory()) {
      directories.push(path);
      for (const entry of (await readdir(path)).sort()) await scan(resolve(path, entry));
    } else if (info.isFile()) files.push({ path: relative(repository, path), bytes: info.size });
  };
  for (const root of roots) await scan(root);
  // Validate every root before deleting anything, including rejecting symlink traversal.
  if (!options.dryRun) {
    for (const file of files) await rm(resolve(repository, file.path));
    for (const path of directories.reverse()) {
      try { await rmdir(path); } catch (error) { if (!missing(error) && (error as NodeJS.ErrnoException).code !== 'ENOTEMPTY') throw error; }
    }
  }
  return { dryRun: options.dryRun ?? false, deletedFiles: files.length, deletedBytes: files.reduce((sum, file) => sum + file.bytes, 0), files,
    preserved: ['Source artwork and original references', 'Project code, manifests, documentation and dependencies'], buildOutputs: options.buildOutputs ?? false };
}
