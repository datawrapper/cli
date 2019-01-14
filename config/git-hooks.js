module.exports = {
    name: 'Git Hooks',
    packages: ['husky', 'lint-staged'],
    packageJson: {
        husky: {
            hooks: {
                'pre-commit': 'lint-staged'
            }
        },
        'lint-staged': {
            '*.js': ['prettier --write', 'eslint --fix', 'git add']
        }
    }
};
