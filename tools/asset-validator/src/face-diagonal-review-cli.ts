import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareDiagonalFaceReview } from './face-diagonal-review';
const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  const historical = process.argv[2] === '--v1';
  if (process.argv.length > (historical ? 3 : 2)) throw new Error('Usage: face-diagonal-review-cli.js [--v1]');
  await prepareDiagonalFaceReview({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1/face/reference-v1/front-diagonals-v1'), headDirectory: resolve(repository, 'assets/source/heroine-v1/head/soft-oval-v1'), hairDirectory: resolve(repository, 'assets/source/heroine-v1/hair/long-waves-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository, 'assets/staging/heroine-v1/face/reference-v1/front-diagonals', historical ? 'historical-v1' : ''), configFile: historical ? 'authoring.json' : 'authoring-v2.json' });
  console.log('Prepared independent native SE/SW facial layers. Review face/reference-v1/front-diagonals/overview.png; visual approval is pending.');
} catch (error) { console.error(error); process.exitCode = 1; }
