import fs from 'fs-extra';
import path from 'path';
import util from 'util';

import React, { Component } from 'react';
import { render, Color, Box } from 'ink';
import flatten from 'lodash/flatten';
import mergeWith from 'lodash/mergeWith';
import MultiSelect from 'ink-multi-select';
import Spinner from 'ink-spinner';
import Gradient from 'ink-gradient';

const exec = util.promisify(require('child_process').exec);

function replaceSource(objValue, srcValue) {
    if (Array.isArray(objValue)) {
        return objValue;
    }
    if (typeof objValue === 'string') {
        return objValue;
    }
}

const tools = {
    lint: require('../config/eslint'),
    format: require('../config/prettier'),
    hooks: require('../config/git-hooks'),
    ci: {
        name: 'CircleCI',
        copyFile: ['../config/circleci.yml', '.circleci/config.yml']
    },
    gitignore: {
        name: 'Add gitignore',
        copyFile: ['../config/.gitignore-example', '.gitignore']
    },
    vscode: {
        name: 'VSCode Extensions',
        script: `code --install-extension ${[
            'kidkarolis.vscode-healthier',
            'wix.vscode-import-cost',
            'esbenp.prettier-vscode',
            'mechatroner.rainbow-csv',
            'marclipovsky.string-manipulation',
            'sleistner.vscode-fileutils'
        ].join(' ')}`
    }
};

