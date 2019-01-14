const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const flatten = require('lodash/flatten');
const merge = require('lodash/merge');
const { h, Component, render } = require('ink');
const { List, ListItem } = require('ink-checkbox-list');
const Spinner = require('ink-spinner');
const Gradient = require('ink-gradient');

const lintConfig = require('../config/eslint');

const tools = {
    lint: {
        writeFile: ['.eslintrc.json', lintConfig.config],
        ...lintConfig
    },
    format: require('../config/prettier'),
    hooks: require('../config/git-hooks'),
    ci: {
        name: 'CircleCI',
        copyFile: ['../config/circleci.yml', '.circleci/config.yml']
    }
};

class Setup extends Component {
    constructor (props) {
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
        this.addJob = this.addJob.bind(this);
        this.updateJob = this.updateJob.bind(this);
    }

    handleSubmit (list) {
        this.setState({ status: 'running' }, async () => {
            const jobs = await Promise.all([
                this.writeConfigFiles(list),
                this.copyConfigFiles(list),
                this.modifyPackageJson(list),
                this.installPackages(list)
            ]);

            this.setState({ status: 'done', summary: flatten(jobs) });
            setTimeout(() => {
                process.exit(0);
            }, 0);
        });
    }

    addJob (text) {
        let index = 0;
        this.setState(prevState => {
            index = prevState.jobs.push([text, false]) - 1;
            return prevState;
        });
        return index;
    }

    updateJob (index, text) {
        this.setState(prevState => {
            index = prevState.jobs[index] = [text, true];
            return prevState;
        });
    }

    async copyConfigFiles (list) {
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

    async writeConfigFiles (list) {
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

    async modifyPackageJson (list) {
        const jobIndex = this.addJob('Adding keys to package.json ...');
        const packageJson = await fs.readJSON(path.join(process.cwd(), 'package.json'));

        const newPackageJson = list
            .filter(val => tools[val].packageJson)
            .reduce(
                (tempPackageJson, val) => merge(tools[val].packageJson, tempPackageJson),
                packageJson
            );

        await fs.writeJSON(path.join(process.cwd(), 'package.json'), newPackageJson, { spaces: 2 });

        this.updateJob(jobIndex, 'Keys added to package.json');
        return ['  - package.json updated'];
    }

    async installPackages (list) {
        const jobIndex = this.addJob('Installing npm packages ...');
        const packages = flatten(
            list.filter(val => tools[val].packages).map(val => tools[val].packages)
        );
        if (list.length) {
            await exec(`npm install ${packages.join(' ')}`);
            this.updateJob(jobIndex, 'Packackes installed.');
            return [`  - ${packages.length} packages installed`];
        } else {
            return ['Nothing to install.'];
        }
    }

    render () {
        const { status, jobs, summary } = this.state;
        if (status === 'done') {
            return (
                <div>
                    <br />
                    <Gradient name="cristal">Setup completed! Let's write some code!</Gradient>
                    <br />
                    <br />
                    {summary.map(item => (
                        <div key='item'>
                            {item}
                        </div>
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
                {status}
                <br />
                <div>
                    <Gradient name="cristal">What do you want to setup?</Gradient>
                </div>
                <List onSubmit={this.handleSubmit}>
                    {Object.entries(tools).map(tool => (
                        <ListItem key={tool[0]} value={tool[0]} checked>
                            {tool[1].name}
                        </ListItem>
                    ))}
                </List>
            </div>
        );
    }
}

module.exports = () => render(<Setup />);
