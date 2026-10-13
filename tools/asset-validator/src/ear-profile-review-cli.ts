import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareProfileEarReview } from './ear-profile-review';
const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  if (process.argv.length > 2) throw new Error('Usage: ear-profile-review-cli.js');
  await prepareProfileEarReview({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1/ears/human-v1/profiles-v1'), headDirectory: resolve(repository, 'assets/source/heroine-v1/head/soft-oval-v1'), faceDirectory: resolve(repository, 'assets/source/heroine-v1/face/reference-v1/profiles-v1'), hairDirectory: resolve(repository, 'assets/source/heroine-v1/hair/long-waves-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository, 'assets/staging/heroine-v1/ears/human-v1/profiles') });
  console.log('Prepared independent E/W ears. Review ears/human-v1/profiles/anatomy-overview.png for ear-free roots; human fit remains exact. Visual approval is pending.');
} catch (error) { console.error(error); process.exitCode = 1; }
