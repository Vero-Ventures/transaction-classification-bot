import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";


export default [
    { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
    {
        languageOptions: {
            globals: {
                console: 'readonly',  // Fixes 'console is not defined'
                React: 'writable',  // Define React as writable
                window: 'readonly',  // Browser global
                document: 'readonly',  // Browser global
                module: 'writable',  // Node.js global
                process: 'writable',  // Node.js global
            },
        },
        ignores: ['*.py', 'node_modules/'],  // Ignore Python files

        rules: {
            'semi': ['error', 'always'],  // Require semicolons
            'quotes': ['error', 'double'],  // Enforce double quotes
            'indent': ['error', 2],  // Enforce 2-space indentation
        },
    }, pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReactConfig,
];