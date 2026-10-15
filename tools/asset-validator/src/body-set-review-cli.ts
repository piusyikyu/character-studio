import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareBodySetReview } from './body-set-review';

try {
  if (process.argv.length > 2) throw new Error('Usage: body-set-review-cli.js');
  const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
  const report = await prepareBodySetReview({ selectionDirectory: resolve(repository, 'assets/source/heroine-v1/body/assembly-v1'), assetDirectory: resolve(repository, 'assets/source/heroine-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository, 'assets/staging/heroine-v1/body/assembly-v1') });
  console.log(`Prepared all eight native body fits: ${report.status}. ${report.pendingCandidateDirections.length ? 'SW clothing colour awaits approval; seven other fits remain approved.' : 'All individual fits match approval.'} Review proportions, joints, hands and feet together.`);
} catch (error) { console.error(error); process.exitCode = 1; }
