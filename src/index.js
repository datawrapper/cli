#! /usr/bin/env node

import program from 'commander';
import { version, name } from '../package.json';
import { exec } from 'shelljs';

program.version(version);

program
    .command('lint [pattern]')
    .description(
        `Use eslint to lint your code \n
This command will by default only lint files in the \`src\` directory.
It's possible to pass a custom glob pattern:\n
> dw lint index.js\n
This will only lint \`index.js\`.
`
    )
    .action(require('./lint'));

program
    .command('format [pattern]')
    .description(
        `Use prettier to format your code \n
This command will by default only lint files in the \`src\` directory.
`
    )
    .action(require('./format'));

program
    .command('setup')
    .description('Project setup commands')
    .action(require('./setup'));

program
    .command('update')
    .option('-s, --select', 'Select a specific version to update to.')
    .description('Update `dw` cli')
    .action(require('./update'));

program.parse(process.argv);

process.on('exit', () => {
    const { stdout } = exec(`npm show ${name}@latest version`, {
        silent: true
    });
    if (stdout.trim() !== version.trim()) {
        return;
    }

    process.stdout.write(`
A new version of ${name} is available. Run "dw update" to get it.
`);
});
