import fs from 'fs-extra';
import { grep } from 'shelljs';

import React from 'react';
import { render, Color, Box, Text } from 'ink';
import { homedir } from 'os';
import path from 'path';

export default function Gitignore({ files, cmd }) {
    const add = cmd.add || !cmd.remove;
    const remove = !add && cmd.remove;
    const isGlobal = cmd.global;

    /* remove duplicates */
    files = Array.from(new Set(files));

    let gitignorePath = path.join(process.cwd(), '.gitignore');

    if (isGlobal) {
        gitignorePath = grep('excludesfile', path.join(homedir(), '.gitconfig'))
            .toString()
            .split('=')[1]
            .trim();
    }

    if (!fs.existsSync(gitignorePath)) {
        return (
            <Box flexDirection="column">
                <Color red>Could not find "{gitignorePath}".</Color>
                <Box marginTop={1}>
                    <Text>
                        You can create a <Color bold>gitignore</Color> with the following command:
                    </Text>
                </Box>
                <Box marginTop={1}>
                    <Color green>> dw setup</Color>
                </Box>
            </Box>
        );
    }

    let gitignore = fs.readFileSync(gitignorePath, { encoding: 'utf8' }).split('\n');
    const newFiles = files.filter(file => !gitignore.includes(file));

    if (remove) {
        const filesToRemove = files.filter(file => gitignore.includes(file));
        if (!filesToRemove.length) {
            return <Box>Nothing to remove.</Box>;
        }

        gitignore = gitignore.filter(line => !filesToRemove.includes(line));

        if (!gitignore[gitignore.length - 1]) {
            gitignore.pop();
        }
        fs.writeFileSync(gitignorePath, gitignore.join('\n') + '\n');

        return <Box>Removed entries.</Box>;
    }

    if (newFiles.length) {
        fs.appendFileSync(gitignorePath, '\n' + newFiles.join('\n') + '\n');
    } else {
        return <Box>Nothing to add.</Box>;
    }

    return (
        <Box flexDirection="column">
            <Text>Entries added:</Text>
            {newFiles.map(file => (
                <Text key={file}>- {file}</Text>
            ))}
        </Box>
    );
}

module.exports = (files, cmd) => render(<Gitignore files={files} cmd={cmd} />);
