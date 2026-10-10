import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
const require = createRequire(`${process.cwd()}/tools/asset-validator/package.json`);
const { encode } = require('fast-png');
// Synthetic native placement guides only, never authored/approved anatomy.
for (const direction of ['S', 'N']) {
  const data = new Uint8Array(1024 * 1536 * 4);
  const cx = direction === 'S' ? 511 : 510;
  for (let y = 75; y <= 315; y++) for (let x = 425; x <= 605; x++) {
    const scalp = ((x - cx) / 73) ** 2 + ((y - 175) / 90) ** 2 <= 1;
    const neck = y >= 252 && y <= 314 && Math.abs(x - cx) <= 28;
    const ears = ((x - (cx - 76)) / 10) ** 2 + ((y - 207) / 20) ** 2 <= 1 || ((x - (cx + 76)) / 10) ** 2 + ((y - 207) / 20) ** 2 <= 1;
    if (scalp || neck || ears) data.set([245, 211, 186, 255], (y * 1024 + x) * 4);
  }
  await writeFile(`assets/source/heroine-v1/head-soft-oval-v1/inputs/${direction}-placement-guide.png`, encode({ width: 1024, height: 1536, channels: 4, depth: 8, data }), { flag: 'wx' });
}
