import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareNorthBodyReview } from './body-north-review';
const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  if (process.argv.length !== 2) throw new Error('Usage: body-north-review-cli.js');
  const report = await prepareNorthBodyReview({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1/body/north-v1'), assetDirectory: resolve(repository, 'assets/source/heroine-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository, 'assets/staging/heroine-v1/body/north-v1') });
  console.log(`Prepared independently authored N body: ${report.status}; accepted native head, bounded neck attachment and actual posterior hair depth. Review anatomy and neck/shoulder fit.`);
} catch (error) { console.error(error); process.exitCode = 1; }
