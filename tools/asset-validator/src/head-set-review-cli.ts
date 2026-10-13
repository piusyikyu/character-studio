import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareHeadSetReview } from './head-set-review';
const repository=resolve(fileURLToPath(new URL('../../..',import.meta.url)));
try{
  if(process.argv.length>2)throw new Error('Usage: head-set-review-cli.js');
  const report=await prepareHeadSetReview({selectionDirectory:resolve(repository,'assets/source/heroine-v1/head/assembly-v1'),assetDirectory:resolve(repository,'assets/source/heroine-v1'),referenceDirectory:resolve(repository,'assets/staging/heroine-v1/references/import-v1/transparent'),outputDirectory:resolve(repository,'assets/staging/heroine-v1/head/assembly-v1')});
  console.log(`Prepared all eight selected native head fits: ${report.status}. Production anatomy and body/clothing occlusion remain unapproved.`);
}catch(error){console.error(error);process.exitCode=1;}
