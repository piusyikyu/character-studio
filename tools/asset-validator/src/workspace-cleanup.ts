import { lstat, readFile, readdir, realpath, rm, rmdir } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';

const face = 'assets/staging/heroine-v1/face/reference-v1';
const references = 'assets/staging/heroine-v1/references/import-v1';
const generated = ['assets/staging', 'assets/placeholder-v1', 'assets/detailed/placeholder-v1', 'assets/pixel/placeholder-v1', 'apps/studio/public/placeholder-assets', 'artifacts/render-demo', 'coverage', 'test-results', 'playwright-report', '.vite'];
const inside = (parent: string, path: string) => { const p = relative(parent, path); return p === '' || (!isAbsolute(p) && p !== '..' && !p.startsWith('../')); };
const missing = (error: unknown) => (error as NodeJS.ErrnoException).code === 'ENOENT';

/** Delete only generated workspace data; current review, references and all source assets are protected. */
export async function cleanWorkspace(options: { repository: string; dryRun?: boolean; buildOutputs?: boolean }) {
  const repository = await realpath(resolve(options.repository)), keep = new Set<string>();
  const keepPath = (base: string, path: unknown) => {
    if (typeof path !== 'string' || !path || isAbsolute(path) || !inside(resolve(repository, base), resolve(repository, base, path))) throw new Error('Review metadata contains an unsafe output path.');
    keep.add(resolve(repository, base, path));
  };
  const preserveWholeReviews: string[] = [];
  for (const review of [face, `${face}/front-diagonals`, `${face}/profiles`, `${face}/brows`, 'assets/staging/heroine-v1/body/reference-v1', 'assets/staging/heroine-v1/body/parts-v1', 'assets/staging/heroine-v1/body/parts-v1/north', 'assets/staging/heroine-v1/body/north-v1', 'assets/staging/heroine-v1/body/profiles-v1', 'assets/staging/heroine-v1/body/profiles-v1/west', 'assets/staging/heroine-v1/body/front-diagonals-v1', 'assets/staging/heroine-v1/body/front-diagonals-v1/southwest', 'assets/staging/heroine-v1/ears/human-v1/profiles', 'assets/staging/heroine-v1/ears/human-v1/front-diagonals', 'assets/staging/heroine-v1/ears/human-v1/back-diagonals', 'assets/staging/heroine-v1/ears/human-v1/north', 'assets/staging/heroine-v1/head/soft-oval-v1/north', 'assets/staging/heroine-v1/head/assembly-v1']) try {
    const bytes = await readFile(resolve(repository, review, 'metadata.json'));
    const metadata: unknown = JSON.parse(bytes.toString('utf8'));
    if (!metadata || typeof metadata !== 'object' || !('outputs' in metadata) || !Array.isArray(metadata.outputs)) throw new Error('Current review metadata must declare outputs.');
    for (const output of metadata.outputs as unknown[]) {
      if (!output || typeof output !== 'object' || !('path' in output)) throw new Error('Current review metadata contains an invalid output.');
      keepPath(review, output.path);
    }
    if ('interactiveInspection' in metadata && metadata.interactiveInspection) {
      if (typeof metadata.interactiveInspection !== 'object' || !('path' in metadata.interactiveInspection)) throw new Error('Current review metadata contains an invalid viewer.');
      keepPath(review, metadata.interactiveInspection.path);
    }
    keepPath(review, 'metadata.json');
  } catch (error) { if (!missing(error)) throw error; preserveWholeReviews.push(review); }
  const keepFile = (path: string) => keep.has(path) || inside(resolve(repository, references, 'transparent'), path)
    || path === resolve(repository, references, 'metadata.json') || path === resolve(repository, references, 'audit.md')
    || preserveWholeReviews.some(review => inside(resolve(repository, review), path));
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
    } else if (info.isFile() && !keepFile(path)) files.push({ path: relative(repository, path), bytes: info.size });
  };
  for (const root of roots) await scan(root);
  // Planning finishes before deletion, including metadata and symlink validation.
  if (!options.dryRun) {
    for (const file of files) await rm(resolve(repository, file.path));
    for (const path of directories.reverse()) {
      try { await rmdir(path); } catch (error) { if (!missing(error) && (error as NodeJS.ErrnoException).code !== 'ENOTEMPTY') throw error; }
    }
  }
  return { dryRun: options.dryRun ?? false, deletedFiles: files.length, deletedBytes: files.reduce((sum, file) => sum + file.bytes, 0), files,
    preserved: ['All source/reference artwork and approval/configuration records', 'Current facial reviews, S viewer, ear/anatomy reviews, S body/part reviews and the consolidated eight-facing head review', 'Native transparent reference dependency and import audit'], buildOutputs: options.buildOutputs ?? false };
}
