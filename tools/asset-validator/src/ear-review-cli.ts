import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareEarReview } from './ear-review';

const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== '--v1')) throw new Error('Usage: ear-review-cli.js [--v1]');
  const historical = args[0] === '--v1';
  await prepareEarReview({
    sourceDirectory: resolve(repository, 'assets/source/heroine-v1/ears-human-v1'),
    headDirectory: resolve(repository, 'assets/source/heroine-v1/head-soft-oval-v1'),
    referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/reference-import-v1/transparent'),
    outputDirectory: resolve(repository, `assets/staging/heroine-v1/ears-human-v1${historical ? '/historical-v1' : ''}`),
    configFile: historical ? 'authoring-v1.json' : 'authoring-v2.json',
  });
  console.log(`Prepared S human-ear revision ${historical ? 1 : 2}. Review anatomy-overview.png and overview.png in the selected staging directory. New anatomy requires human approval.`);
} catch (error) { console.error(error); process.exitCode = 1; }
