module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "airbnb-base",
    "prettier",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "quotes": [
      "error",
      "double",
      { "avoidEscape": true, "allowTemplateLiterals": false }
    ]
  },
};
