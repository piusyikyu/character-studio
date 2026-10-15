import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareWardrobeReview } from './body-wardrobe-review';
try {
  if (process.argv.length > 2) throw new Error('Usage: body-wardrobe-review-cli.js');
  const repository = resolve(fileURLToPath(new URL('../../..',import.meta.url)));
  const report = await prepareWardrobeReview({ sourceDirectory: resolve(repository,'assets/source/heroine-v1/outfit/dress-v1'), assetDirectory: resolve(repository,'assets/source/heroine-v1'), referenceDirectory: resolve(repository,'assets/staging/heroine-v1/references/import-v1/transparent'), outputDirectory: resolve(repository,'assets/staging/heroine-v1/outfit/dress-v1') });
  console.log(`Prepared covered S wardrobe: ${report.status}; exact everyday underwear replay, fitted gown and midriff/high-slit coverage test.`);
} catch (error) { console.error(error); process.exitCode = 1; }
