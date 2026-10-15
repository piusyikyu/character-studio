import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareAttachmentReview } from './body-attachment-review';
try {
  if (process.argv.length > 3 || (process.argv.length === 3 && process.argv[2] !== '--north')) throw new Error('Usage: body-attachment-review-cli.js [--north]');
  const suffix = process.argv[2] === '--north' ? '/north' : '';
  const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
  const report = await prepareAttachmentReview({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1/body/attachments-v1' + suffix), assetDirectory: resolve(repository, 'assets/source/heroine-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), reviewDirectory: resolve(repository, 'assets/staging/heroine-v1/body'), outputDirectory: resolve(repository, 'assets/staging/heroine-v1/body/attachments-v1' + suffix) });
  console.log(`Prepared ${report.availableCandidates} ${report.direction} attachment candidates; unavailable: ${report.unavailableAnchors.join(', ')}. No production rig produced.`);
} catch (error) { console.error(error); process.exitCode = 1; }
