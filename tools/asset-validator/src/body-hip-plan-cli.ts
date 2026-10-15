import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareHipPlan } from './body-hip-plan';
try {
  if (process.argv.length > 2) throw new Error('Usage: body-hip-plan-cli.js');
  const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
  const report = await prepareHipPlan({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1/body/hips-v1'), assetDirectory: resolve(repository, 'assets/source/heroine-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository, 'assets/staging/heroine-v1/body/hips-v1') });
  console.log(`Prepared S hip-root planning checkpoint: ${report.status}. No new leg artwork exists; coloured overlays are diagnostics only.`);
} catch (error) { console.error(error); process.exitCode = 1; }
