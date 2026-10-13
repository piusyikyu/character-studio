import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareNorthEarReview } from './ear-north-review';
const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  if (process.argv.length > 2) throw new Error('Usage: ear-north-review-cli.js');
  await prepareNorthEarReview({ sourceDirectory: resolve(repository,'assets/source/heroine-v1/ears/human-v1/north-v1'), headDirectory: resolve(repository,'assets/source/heroine-v1/head/soft-oval-v1'), hairDirectory: resolve(repository,'assets/source/heroine-v1/hair/long-waves-v1'), referenceDirectory: resolve(repository,'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository,'assets/staging/heroine-v1/ears/human-v1/north') });
  console.log('Prepared N ear/root candidate. Review anatomy-overview.png column two; original human head and posterior fit remain exact. Visual approval is pending.');
} catch (error) { console.error(error); process.exitCode = 1; }
