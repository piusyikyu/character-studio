import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareBrowReview} from './brow-review';
const repository=resolve(fileURLToPath(new URL('../../..',import.meta.url)));
try{
  if(process.argv.length>2)throw new Error('Usage: brow-review-cli.js');
  const report=await prepareBrowReview({sourceDirectory:resolve(repository,'assets/source/heroine-v1/face/reference-v1/brows-v1'),assetDirectory:resolve(repository,'assets/source/heroine-v1'),referenceDirectory:resolve(repository,'assets/staging/heroine-v1/references/import-v1/transparent'),outputDirectory:resolve(repository,'assets/staging/heroine-v1/face/reference-v1/brows')});
  console.log(`Prepared complete E/SE/SW/W brows with native foreground depth: ${report.status}.`);
}catch(error){console.error(error);process.exitCode=1;}
