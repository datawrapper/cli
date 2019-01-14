module.exports = {
    name: 'Code linting',
    config: {
        parser: 'babel-eslint',
        extends: ['standard'],
        rules: {
            indent: ['error', 4],
            semi: ['error', 'always']
        }
    },
    packages: [
        'eslint',
        'eslint-config-standard',
        'eslint-plugin-import',
        'eslint-plugin-node',
        'eslint-plugin-promise',
        'eslint-plugin-standard',
        'babel-eslint'
    ],
    packageJson: {
        scripts: {
            lint: 'eslint src'
        }
    }
};
