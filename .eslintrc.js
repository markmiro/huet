// Consider: https://github.com/benmosher/eslint-plugin-import
// Consider: https://github.com/amilajack/eslint-plugin-compat

module.exports = {
  parser: "babel-eslint",
  parserOptions: {
    // ecmaVersion: "2018", // TODO: check that this needs to be enabled?
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["jsx-a11y", "lodash", "fp", "simple-import-sort"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:unicorn/recommended",
    "plugin:lodash/canonical",
    "problems",
    "prettier"
  ],
  rules: {
    "react/prop-types": "off",
    "react/no-typos": "on",
    "react/jsx-handler-names": "on",
    "react/jsx-no-literals": "on",
    "react/jsx-no-comment-textnodes": "on",
    "react/jsx-no-target-blank": "on",
    "lodash/prefer-lodash-method": "off",
    "lodash/import-scope": "off", // Using a plugin to do this during build
    "lodash/prefer-noop": "off",
    "lodash/prefer-lodash-chain": "off", // Chaining has better aesthetic, but bundle would be bigger?
    "no-mutating-methods": "on",
    "no-alert": "off",
    "prefer-template": "off",
    // TODO: Check these: sort-imports and import/order
    // https://github.com/lydell/eslint-plugin-simple-import-sort
    "simple-import-sort/sort": "error",

    // TODO: enable later:
    "unicorn/filename-case": "off",
    "unicorn/prefer-query-selector": "off",
    "react/no-unescaped-entities": "off",
    "react/display-name": "off",
    "jsx-a11y/label-has-for": "off",
    "jsx-a11y/no-onchange": "off"
  },
  env: {
    browser: true,
    es6: true,
    jest: true
    // node: true
  }
};

// no-use-before-define
// no-shadow
