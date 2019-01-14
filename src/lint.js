const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { h, render, Component, Fragment, Color } = require('ink');
const ConfirmInput = require('ink-confirm-input');
const Spinner = require('ink-spinner');

class Lint extends Component {
    constructor (props) {
        super(props);

        this.state = {
            stdout: '',
            input: '',
            status: 'init'
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount () {
        this.runEslint(this.props.cmd.fix);
    }

    async runEslint (fix) {
        this.setState({ status: 'loading' });
        try {
            await exec(`npx eslint "${this.props.pattern}" ${fix ? '--fix' : ''}`);
            this.setState(() => ({ status: 'done' }));
            setTimeout(() => {
                process.exit(0);
            }, 0);
        } catch (err) {
            this.setState(() => ({ stdout: err.stdout, status: 'err' }));
        }
    }

    handleChange (input) {
        this.setState({ input });
    }

    handleSubmit (val) {
        if (val) {
            this.runEslint(val);
            this.setState({ input: '' });
        } else {
            process.exit(0);
        }
    }

    render () {
        if (this.state.status === 'done') {
            return (
                <Fragment>
                    <br />
                    <Color green>✓</Color> ESLint Done
                </Fragment>
            );
        }

        return (
            <Fragment>
                <br />
                {this.state.status === 'loading' && (
                    <Fragment>
                        <Spinner green /> Running ESLint
                    </Fragment>
                )}
                {this.state.status === 'err' && (
                    <Fragment>
                        <Color red>{this.state.stdout}</Color>
                        <br />
            Try to fix errors (Y/n)?{' '}
                        <ConfirmInput
                            value={this.state.input}
                            onChange={this.handleChange}
                            onSubmit={this.handleSubmit}
                        />
                    </Fragment>
                )}
            </Fragment>
        );
    }
}

module.exports = (pattern = 'src', cmd) => render(<Lint pattern={pattern} cmd={cmd} />);
