// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      // Storage access is wrapped in try/catch and failures are deliberately ignored.
      "no-empty": ["error", { allowEmptyCatch: true }],

      // Ratchet: rules the codebase does not meet yet. Each one becomes "error"
      // once the task that fixes it lands, so new violations never get in.
      "@angular-eslint/prefer-standalone": "warn", // T-3.3 standalone migration
      "@angular-eslint/prefer-inject": "warn", // T-4.1 inject() migration
      "@angular-eslint/prefer-on-push-component-change-detection": "warn", // T-4.3 signals + OnPush
      "@angular-eslint/component-selector": [
        "warn", // T-6.1 rename snack-bar selector
        { type: "element", prefix: "app", style: "kebab-case" },
      ],
      "@angular-eslint/no-empty-lifecycle-method": "warn", // T-2.1 dead code
      "@typescript-eslint/no-empty-function": "warn", // T-2.1 dead code
      "@typescript-eslint/no-explicit-any": "warn", // T-2.1 dead code
      "@typescript-eslint/no-unused-vars": "warn", // T-2.1 dead code
      "@typescript-eslint/no-inferrable-types": "warn", // T-2.1 cleanup
      "@typescript-eslint/consistent-generic-constructors": "warn", // T-2.1 cleanup
      "@typescript-eslint/consistent-type-definitions": "warn", // T-2.1 cleanup
      "preserve-caught-error": "warn", // T-1.3 home image error handling
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  }
]);
