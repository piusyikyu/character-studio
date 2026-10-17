import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/import-cli.ts', 'src/wardrobe-compatibility.ts', 'src/wardrobe-surface-fit.ts', 'src/workspace-cleanup-cli.ts'], format: ['esm'], dts: true, clean: true,
  noExternal: [/^@character-studio\//, /^zod(?:\/|$)/, 'fast-png', 'pako', 'iobuffer'],
});
