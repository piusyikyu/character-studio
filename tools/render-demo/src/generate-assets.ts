import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createPlaceholderBundle } from './placeholders';
import { encodePng } from '@character-studio/render-utils';

const bundle = createPlaceholderBundle();
// Only generated placeholder-v1 directories are written, never approved artwork.
for (const [source, image] of bundle.images) {
  const path = resolve('assets', source);
  await mkdir(dirname(path), { recursive: true });
  const bytes = encodePng(image);
  await writeFile(path, bytes);
  const publicPath = resolve('apps/studio/public/placeholder-assets', source);
  await mkdir(dirname(publicPath), { recursive: true });
  await writeFile(publicPath, bytes);
}
const catalog = JSON.stringify(bundle.catalog, null, 2) + '\n';
await mkdir('assets/placeholder-v1', { recursive: true });
await writeFile('assets/placeholder-v1/catalog.json', catalog);
await writeFile('apps/studio/public/placeholder-assets/catalog.json', catalog);
console.log(`Generated ${bundle.images.size} independent native PNG layers/maps and placeholder.v1 catalog.`);
