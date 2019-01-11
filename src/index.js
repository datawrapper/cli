#! /usr/bin/env node

var program = require('commander');
const { version } = require('../package.json');

program.version(version);

program
    .command('lint [pattern]')
    .description('Use eslint to lint your code')
    .option('--fix', 'Fix auto-fixable problems')
    .action(require('./lint'));

program
    .command('format')
    .description('Use prettier to format your code')
    .action(() => {
        console.log('@TODO: implement `format` option');
    });

program
    .command('setup')
    .description('Project setup commands')
    .action(() => {
        console.log('@TODO: implement `setup` option');
    });

program.parse(process.argv);