class Setup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            status: 'init',
            jobs: []
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.writeConfigFiles = this.writeConfigFiles.bind(this);
        this.copyConfigFiles = this.copyConfigFiles.bind(this);
        this.modifyPackageJson = this.modifyPackageJson.bind(this);
        this.installPackages = this.installPackages.bind(this);
        this.runScripts = this.runScripts.bind(this);
        this.addJob = this.addJob.bind(this);
        this.updateJob = this.updateJob.bind(this);
    }

    handleSubmit(items) {
        const list = items.map(({ value }) => value);
        this.setState({ status: 'running' }, async () => {
            const jobs = await Promise.all([
                this.writeConfigFiles(list),
                this.copyConfigFiles(list),
                this.modifyPackageJson(list),
                this.installPackages(list),
                this.runScripts(list)
            ]);

            this.setState({ status: 'done', summary: flatten(jobs) });
        });
    }

    addJob(text) {
        let index = 0;
        this.setState(prevState => {
            index = prevState.jobs.push([text, false]) - 1;
            return prevState;
        });
        return index;
    }

    updateJob(index, text) {
        this.setState(prevState => {
            index = prevState.jobs[index] = [text, true];
            return prevState;
        });
    }

    async copyConfigFiles(list) {
        const jobIndex = this.addJob('Copying files ...');
        const funcs = list
            .filter(val => tools[val].copyFile)
            .map(async val => {
                await fs.copy(
                    path.join(__dirname, tools[val].copyFile[0]),
                    path.join(process.cwd(), tools[val].copyFile[1])
                );
                return `  - ${tools[val].copyFile[1]} copied`;
            });

        this.updateJob(jobIndex, 'Files copied');
        return Promise.all(funcs);
    }

    async writeConfigFiles(list) {
        const jobIndex = this.addJob('Writing config files ...');
        const funcs = list
            .filter(val => tools[val].writeFile)
            .map(async val => {
                await fs.writeJSON(
                    path.join(process.cwd(), tools[val].writeFile[0]),
                    tools[val].writeFile[1],
                    {
                        spaces: 2
                    }
                );
                return `  - ${tools[val].writeFile[0]} written`;
            });

        this.updateJob(jobIndex, 'Config files written');
        return Promise.all(funcs);
    }

    async modifyPackageJson(list) {
        const jobIndex = this.addJob('Adding keys to package.json ...');
        const packageJson = await fs.readJSON(path.join(process.cwd(), 'package.json'));

        const newPackageJson = list
            .filter(val => tools[val].packageJson)
            .reduce((tempPackageJson, val) => {
                const newKeys =
                    typeof tools[val].packageJson === 'function'
                        ? tools[val].packageJson(list)
                        : tools[val].packageJson;

                return mergeWith(newKeys, tempPackageJson, replaceSource);
            }, packageJson);

        const sortedPackageJson = sortPackageJson(newPackageJson);

        await fs.writeJSON(path.join(process.cwd(), 'package.json'), sortedPackageJson, {
            spaces: 4
        });

        this.updateJob(jobIndex, 'Keys added to package.json');
        return ['  - package.json updated'];
    }

    async installPackages(list) {
        const packages = flatten(
            list.filter(val => tools[val].packages).map(val => tools[val].packages)
        );
        const jobIndex = this.addJob(`Installing ${packages.length} npm packages ...`);

        if (packages.length) {
            await exec(`npm install -D ${packages.join(' ')}`);
            this.updateJob(jobIndex, 'Packages installed.');
            return [`  - ${packages.length} packages installed`];
        } else {
            return ['  - Nothing to install.'];
        }
    }

    async runScripts(list) {
        const jobIndex = this.addJob('Execute scripts...');
        const scripts = list
            .filter(val => tools[val].script)
            .map(async val => {
                await exec(tools[val].script);
                return `  - Script (${tools[val].name}) executed`;
            });

        this.updateJob(jobIndex, 'Scripts executed.');
        return Promise.all(scripts);
    }

    render() {
        const { status, jobs, summary } = this.state;
        if (status === 'done') {
            return (
                <Box flexDirection="column" paddingTop={1}>
                    <Gradient name="cristal">Setup completed! Let's write some code!</Gradient>
                    <Box flexDirection="column" paddingTop={1}>
                        {summary.map(item => (
                            <Box key={item}>{item}</Box>
                        ))}
                    </Box>
                </Box>
            );
        }

        if (status === 'running') {
            return (
                <Box flexDirection="column" paddingTop={1}>
                    <Gradient name="cristal">Setup is running...</Gradient>
                    <Box flexDirection="column" paddingTop={1}>
                        {jobs.map(([job, done]) => (
                            <Box key={job}>
                                {done ? '✅' : <Spinner green />} {job}
                            </Box>
                        ))}
                    </Box>
                </Box>
            );
        }

        return (
            <Box flexDirection="column">
                <Box flexDirection="column" paddingTop={1}>
                    <Gradient name="cristal">What do you want to setup?</Gradient>
                </Box>
                <Box paddingTop={1} paddingBottom={1}>
                    <MultiSelect
                        items={Object.entries(tools).map(tool => ({
                            label: tool[1].name,
                            value: tool[0]
                        }))}
                        onSubmit={this.handleSubmit}
                    />
                </Box>
                <Box width="100%">
                    Press <Color cyan>[space]</Color> to select an option and{' '}
                    <Color cyan>[enter]</Color> to start the setup.
                </Box>
            </Box>
        );
    }
}

module.exports = () => render(<Setup />);

/**
 * re-orders the keys in a package.json object
 */
function sortPackageJson(pkgJson) {
    const keyOrder = [
        'name',
        'version',
        'description',
        'keywords',
        'homepage',
        'bugs',
        'license',
        'author',
        'contributors',
        'files',
        'main',
        'browser',
        'bin',
        'scripts',
        'repository',
        'config',
        'directories',
        'dependencies',
        'devDependencies',
        'peerDependencies',
        'bundledDependencies',
        'optionalDependencies'
    ];
    // create a temporary map to reduce computing overhead in sort function
    const sortIndex = Object.keys(pkgJson).reduce((sortIndex, key) => {
        sortIndex[key] = keyOrder.indexOf(key);
        if (sortIndex[key] < 0) sortIndex[key] = 999;
        return sortIndex;
    }, {});

    const sortedPackageJSON = {};
    Object.keys(pkgJson)
        .sort((a, b) => {
            return sortIndex[a] - sortIndex[b];
        })
        .forEach(key => {
            sortedPackageJSON[key] = pkgJson[key];
        });
    return sortedPackageJSON;
}
