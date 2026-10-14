import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareFrontDiagonalBodyReview } from './body-profile-review';
const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  if (process.argv.length > 3 || (process.argv.length === 3 && process.argv[2] !== '--v1')) throw new Error('Usage: body-diagonal-review-cli.js [--v1]');
  const historical = process.argv[2] === '--v1';
  const directory = 'body/front-diagonals-v1';
  const report = await prepareFrontDiagonalBodyReview({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1', directory), assetDirectory: resolve(repository, 'assets/source/heroine-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), configFile: historical ? 'authoring.json' : 'authoring-v2.json', outputDirectory: resolve(repository, 'assets/staging/heroine-v1', directory, ...(historical ? ['historical-v1'] : [])) });
  console.log(`Prepared independently authored SE body: ${report.status}; native accepted facial/hair planes and local neck attachment. Review three-quarter T-pose anatomy, hands and heel-based feet.`);
} catch (error) { console.error(error); process.exitCode = 1; }
