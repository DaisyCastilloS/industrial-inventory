module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'revert',
        'ci',
        'build',
        'security',
        'audit'
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'auth',
        'users',
        'products',
        'categories',
        'locations',
        'suppliers',
        'movements',
        'audit',
        'validation',
        'security',
        'api',
        'database',
        'infrastructure',
        'domain',
        'application'
      ]
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72]
  }
}; 