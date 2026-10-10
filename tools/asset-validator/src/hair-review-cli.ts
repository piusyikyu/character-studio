import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareHairReview } from './hair-review';

const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  const args = process.argv.slice(2);
  if (args.some((arg) => !['--profiles', '--front-diagonals', '--front-diagonals-completion', '--back-diagonals'].includes(arg)) || args.length > 1) throw new Error('Usage: hair-review-cli.js [--profiles | --front-diagonals | --front-diagonals-completion | --back-diagonals]');
  const group = args.includes('--back-diagonals') ? 'back-diagonals' : args.includes('--profiles') ? 'profiles' : args.includes('--front-diagonals-completion') ? 'front-diagonals-v5' : args.includes('--front-diagonals') ? 'front-diagonals' : '';
  const report = await prepareHairReview({
    sourceDirectory: resolve(repository, 'assets/source/heroine-v1/hair-long-waves-v1'),
    referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/reference-import-v1/transparent'),
    outputDirectory: resolve(repository, 'assets/staging/heroine-v1/hair-long-waves-v1', ...(group ? [group] : [])),
    configFilename: group === 'back-diagonals' ? 'back-diagonals-authoring-v1.json' : group === 'profiles' ? 'profiles-authoring-v1.json' : group === 'front-diagonals-v5' ? 'front-diagonals-authoring-v5.json' : group === 'front-diagonals' ? 'front-diagonals-authoring-v4.json' : 'authoring-v1.json',
  });
  console.log(`Prepared ${report.measurements.length} native hair layers for ${report.supportedReviewDirections.join('/')} review.`);
  console.log(`Review: assets/staging/heroine-v1/hair-long-waves-v1/${group ? `${group}/` : ''}overview.png. Authoring review only; rig/T-pose compatibility unverified.`);
} catch (error) { console.error(error); process.exitCode = 1; }
