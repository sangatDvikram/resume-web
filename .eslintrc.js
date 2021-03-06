module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["react", "@typescript-eslint", "prettier"],
  extends: [
    "airbnb-typescript",
    "airbnb/hooks",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "prettier/react",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
    "next/core-web-vitals",
  ],
  env: {
    browser: true,
    jasmine: true,
    jest: true,
    node: true,
  },
  // Airbnb's ESLint config requires this
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    // Include .prettierrc.js rules
    "prettier/prettier": [
      "error",
      {},
      { usePrettierrc: true, endOfLine: "auto" },
    ],
    // We will use TypeScript's types for component props instead
    "react/prop-types": "off",
    // We don't want unused vars
    "@typescript-eslint/no-unused-vars": ["warn"],
    "react/jsx-props-no-spreading": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
};
