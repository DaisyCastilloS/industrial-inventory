module.exports = {
  '*.{ts,js}': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.{json,md,yml,yaml}': [
    'prettier --write'
  ]
}; 