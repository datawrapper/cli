import React, { Component } from 'react';
import { render, Color, Box, Text } from 'ink';
import { exec } from 'shelljs';
import Spinner from 'ink-spinner';
import Gradient from 'ink-gradient';

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
        });

        lint.stdout.on('data', this.pushMessage('error'));
    }

    componentDidMount() {
        this.runEslint();
    }

    render() {
        const { status, messages } = this.state;

        return (
            <Box flexDirection="column">
                {messages.map((m, i) => (
                    <Color key={i} red={m[0] === 'error'}>
                        {m[1]}
                    </Color>
                ))}
                <Box paddingTop={1}>
                    {status.includes('[running]') && (
                        <Text>
                            <Spinner green />{' '}
                        </Text>
                    )}
                    <Gradient name="cristal">{status}</Gradient>
                </Box>
            </Box>
        );
    }
}

module.exports = (pattern, cmd) => render(<Lint pattern={pattern} cmd={cmd} />);
