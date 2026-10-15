import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareBodyPartSetReview } from './body-part-set-review';
try {
  if (process.argv.length > 2) throw new Error('Usage: body-part-set-review-cli.js');
  const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
  const report = await prepareBodyPartSetReview({ selectionDirectory: resolve(repository, 'assets/source/heroine-v1/body/parts-assembly-v1'), assetDirectory: resolve(repository, 'assets/source/heroine-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), stagingDirectory: resolve(repository, 'assets/staging/heroine-v1'), outputDirectory: resolve(repository, 'assets/staging/heroine-v1/body/parts-assembly-v1') });
  console.log(`Prepared eight approved native part compositions: ${report.status}. Profile far limbs remain unavailable; concealed joints and separate clothing are unfinished.`);
} catch (error) { console.error(error); process.exitCode = 1; }
