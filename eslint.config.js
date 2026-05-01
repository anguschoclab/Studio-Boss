import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "error",
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
    },
    {
        /* RELAXED STANDARDS FOR TESTS */
        files: ["src/test/**/*.{ts,tsx}"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "warn"
        }
    }
);
