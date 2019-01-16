module.exports = {
    name: 'Code linting',
    config: {
        parser: 'babel-eslint',
        extends: ['standard'],
        rules: {
            indent: ['error', 4],
            semi: ['error', 'always'],
            camelcase: ['warn', { ignoreDestructuring: true }],
            'no-console': ['error', { allow: ['warn', 'error'] }]
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
