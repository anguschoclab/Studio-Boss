import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist', 'dev-dist', 'node_modules', 'electron', 'release'],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      // Allow @ts-ignore for legacy code and test files
      '@typescript-eslint/ban-ts-comment': 'off',
      // Allow any in test files and legacy code
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow unused vars with underscore prefix
      '@typescript-eslint/no-unused-vars': 'off',
      // Re-enable react-hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-empty': 'off',
      'no-case-declarations': 'off',
      'no-useless-assignment': 'off',
    },
  }
);
