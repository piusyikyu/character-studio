import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/placeholders.ts', 'src/generate-assets.ts', 'src/export-demo.ts'],
  format: ['esm'], dts: true, clean: true,
  // Workspace development exports point to TS source. Bundle them into the
  // portable Node CLI instead of asking Node to resolve extensionless TS imports.
  noExternal: [/^@character-studio\//, /^zod(?:\/|$)/, 'fast-png', 'pako', 'iobuffer'],
});
