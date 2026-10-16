import { fileURLToPath } from 'node:url';
import { auditWardrobeFoundation } from './wardrobe-foundation-audit';
try {
  if (process.argv.length !== 2) throw new Error('Usage: wardrobe-foundation-audit-cli.js');
  const report = await auditWardrobeFoundation(fileURLToPath(new URL('../../../',import.meta.url)));
  console.log(JSON.stringify(report,null,2));
  if (!report.completeSurfaceAvailable) process.exitCode = 1;
} catch (error) { console.error(error); process.exitCode = 1; }
