module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'airbnb-typescript/base',
  ],
  rules: {
    "max-len": ["warn", 180],
    "no-console": "off",
    "@typescript-eslint/lines-between-class-members": "off",
    "class-methods-use-this": "off",
    "prefer-destructuring": "off",
    "no-param-reassign": ["error", { props: false }],
    "@typescript-eslint/no-empty-function": ['error', {
      allow: [
        'arrowFunctions',
        'functions',
        'methods',
        'private-constructors',
        'protected-constructors',
      ]
    }]
  },
};