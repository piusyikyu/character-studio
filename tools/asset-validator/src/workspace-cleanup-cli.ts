import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanWorkspace } from './workspace-cleanup';

try {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--dry-run', '--build-outputs'].includes(arg))) throw new Error('Usage: workspace-cleanup-cli.js [--dry-run] [--build-outputs]');
  const report = await cleanWorkspace({ repository: resolve(fileURLToPath(new URL('../../..', import.meta.url))), dryRun: args.includes('--dry-run'), buildOutputs: args.includes('--build-outputs') });
  console.log(`${report.dryRun ? 'Would remove' : 'Removed'} ${report.deletedFiles} generated files (${(report.deletedBytes / 1024 / 1024).toFixed(1)} MiB).`);
  console.log('Preserved source artwork, original references and project files. Staging, previews and placeholders are regenerable.');
} catch (error) { console.error(error); process.exitCode = 1; }
