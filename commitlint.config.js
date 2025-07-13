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
        // DOMAIN LAYER
        'entity',
        'repository',
        'domain',
        
        // APPLICATION LAYER
        'usecase',
        'dto',
        'application',
        
        // INFRASTRUCTURE LAYER
        'service',
        'database',
        'infrastructure',
        
        // PRESENTATION LAYER
        'controller',
        'middleware',
        'presentation',
        
        // CROSS-CUTTING
        'auth',
        'user',
        'security',
        'audit',
        'validation',
        
        // TOOLS & CONFIG
        'docs',
        'ci',
        'test',
        'lint',
        'format',
        'deps',
        'typescript',
        'docker'
      ]
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
    'footer-max-line-length': [2, 'always', 100]
  }
}; 