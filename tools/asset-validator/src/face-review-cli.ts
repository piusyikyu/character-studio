import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareFaceReview } from './face-review';
const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && !['--v1', '--v2', '--v3', '--v4', '--v5', '--v6', '--v7', '--v8', '--v9', '--v10'].includes(args[0]!))) throw new Error('Usage: face-review-cli.js [--v1|--v2|--v3|--v4|--v5|--v6|--v7|--v8|--v9|--v10]');
  const revision = args[0] === '--v1' ? 1 : args[0] === '--v2' ? 2 : args[0] === '--v3' ? 3 : args[0] === '--v4' ? 4 : args[0] === '--v5' ? 5 : args[0] === '--v6' ? 6 : args[0] === '--v7' ? 7 : args[0] === '--v8' ? 8 : args[0] === '--v9' ? 9 : args[0] === '--v10' ? 10 : 11;
  await prepareFaceReview({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1/face/reference-v1'), earDirectory: resolve(repository, 'assets/source/heroine-v1/ears/human-v1'), headDirectory: resolve(repository, 'assets/source/heroine-v1/head/soft-oval-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository, `assets/staging/heroine-v1/face/reference-v1${revision < 11 ? `/historical-v${revision}` : ''}`), configFile: `authoring-v${revision}.json` });
  console.log(`Prepared native S head/ear/feature fit revision ${revision}. Review assets/staging/heroine-v1/face/reference-v1${revision < 11 ? `/historical-v${revision}` : ''}/overview.png; anatomy needs human approval.`);
} catch (error) { console.error(error); process.exitCode = 1; }
