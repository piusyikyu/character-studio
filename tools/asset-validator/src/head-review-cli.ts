import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareHeadReview } from './head-review';

const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  const flag = process.argv[2];
  if (process.argv.length > 3 || (flag && !['--v1', '--v2', '--v3', '--v4'].includes(flag))) throw new Error('Usage: head-review-cli.js [--v1|--v2|--v3|--v4]');
  const version = flag === '--v1' ? 1 : flag === '--v2' ? 2 : flag === '--v3' ? 3 : flag === '--v4' ? 4 : 5;
  const staging = `assets/staging/heroine-v1/head-soft-oval-v1${version < 5 ? `/v${version}` : ''}`;
  const report = await prepareHeadReview({
    sourceDirectory: resolve(repository, 'assets/source/heroine-v1/head-soft-oval-v1'),
    hairDirectory: resolve(repository, 'assets/source/heroine-v1/hair-long-waves-v1'),
    referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/reference-import-v1/transparent'),
    outputDirectory: resolve(repository, staging),
    configSource: version === 1 ? 'authoring-v1.json' : version === 2 ? 'authoring-v2.json' : version === 3 ? 'authoring-v3.json' : version === 4 ? 'authoring-v4.json' : 'authoring-v5.json',
  });
  console.log(`Prepared ${report.measurements.length} native anatomy layers for S/N review.`);
  console.log(`Review: ${staging}/overview.png. Revision ${version} fit candidate. Anatomy/body/T-pose compatibility needs human review.`);
} catch (error) { console.error(error); process.exitCode = 1; }
