import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareBodyPartsReview } from './body-parts-review';
const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  if (process.argv.length !== 2) throw new Error('Usage: body-parts-review-cli.js');
  const report = await prepareBodyPartsReview({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1/body/parts-v1'), assetDirectory: resolve(repository, 'assets/source/heroine-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository, 'assets/staging/heroine-v1/body/parts-v1') });
  console.log(`Prepared five native S body planes: ${report.status}; actual composition matches the approved fit exactly. Review part cuts; concealed joints and separate clothing remain unfinished.`);
} catch (error) { console.error(error); process.exitCode = 1; }
