const { exec } = require('shelljs');
const { h, render, Component, Color } = require('ink');
const Spinner = require('ink-spinner');
const Gradient = require('ink-gradient');

const exit = require('./exit');

class Format extends Component {
    constructor (props) {
        super(props);

        this.state = {
            status: '[running] Code is getting formatted',
            messages: []
        };

        this.runPrettier = this.runPrettier.bind(this);
        this.pushMessage = this.pushMessage.bind(this);
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

    runPrettier () {
        const { pattern = `'src/**/*.js'` } = this.props;
        const format = exec(`npx prettier ${pattern} --write`, { async: true, silent: true });

        exec(`npx eslint ${pattern} --fix`, { async: true, silent: true }, () => {
            this.setState({ status: '[done] Code formatted' });
            setTimeout(() => {
                exit();
            }, 0);
        });

        format.stdout.on('data', this.pushMessage('success'));
        format.stderr.on('data', this.pushMessage('error'));
    }

    componentDidMount () {
        this.runPrettier();
    }

    render () {
        const { status, messages } = this.state;

        return (
            <div>
                <br />
                {messages.map(m => (
                    <Color green={m[0] === 'success'} red={m[0] === 'error'}>
                        {m[0] === 'error' && <br />}
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

module.exports = (pattern, cmd) => render(<Format pattern={pattern} cmd={cmd} />);
