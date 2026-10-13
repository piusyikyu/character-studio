import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareProfileFaceReview } from './face-profile-review';
const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  if (process.argv.length > 2) throw new Error('Usage: face-profile-review-cli.js');
  await prepareProfileFaceReview({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1/face/reference-v1/profiles-v1'), headDirectory: resolve(repository, 'assets/source/heroine-v1/head/soft-oval-v1'), hairDirectory: resolve(repository, 'assets/source/heroine-v1/hair/long-waves-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository, 'assets/staging/heroine-v1/face/reference-v1/profiles') });
  console.log('Prepared independent native E/W facial layers. Review face/reference-v1/profiles/overview.png; visual approval is pending.');
} catch (error) { console.error(error); process.exitCode = 1; }
