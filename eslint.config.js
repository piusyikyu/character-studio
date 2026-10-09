import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { builtinModules } from 'node:module';

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', 'playwright-report/**', 'test-results/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ['packages/asset-registry/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['react', 'react/*', 'react-dom', 'react-dom/*', 'pixi.js', 'pixi.js/*', '@character-studio/renderer-*'],
          message: 'Asset registry and planning must remain independent of UI and rendering engines.',
        }],
      }],
    },
  },
  {
    files: ['packages/core/src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: Object.fromEntries(Object.keys({ ...globals.browser, ...globals.node }).map((name) => [name, 'off'])),
    },
    rules: {
      'no-restricted-imports': ['error', {
        paths: builtinModules.filter((name) => !name.startsWith('node:')),
        patterns: [{
          group: ['node:*', 'react', 'react/*', 'react-dom', 'react-dom/*', 'pixi.js', 'pixi.js/*', '@character-studio/renderer-*', '@character-studio/render-utils', '@character-studio/asset-registry', '@character-studio/character-engine'],
          message: 'Core must remain independent of UI, renderers, registry, and platform APIs.',
        }],
      }],
    },
  },
);
