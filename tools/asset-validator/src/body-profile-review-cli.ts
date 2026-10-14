import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareProfileBodyReview } from './body-profile-review';
const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  if (process.argv.length !== 2) throw new Error('Usage: body-profile-review-cli.js');
  const report = await prepareProfileBodyReview({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1/body/profiles-v1'), assetDirectory: resolve(repository, 'assets/source/heroine-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository, 'assets/staging/heroine-v1/body/profiles-v1') });
  console.log(`Prepared independently authored E body: ${report.status}; native approved face/hair and local neck attachment. Review profile arm projection and heel-based foot posture.`);
} catch (error) { console.error(error); process.exitCode = 1; }
