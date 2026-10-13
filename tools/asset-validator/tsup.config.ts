import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/import-cli.ts', 'src/hair-review-cli.ts', 'src/head-review-cli.ts', 'src/ear-review-cli.ts', 'src/face-review-cli.ts', 'src/face-diagonal-review-cli.ts', 'src/face-profile-review-cli.ts', 'src/workspace-cleanup-cli.ts'], format: ['esm'], dts: true, clean: true,
  noExternal: [/^@character-studio\//, /^zod(?:\/|$)/, 'fast-png', 'pako', 'iobuffer'],
});
