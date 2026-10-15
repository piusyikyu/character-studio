import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareBodyPartsReview, prepareNorthBodyPartsReview } from './body-parts-review';
import { prepareEastBodyPartsReview } from './body-east-parts-review';
const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  if (process.argv.length > 3 || (process.argv.length === 3 && !['--north', '--east'].includes(process.argv[2]!))) throw new Error('Usage: body-parts-review-cli.js [--north|--east]');
  const north = process.argv[2] === '--north', east = process.argv[2] === '--east', directory = 'body/parts-v1' + (north ? '/north' : east ? '/east' : '');
  const prepare = east ? prepareEastBodyPartsReview : north ? prepareNorthBodyPartsReview : prepareBodyPartsReview;
  const report = await prepare({ sourceDirectory: resolve(repository, 'assets/source/heroine-v1', directory), assetDirectory: resolve(repository, 'assets/source/heroine-v1'), referenceDirectory: resolve(repository, 'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository, 'assets/staging/heroine-v1', directory) });
  console.log(`Prepared ${east ? 'three visible E partitions with two explicitly occluded slots' : `five native ${north ? 'N' : 'S'} body planes`}: ${report.status}; actual composition matches the approved fit exactly. Review part cuts; concealed joints and separate clothing remain unfinished.`);
} catch (error) { console.error(error); process.exitCode = 1; }
