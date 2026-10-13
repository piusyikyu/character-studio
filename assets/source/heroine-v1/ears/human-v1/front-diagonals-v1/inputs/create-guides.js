// Replay only in scratch; guides retain complete accepted native head framing.
import { readFile, writeFile } from 'node:fs/promises'; import { createRequire } from 'node:module'; import { createHash } from 'node:crypto';
const { decode, encode } = createRequire(process.cwd() + '/tools/asset-validator/package.json')('fast-png'), root = 'assets/source/heroine-v1/ears/human-v1/front-diagonals-v1/inputs/', headRoot = 'assets/source/heroine-v1/head/soft-oval-v1/';
const head = JSON.parse(await readFile(headRoot + 'front-diagonals-authoring-v4.json'));
for (const direction of ['SE', 'SW']) { const pin = head.frames[direction].head, bytes = await readFile(headRoot + pin.source); if (createHash('sha256').update(bytes).digest('hex') !== pin.sourceSha256) throw Error('Approved head changed'); await writeFile(root + direction + '-earless-guide.png', encode(decode(bytes)), { flag: 'wx' }); }
