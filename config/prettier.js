module.exports = {
    name: 'Code formatting',
    packages: ['prettier'],
    packageJson: list => {
        let formatScript = 'prettier src/**/*.js --write';

        if (list.includes('lint')) {
            formatScript = `${formatScript} && eslint src --fix`;
        }
        return {
            scripts: {
                format: formatScript
            },
            prettier: {
                tabWidth: 4,
                semi: true,
                printWidth: 100,
                singleQuote: true
            }
        };
    }
};
