const { exec } = require('shelljs');
const { h, render, Component, Color } = require('ink');
const Spinner = require('ink-spinner');
const Gradient = require('ink-gradient');

const exit = require('./exit');

class Lint extends Component {
    constructor(props) {
        super(props);

        this.state = {
            status: '[running] Code is being linted',
            messages: []
        };

        this.runEslint = this.runEslint.bind(this);
        this.pushMessage = this.pushMessage.bind(this);
    }

    pushMessage(type) {
        return message => {
            this.setState(prevState => {
                prevState.messages.push([type, message]);
                return prevState;
            });
        };
    }

    runEslint() {
        const { pattern = "'src/**/*.{js,html}'" } = this.props;
        const lint = exec(`npx healthier ${pattern}`, { async: true, silent: true }, () => {
            this.setState({ status: '[done] Code linted' });
            setTimeout(() => {
                exit();
            }, 0);
        });

        lint.stdout.on('data', this.pushMessage('error'));
    }

    componentDidMount() {
        this.runEslint();
    }

    render() {
        const { status, messages } = this.state;

        return (
            <div>
                <br />
                {messages.map(m => (
                    <Color red={m[0] === 'error'}>{m[1]}</Color>
                ))}
                <br />
                {status.includes('[running]') && <Spinner green />}
                <Gradient name="cristal"> {status}</Gradient>
            </div>
        );
    }
}

module.exports = (pattern, cmd) => render(<Lint pattern={pattern} cmd={cmd} />);
