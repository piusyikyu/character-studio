import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareWardrobeReview } from './body-wardrobe-review';
try {
  if (process.argv.length > 3 || (process.argv.length === 3 && process.argv[2] !== '--north')) throw new Error('Usage: body-wardrobe-review-cli.js [--north]');
  const suffix = process.argv[2] === '--north' ? '/north' : '';
  const repository = resolve(fileURLToPath(new URL('../../..',import.meta.url)));
  const report = await prepareWardrobeReview({ sourceDirectory: resolve(repository,'assets/source/heroine-v1/outfit/dress-v1' + suffix), assetDirectory: resolve(repository,'assets/source/heroine-v1'), referenceDirectory: resolve(repository,'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository,'assets/staging/heroine-v1/outfit/dress-v1' + suffix) });
  console.log(`Prepared covered ${report.direction} wardrobe: ${report.status}; exact everyday underwear replay, fitted gown and same-facing waist coverage test.`);
} catch (error) { console.error(error); process.exitCode = 1; }
