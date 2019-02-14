module.exports = {
    name: 'Code linting',
    packages: ['healthier', 'babel-eslint'],
    packageJson: list => {
        let lintScript = "healthier 'src/**/*.{js,html}'";

        if (list.includes('lint')) {
            lintScript = `prettier --check 'src/**/*.{js,html}' && ${lintScript}`;
        }
        return {
            eslintConfig: {
                parser: 'babel-eslint',
                rules: {
                    'no-console': [
                        'error',
                        {
                            allow: ['warn', 'error']
                        }
                    ],
                    camelcase: [
                        'warn',
                        {
                            ignoreDestructuring: true,
                            properties: 'never'
                        }
                    ]
                }
            },
            scripts: {
                lint: lintScript
            }
        };
    }
};
