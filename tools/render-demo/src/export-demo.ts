import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { chromium } from '@playwright/test';
import type { Browser } from '@playwright/test';

type DemoWindow = Window & { renderDemo?: { readonly ready: boolean; exports(): Promise<readonly { name: string; bytes: Uint8Array }[]> } };

const url = 'http://127.0.0.1:5174/render-demo.html';
const server = spawn('pnpm', ['--filter', '@character-studio/app', 'dev', '--port', '5174', '--strictPort'], { detached: true, stdio: 'pipe' });
let logs = '';
server.stdout?.on('data', (chunk) => { logs = (logs + String(chunk)).slice(-4000); });
server.stderr?.on('data', (chunk) => { logs = (logs + String(chunk)).slice(-4000); });
let browser: Browser | undefined;
try {
  browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
  const deadline = Date.now() + 30_000;
  while (true) {
    try { if ((await fetch(url)).ok) break; } catch { /* Wait for the local server. */ }
    if (server.exitCode !== null || Date.now() > deadline) throw new Error(`Demo server did not start.\n${logs}`);
    await new Promise((done) => setTimeout(done, 100));
  }
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForFunction(() => (window as DemoWindow).renderDemo?.ready, undefined, { timeout: 60_000 });
  const exports = await page.evaluate(async () => (await (window as DemoWindow).renderDemo!.exports()).map((file) => ({ name: file.name, bytes: Array.from(file.bytes) })));
  for (const file of exports) {
    const path = resolve('artifacts/render-demo', file.name);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, new Uint8Array(file.bytes));
  }
  await page.screenshot({ path: 'artifacts/render-demo/demo.png', fullPage: true });
  console.log(`Exported ${exports.length} labelled PNGs to artifacts/render-demo (eight detailed, eight pixel, one sheet).`);
} finally {
  await browser?.close();
  if (server.pid) process.kill(-server.pid, 'SIGTERM');
}
