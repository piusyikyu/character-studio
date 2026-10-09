import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareHairReview } from './hair-review';

const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  const report = await prepareHairReview({
    sourceDirectory: resolve(repository, 'assets/source/heroine-v1/hair-long-waves-v1'),
    referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/reference-import-v1/transparent'),
    outputDirectory: resolve(repository, 'assets/staging/heroine-v1/hair-long-waves-v1'),
  });
  console.log(`Prepared ${report.measurements.length} native hair layers for S/N review; N front fringe explicitly hidden.`);
  console.log('Review: assets/staging/heroine-v1/hair-long-waves-v1/overview.png. Draft only; rig/T-pose compatibility unverified.');
} catch (error) { console.error(error); process.exitCode = 1; }
