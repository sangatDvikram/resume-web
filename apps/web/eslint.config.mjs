import { defineConfig, globalIgnores } from "eslint/config";
import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const eslintConfig = defineConfig([
  // TypeScript parser for all files
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
  },

  // Next.js core-web-vitals rules
  {
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs["recommended"].rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  // TypeScript recommended rules
  ...tsPlugin.configs["flat/recommended"],

  // No explicit `any`
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },

  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
