module.exports = {
    name: 'Code formatting',
    packages: ['prettier'],
    packageJson: {
        scripts: {
            format: "prettier 'src/**/*.js' --write"
        },
        prettier: {
            tabWidth: 4,
            semi: true,
            printWidth: 100,
            singleQuote: true
        }
    }
};
