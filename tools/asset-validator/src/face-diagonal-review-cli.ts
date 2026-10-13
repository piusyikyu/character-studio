import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareDiagonalFaceReview } from './face-diagonal-review';
const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  const historical = process.argv[2];
  if (process.argv.length > 3 || (historical && !['--v1','--v2','--v3','--v4','--v5'].includes(historical))) throw new Error('Usage: face-diagonal-review-cli.js [--v1|--v2|--v3|--v4|--v5]');
  await prepareDiagonalFaceReview({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1/face/reference-v1/front-diagonals-v1'), headDirectory: resolve(repository, 'assets/source/heroine-v1/head/soft-oval-v1'), hairDirectory: resolve(repository, 'assets/source/heroine-v1/hair/long-waves-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository, 'assets/staging/heroine-v1/face/reference-v1/front-diagonals', historical ? `historical-${historical.slice(2)}` : ''), configFile: historical === '--v1' ? 'authoring.json' : historical === '--v2' ? 'authoring-v2.json' : historical === '--v3' ? 'authoring-v3.json' : historical === '--v4' ? 'authoring-v4.json' : historical === '--v5' ? 'authoring-v5.json' : 'authoring-v6.json' });
  console.log('Prepared independent native SE/SW facial layers. Review face/reference-v1/front-diagonals/overview.png; visual approval is pending.');
} catch (error) { console.error(error); process.exitCode = 1; }
