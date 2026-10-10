import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareHeadReview } from './head-review';

const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  if (process.argv.length !== 2) throw new Error('Usage: head-review-cli.js');
  const report = await prepareHeadReview({
    sourceDirectory: resolve(repository, 'assets/source/heroine-v1/head-soft-oval-v1'),
    hairDirectory: resolve(repository, 'assets/source/heroine-v1/hair-long-waves-v1'),
    referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/reference-import-v1/transparent'),
    outputDirectory: resolve(repository, 'assets/staging/heroine-v1/head-soft-oval-v1'),
  });
  console.log(`Prepared ${report.measurements.length} native anatomy layers for S/N review.`);
  console.log('Review: assets/staging/heroine-v1/head-soft-oval-v1/overview.png. Skin bases only; anatomy/body/T-pose compatibility needs human review.');
} catch (error) { console.error(error); process.exitCode = 1; }
