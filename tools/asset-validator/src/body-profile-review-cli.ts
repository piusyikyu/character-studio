import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareProfileBodyReview } from './body-profile-review';
const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  if (process.argv.length > 3 || (process.argv.length === 3 && !['--west', '--west-v1'].includes(process.argv[2]!))) throw new Error('Usage: body-profile-review-cli.js [--west|--west-v1]');
  const west = process.argv[2] === '--west' || process.argv[2] === '--west-v1';
  const report = await prepareProfileBodyReview({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1/body/profiles-v1'), assetDirectory: resolve(repository, 'assets/source/heroine-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository, 'assets/staging/heroine-v1/body/profiles-v1' + (west ? process.argv[2] === '--west-v1' ? '/west/historical-v1' : '/west' : '')), ...(west ? { configFile: process.argv[2] === '--west-v1' ? 'authoring-w-v1.json' as const : 'authoring-w-v2.json' as const } : {}) });
  console.log(`Prepared independently authored ${west ? 'W' : 'E'} body: ${report.status}; native approved face/hair and local neck attachment. Review profile arm projection and heel-based foot posture.`);
} catch (error) { console.error(error); process.exitCode = 1; }
