import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareHeadReview } from './head-review';

const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  if (process.argv.length > 3 || (process.argv[2] && process.argv[2] !== '--v1')) throw new Error('Usage: head-review-cli.js [--v1]');
  const legacy = process.argv[2] === '--v1';
  const staging = `assets/staging/heroine-v1/head-soft-oval-v1${legacy ? '/v1' : ''}`;
  const report = await prepareHeadReview({
    sourceDirectory: resolve(repository, 'assets/source/heroine-v1/head-soft-oval-v1'),
    hairDirectory: resolve(repository, 'assets/source/heroine-v1/hair-long-waves-v1'),
    referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/reference-import-v1/transparent'),
    outputDirectory: resolve(repository, staging),
    configSource: legacy ? 'authoring-v1.json' : 'authoring-v2.json',
  });
  console.log(`Prepared ${report.measurements.length} native anatomy layers for S/N review.`);
  console.log(`Review: ${staging}/overview.png. ${legacy ? 'Original unresolved fit.' : 'Versioned S fringe-fit candidate.'} Anatomy/body/T-pose compatibility needs human review.`);
} catch (error) { console.error(error); process.exitCode = 1; }
