import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
    {
        // Common folders to exclude from linting
        ignores: ['dist', 'dev-dist', 'node_modules', 'electron', 'release'],
    },
    {
        // Extending the strictest possible standards
        extends: [
            js.configs.recommended,
            ...tseslint.configs.strict,
            prettier
        ],
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
            // Standard React Hooks enforcement
            ...reactHooks.configs.recommended.rules,

            // Mandatory React Refresh rule (standard for Vite/React setups)
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],

            /**
             * Note: Rule silencing has been removed. 
             * The following are now ENFORCED by the 'strict' preset:
             * - @typescript-eslint/no-explicit-any (Error)
             * - @typescript-eslint/ban-ts-comment (Error)
             * - @typescript-eslint/no-unused-vars (Error)
             * - no-empty (Error)
             * - no-case-declarations (Error)
             */
        },
    }
);