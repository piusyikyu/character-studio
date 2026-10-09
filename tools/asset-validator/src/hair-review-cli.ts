import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareHairReview } from './hair-review';

const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--profiles') || args.length > 1) throw new Error('Usage: hair-review-cli.js [--profiles]');
  const profiles = args.includes('--profiles');
  const report = await prepareHairReview({
    sourceDirectory: resolve(repository, 'assets/source/heroine-v1/hair-long-waves-v1'),
    referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/reference-import-v1/transparent'),
    outputDirectory: resolve(repository, 'assets/staging/heroine-v1/hair-long-waves-v1', ...(profiles ? ['profiles'] : [])),
    configFilename: profiles ? 'profiles-authoring-v1.json' : 'authoring-v1.json',
  });
  console.log(`Prepared ${report.measurements.length} native hair layers for ${report.supportedReviewDirections.join('/')} review.`);
  console.log(`Review: assets/staging/heroine-v1/hair-long-waves-v1/${profiles ? 'profiles/' : ''}overview.png. Authoring review only; rig/T-pose compatibility unverified.`);
} catch (error) { console.error(error); process.exitCode = 1; }
