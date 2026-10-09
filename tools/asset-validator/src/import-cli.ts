import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { importReferencePack } from './reference-import';

const repository = resolve(fileURLToPath(new URL('../../..', import.meta.url)));
try {
  const metadata = await importReferencePack({
    sourceDirectory: resolve(repository, 'assets/references/heroine-v1/detailed'),
    settingsPath: resolve(repository, 'assets/references/heroine-v1/import-v1.json'),
    outputDirectory: resolve(repository, 'assets/staging/heroine-v1/reference-import-v1'),
  });
  console.log(`Validated ${metadata.frames.length} native references; originals preserved. Staging: assets/staging/heroine-v1/reference-import-v1`);
  console.log(`Baseline spread: ${metadata.baselineAudit.range} px. Human review required; no assets published.`);
} catch (error) { console.error(error); process.exitCode = 1; }
