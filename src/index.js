#! /usr/bin/env node

var program = require('commander');
const { version } = require('../package.json');

program.version(version);

program
    .command('lint [pattern]')
    .description(`Use eslint to lint your code \n
This command will by default only lint files in the \`src\` directory.
It's possible to pass a custom glob pattern:\n
> dw lint index.js\n
This will only lint \`index.js\`.
`)
    .action(require('./lint'));

program
    .command('format [pattern]')
    .description(`Use prettier to format your code \n
This command will by default only lint files in the \`src\` directory.
`)
    .action(require('./format'));

program
    .command('setup')
    .description('Project setup commands')
    .action(require('./setup'));

program.parse(process.argv);
