const { exec } = require('shelljs');
const { h, render, Component, Color } = require('ink');
const Spinner = require('ink-spinner');
const Gradient = require('ink-gradient');
const SelectInput = require('ink-select-input');
const exit = require('./exit');

const name = require('../package.json').name;

class Update extends Component {
    constructor (props) {
        super(props);

        this.state = {
            status: '',
            messages: [],
            versions: [],
            select: props.cmd.select
        };

        this.pushMessage = this.pushMessage.bind(this);
        this.update = this.update.bind(this);
        this.loadVersions = this.loadVersions.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
    }

    pushMessage (type) {
        return message => {
            if (message !== '\n') {
                this.setState(prevState => {
                    prevState.messages.push([type, message]);
                    return prevState;
                });
            }
        };
    }

    update (name) {
        this.setState({
            status: '[running] Update is getting installed',
            select: false
        });
        const install = exec(
            `npm i -g ${name}`,
            { async: true, silent: true },
            (err, stdout, stderr) => {
                this.setState({
                    status: err ? '[error] Update failed' : `[success] ${name} installed`
                });
                setTimeout(() => {
                    exit();
                }, 0);
            }
        );
        install.stdout.on('data', this.pushMessage('message'));
        install.stderr.on('data', this.pushMessage('error'));
    }

    loadVersions () {
        this.setState({ status: '[loading] Loading versions' });
        exec(`npm show ${name}@* version`, { async: true, silent: true }, (err, stdout, stderr) => {
            if (err) {
                this.setState({ status: '[error] Loading failed.' });
                setTimeout(() => {
                    exit();
                }, 0);
            }

            this.setState({
                status: '[done] Versions loaded',
                versions: stdout
                    /** Split on new lines */
                    .split('\n')
                    /** Filter empty strings */
                    .filter(Boolean)
                    /** Remove redundant version number */
                    .map(v => v.split(' ')[0])
                    /** Only use latest 5 versions */
                    .slice(-5)
                    /** Reverse to show latest on top */
                    .reverse()
            });
        });
    }

    handleSelect ({ value }) {
        this.update(value);
    }

    componentDidMount () {
        if (!this.props.cmd.select) {
            this.update(name);
        } else {
            this.loadVersions();
        }
    }

    render () {
        const { status, messages, versions, select } = this.state;

        if (select && !status.includes('[running]')) {
            return (
                <div>
                    <Gradient name="cristal">What version do you want to install?</Gradient>
                    <br/>
                    {status.includes('[loading]') &&
                      <div>
                          <Spinner green />
                          <Gradient name="cristal"> {status}</Gradient>
                      </div>
                    }
                    <SelectInput
                        items={versions.map(v => ({ label: v, value: v }))}
                        onSelect={this.handleSelect}
                    ></SelectInput>
                </div>
            );
        }

        return (
            <div>
                <br />
                {messages.map(m => (
                    <Color green={m[0] === 'success'} red={m[0] === 'error'}>
                        {m[0] === 'success' && '✅ '}
                        {m[1]}
                    </Color>
                ))}
                <br />
                {status.includes('[running]') && <Spinner green />}
                <Gradient name="cristal"> {status}</Gradient>
            </div>
        );
    }
}

module.exports = cmd => render(<Update cmd={cmd} />);
