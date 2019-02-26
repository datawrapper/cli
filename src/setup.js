const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const flatten = require('lodash/flatten');
const mergeWith = require('lodash/mergeWith');
const { h, Component, render, Color } = require('ink');
const { List, ListItem } = require('ink-checkbox-list');
const Spinner = require('ink-spinner');
const Gradient = require('ink-gradient');

const exit = require('./exit');

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

    handleSubmit(list) {
        this.setState({ status: 'running' }, async () => {
            const jobs = await Promise.all([
                this.writeConfigFiles(list),
                this.copyConfigFiles(list),
                this.modifyPackageJson(list),
                this.installPackages(list),
                this.runScripts(list)
            ]);

            this.setState({ status: 'done', summary: flatten(jobs) });
            setTimeout(() => {
                exit();
            }, 0);
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
            this.updateJob(jobIndex, 'Packackes installed.');
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
                <div>
                    <br />
                    <Gradient name="cristal">Setup completed! Let's write some code!</Gradient>
                    <br />
                    <br />
                    {summary.map(item => (
                        <div key="item">{item}</div>
                    ))}
                </div>
            );
        }

        if (status === 'running') {
            return (
                <div>
                    <br />
                    <Spinner green /> <Gradient name="cristal">Setup is running...</Gradient>
                    <br />
                    <br />
                    {jobs.map(([job, done]) => (
                        <div key={job}>
                            {done ? '✅' : <Spinner green />} {job}
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div>
                <br />
                <div>
                    <Gradient name="cristal">What do you want to setup?</Gradient>
                </div>
                <br />
                <List onSubmit={this.handleSubmit}>
                    {Object.entries(tools).map(tool => (
                        <ListItem key={tool[0]} value={tool[0]} checked>
                            {tool[1].name}
                        </ListItem>
                    ))}
                </List>
                <br />
                <div>
                    Press <Color cyan>[space]</Color> to select an option and{' '}
                    <Color cyan>[enter]</Color> to start the setup.
                </div>
            </div>
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
