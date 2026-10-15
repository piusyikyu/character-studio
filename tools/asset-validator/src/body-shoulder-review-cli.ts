import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareShoulderReview } from './body-shoulder-review';
try {
  if (process.argv.length > 2) throw new Error('Usage: body-shoulder-review-cli.js');
  const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
  const report = await prepareShoulderReview({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1/body/shoulders-v1'), assetDirectory: resolve(repository, 'assets/source/heroine-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository, 'assets/staging/heroine-v1/body/shoulders-v1') });
  console.log(`Prepared S concealed shoulder-root study: ${report.status}. Native body/anatomy/hair fit remains exact; proximal roots await review.`);
} catch (error) { console.error(error); process.exitCode = 1; }
