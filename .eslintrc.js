module.exports = {
  extends: ['@nutol/eslint-config/eslintrc.js', 'plugin:prettier/recommended'],
  plugins: ['import', 'simple-import-sort', 'prettier'],
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
        '@typescript-eslint/naming-convention': 'off',
      },
    },
    {
      files: ['./clients/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            checksVoidReturn: false,
          },
        ],
      },
    },
    {
      files: ['**/__tests__/**/*.ts'],
      rules: {
        '@typescript-eslint/no-shadow': 'off',
      },
    },
  ],
};
