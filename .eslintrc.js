module.exports = {
  extends: [
    'airbnb-typescript/base',
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
  ],
  env: {
    node: true,
    browser: true,
    jest: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    'jest',
  ],
  rules: {
    'linebreak-style': 0,
    'no-console': 0,
    // "import/extensions": [ "error", "ignorePackages", { js: "never", jsx: "never", ts: "never", tsx: "never" } ]
    // "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx", ".tsx"] }]
  }
}