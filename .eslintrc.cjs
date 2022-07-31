module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  plugins: ["prettier"],
  rules: {
    "no-var": "error",
    eqeqeq: "error",
    "prettier/prettier": [
      "error",
      {
        bracketSpacing: true,
        printWidth: 80,
        semi: true,
        tabWidth: 2,
        trailingComma: "es5",
        quotes: [
          "error",
          "double",
          { avoidEscape: true, allowTemplateLiterals: false },
        ],
      },
    ],
  },
};
