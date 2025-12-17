import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
});

export default [
	...compat.config({
		plugins: ["import", "@typescript-eslint", "prettier"],

		env: {
			node: true,
		},

		parser: "@typescript-eslint/parser",

		parserOptions: {
			project: "./tsconfig.json",
			tsconfigRootDir: __dirname,
			sourceType: "module",
		},

		ignorePatterns: ["node_modules/", ".idea/", "*.config.mjs"],

		extends: [
			"eslint:recommended",
			"plugin:@typescript-eslint/recommended",
			"plugin:import/recommended",
			"plugin:import/typescript",
			"plugin:prettier/recommended",
		],

		rules: {
			"@typescript-eslint/no-extra-semi": "off",
			"@typescript-eslint/no-unused-vars": "error",
			"@typescript-eslint/prefer-for-of": "error",
			"@typescript-eslint/unified-signatures": "error",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-empty-object-type": "warn",
			"no-undef": "off",

			"import/no-deprecated": "warn",
			"import/no-extraneous-dependencies": "error",
			"import/no-unassigned-import": "error",
			"import/no-unresolved": "off",
			"import/order": ["error", { "newlines-between": "always-and-inside-groups" }],

			"arrow-body-style": "off",
			"prefer-arrow-callback": "error",
			"no-duplicate-imports": "error",
			"no-empty-function": "error",
			"no-empty": ["error", { allowEmptyCatch: true }],
			"no-new-wrappers": "error",
			"no-param-reassign": "error",
			"no-return-await": "error",
			"no-sequences": "error",
			"no-throw-literal": "error",
			"no-void": "error",
			"no-async-promise-executor": "off",

			"@typescript-eslint/no-unused-expressions": [
				"error",
				{
					allowTaggedTemplates: true,
					allowShortCircuit: true,
				},
			],
		},

		settings: {
			"import/resolver": {
				node: {
					paths: ["."],
				},
			},
		},
	}),
];
