import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareFrontDiagonalBodyReview } from './body-profile-review';
const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  if (process.argv.length > 3 || (process.argv.length === 3 && !['--v1', '--southwest', '--southwest-v1', '--southwest-v2', '--southwest-v3'].includes(process.argv[2]!))) throw new Error('Usage: body-diagonal-review-cli.js [--v1 | --southwest | --southwest-v1 | --southwest-v2 | --southwest-v3]');
  const historical = process.argv[2] === '--v1', southwest = process.argv[2]?.startsWith('--southwest'), historicalSouthwest = process.argv[2] === '--southwest-v1', historicalSouthwestV2 = process.argv[2] === '--southwest-v2', historicalSouthwestV3 = process.argv[2] === '--southwest-v3';
  const directory = 'body/front-diagonals-v1';
  const report = await prepareFrontDiagonalBodyReview({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1', directory), assetDirectory: resolve(repository, 'assets/source/heroine-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), configFile: southwest ? historicalSouthwest ? 'authoring-sw-v1.json' : historicalSouthwestV2 ? 'authoring-sw-v2.json' : historicalSouthwestV3 ? 'authoring-sw-v3.json' : 'authoring-sw-v4.json' : historical ? 'authoring.json' : 'authoring-v2.json', outputDirectory: resolve(repository, 'assets/staging/heroine-v1', directory, ...(southwest ? historicalSouthwest ? ['southwest', 'historical-v1'] : historicalSouthwestV2 ? ['southwest', 'historical-v2'] : historicalSouthwestV3 ? ['southwest', 'historical-v3'] : ['southwest'] : historical ? ['historical-v1'] : [])) });
  console.log(`Prepared independently authored ${report.supportedReviewDirections[0]} body: ${report.status}; native accepted facial/hair planes and local neck attachment. Review three-quarter T-pose anatomy, hands and heel-based feet.`);
} catch (error) { console.error(error); process.exitCode = 1; }
