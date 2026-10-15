import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareBackDiagonalBodyReview } from './body-back-diagonal-review';

try {
  const historical = process.argv.length === 3 && process.argv[2] === '--northeast-v1';
  const northwest = process.argv.length === 3 && process.argv[2] === '--northwest';
  if (process.argv.length > (historical || northwest ? 3 : 2)) throw new Error('Usage: body-back-diagonal-review-cli.js [--northeast-v1|--northwest]');
  const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
  const stage = 'assets/staging/heroine-v1/body/back-diagonals-v1';
  const report = await prepareBackDiagonalBodyReview({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1/body/back-diagonals-v1'), assetDirectory: resolve(repository, 'assets/source/heroine-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository, northwest ? `${stage}/northwest` : historical ? `${stage}/revision-1` : stage), configuration: northwest ? 'authoring-nw-v1.json' : historical ? 'authoring-ne-v1.json' : 'authoring-ne-v2.json' });
  console.log(`Prepared independent ${northwest ? 'NW' : 'NE'} body: ${report.status}; posterior facial planes hidden. Review torso/pelvis facing, hand interiors, neck/hair depth and provisional feet.`);
} catch (error) { console.error(error); process.exitCode = 1; }
