module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:svelte/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    extraFileExtensions: ['.svelte']
  },
  env: {
    browser: true,
    es2017: true,
    node: true
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    },
    {
      files: ['*.test.js', '*.test.ts', '*.spec.js', '*.spec.ts'],
      env: {
        jest: true
      }
    }
  ],
  rules: {
    // Enhanced rules for better code quality
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'svelte/no-at-html-tags': 'error',
    'svelte/no-target-blank': 'error',
    'svelte/no-reactive-functions': 'error',
    'svelte/no-reactive-literals': 'error'
  },
  ignorePatterns: [
    '*.cjs',
    '.svelte-kit/**',
    'build/**',
    'dist/**'
  ]
};