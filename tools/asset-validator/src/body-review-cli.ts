import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareBodyReview } from './body-review';
const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  const version = process.argv[2];
  if (process.argv.length > 3 || (version !== undefined && !['--v1', '--v2', '--v3', '--v4', '--v5'].includes(version))) throw new Error('Usage: body-review-cli.js [--v1|--v2|--v3|--v4|--v5]');
  const configFile = version === '--v1' ? 'authoring.json' : version === '--v2' ? 'authoring-v2.json' : version === '--v3' ? 'authoring-v3.json' : version === '--v4' ? 'authoring-v4.json' : version === '--v5' ? 'authoring-v5.json' : 'authoring-v6.json';
  const report = await prepareBodyReview({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1/body/reference-v1'), assetDirectory: resolve(repository, 'assets/source/heroine-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), configFile, outputDirectory: resolve(repository, 'assets/staging/heroine-v1/body/reference-v1', version ? `historical-v${version.slice(-1)}` : '.') });
  console.log(`Prepared native S body/head/hair study: ${report.status}. Review body proportions and the neck/shoulder join before expanding anatomy.`);
} catch (error) { console.error(error); process.exitCode = 1; }
