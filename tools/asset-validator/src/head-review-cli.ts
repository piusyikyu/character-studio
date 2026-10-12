import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareHeadReview } from './head-review';

const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  const flag = process.argv[2];
  if (process.argv.length > 3 || (flag && !['--v1', '--v2', '--v3', '--v4', '--profiles', '--profiles-v1', '--profiles-v2', '--front-diagonals', '--front-diagonals-v1', '--front-diagonals-v2', '--front-diagonals-v3', '--back-diagonals'].includes(flag))) throw new Error('Usage: head-review-cli.js [--v1|--v2|--v3|--v4|--profiles|--profiles-v1|--profiles-v2|--front-diagonals|--front-diagonals-v1|--front-diagonals-v2|--front-diagonals-v3|--back-diagonals]');
  const version = flag === '--v1' ? 1 : flag === '--v2' ? 2 : flag === '--v3' ? 3 : flag === '--v4' ? 4 : 5;
  const diagonals = flag?.startsWith('--front-diagonals') ?? false;
  const profiles = flag?.startsWith('--profiles') ?? false;
  const backDiagonals = flag === '--back-diagonals';
  const staging = `assets/staging/heroine-v1/head-soft-oval-v1${backDiagonals ? '/back-diagonals' : diagonals ? (flag === '--front-diagonals-v1' ? '/front-diagonals/v1' : flag === '--front-diagonals-v2' ? '/front-diagonals/v2' : flag === '--front-diagonals-v3' ? '/front-diagonals/v3' : '/front-diagonals') : profiles ? (flag === '--profiles-v1' ? '/profiles/v1' : flag === '--profiles-v2' ? '/profiles/v2' : '/profiles') : version < 5 ? `/v${version}` : ''}`;
  const report = await prepareHeadReview({
    sourceDirectory: resolve(repository, 'assets/source/heroine-v1/head-soft-oval-v1'),
    hairDirectory: resolve(repository, 'assets/source/heroine-v1/hair-long-waves-v1'),
    referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/reference-import-v1/transparent'),
    outputDirectory: resolve(repository, staging),
    configSource: backDiagonals ? 'back-diagonals-authoring-v1.json' : diagonals ? (flag === '--front-diagonals-v1' ? 'front-diagonals-authoring-v1.json' : flag === '--front-diagonals-v2' ? 'front-diagonals-authoring-v2.json' : flag === '--front-diagonals-v3' ? 'front-diagonals-authoring-v3.json' : 'front-diagonals-authoring-v4.json') : profiles ? (flag === '--profiles-v1' ? 'profiles-authoring-v1.json' : flag === '--profiles-v2' ? 'profiles-authoring-v2.json' : 'profiles-authoring-v3.json') : version === 1 ? 'authoring-v1.json' : version === 2 ? 'authoring-v2.json' : version === 3 ? 'authoring-v3.json' : version === 4 ? 'authoring-v4.json' : 'authoring-v5.json',
  });
  console.log(`Prepared ${report.measurements.length} native anatomy layers for ${report.supportedReviewDirections.join('/')} review.`);
  console.log(`Review: ${staging}/overview.png. ${backDiagonals ? 'Independent NE/NW posterior anatomy; eyes and frontal fringe hidden.' : diagonals ? 'SE/SW anatomy and local hairstyle fit candidate.' : profiles ? `E/W anatomy and hair fit revision ${flag === '--profiles-v1' ? 1 : flag === '--profiles-v2' ? 2 : 3}.` : `Revision ${version} fit candidate.`} Anatomy/body/T-pose compatibility needs human review.`);
} catch (error) { console.error(error); process.exitCode = 1; }
