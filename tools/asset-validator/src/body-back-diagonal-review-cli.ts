import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareBackDiagonalBodyReview } from './body-back-diagonal-review';

try {
  const historical = process.argv.length === 3 && process.argv[2] === '--northeast-v1';
  if (process.argv.length > (historical ? 3 : 2)) throw new Error('Usage: body-back-diagonal-review-cli.js [--northeast-v1] (NE only; NW is not yet authored)');
  const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
  const report = await prepareBackDiagonalBodyReview({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1/body/back-diagonals-v1'), assetDirectory: resolve(repository, 'assets/source/heroine-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository, historical ? 'assets/staging/heroine-v1/body/back-diagonals-v1/revision-1' : 'assets/staging/heroine-v1/body/back-diagonals-v1'), configuration: historical ? 'authoring-ne-v1.json' : 'authoring-ne-v2.json' });
  console.log(`Prepared independent NE body: ${report.status}; posterior facial planes hidden. Review torso/pelvis facing, hand interiors, neck/hair depth and provisional feet.`);
} catch (error) { console.error(error); process.exitCode = 1; }
