import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
    {
        // Common folders to exclude from linting
        ignores: [
            'dist',
            'dev-dist',
            'node_modules',
            'node_modules_old',
            'node_modules_old_v2',
            'electron',
            'release',
            '.bun_cache'
        ],
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
    },
    {
        /* ARCHITECTURAL BOUNDARY: ENGINE */
        files: ["src/engine/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-properties": [
                "error",
                {
                    "object": "Math",
                    "property": "random",
                    "message": "Do not use Math.random() in engine code. Use rngFromSeed/rngForWorld (src/engine/rng.ts)."
                }
            ],
            "no-restricted-imports": [
                "error",
                {
                    "patterns": [
                        {
                            "group": [
                                "../components/*", "../pages/*", "../hooks/*",
                                "../contexts/*", "../presenters/*", "@/components/*",
                                "@/pages/*", "@/hooks/*", "@/contexts/*", "@/presenters/*"
                            ],
                            "message": "Engine code must not import from UI or React layers to maintain architectural boundaries."
                        }
                    ]
                }
            ]
        }
    },
    {
        /* ARCHITECTURAL BOUNDARY: UI/PAGES */
        files: ["src/components/**/*.{ts,tsx}", "src/pages/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    "patterns": [
                        {
                            "group": ["**/engine/types/world", "**/engine/tick/*", "**/engine/storage/*"],
                            "message": "UI components should only consume processed UIDigest. Direct access to raw engine state or systems is forbidden."
                        },
                        {
                            "group": ["**/engine/!(types/common|worker/*)"],
                            "message": "Importing logic from src/engine/ is forbidden. Use src/presenters/ or src/engine/types/common."
                        }
                    ]
                }
            ]
        }
    }
);