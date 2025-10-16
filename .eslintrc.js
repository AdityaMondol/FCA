module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'prettier'
  ],
  plugins: ['node'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'brace-style': ['error', '1tbs'],
    'comma-dangle': ['error', 'never'],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'indent': ['error', 2],
    'no-trailing-spaces': 'error',
    'no-multiple-empty-lines': ['error', { max: 2 }],
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'keyword-spacing': 'error',
    'space-infix-ops': 'error',
    'node/no-unpublished-require': 'off',
    'node/no-unsupported-features/es-syntax': 'off'
  },
  overrides: [
    {
      files: ['tests/**/*.js'],
      env: {
        jest: true
      },
      rules: {
        'no-unused-vars': 'off'
      }
    }
  ]
};
