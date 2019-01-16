module.exports = {
    name: 'Git Hooks',
    packages: ['husky', 'lint-staged'],
    packageJson: list => {
        const hookScripts = [];

        if (list.includes('format')) {
            hookScripts.push('prettier --write');
        }

        if (list.includes('lint')) {
            hookScripts.push('eslint --fix');
        }

        hookScripts.push('git add');

        return {
            husky: {
                hooks: {
                    'pre-commit': 'lint-staged'
                }
            },
            'lint-staged': {
                '*.js': hookScripts
            }
        };
    }
};
