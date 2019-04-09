import React, { Component } from 'react';
import { render, Color, Box, Text } from 'ink';
import { exec } from 'shelljs';
import Spinner from 'ink-spinner';
import Gradient from 'ink-gradient';

class Format extends Component {
    constructor(props) {
        super(props);

        this.state = {
            status: '[running] Code is getting formatted',
            messages: []
        };

        this.runPrettier = this.runPrettier.bind(this);
        this.pushMessage = this.pushMessage.bind(this);
    }

    pushMessage(type) {
        return message => {
            if (message !== '\n') {
                this.setState(prevState => {
                    prevState.messages.push([type, message]);
                    return prevState;
                });
            }
        };
    }

    runPrettier() {
        const { pattern = "'src/**/*.js'" } = this.props;
        const format = exec(`npx prettier ${pattern} --write`, { async: true, silent: true });

        exec(`npx eslint ${pattern} --fix`, { async: true, silent: true }, () => {
            this.setState({ status: '[done] Code formatted' });
        });

        format.stdout.on('data', this.pushMessage('success'));
        format.stderr.on('data', this.pushMessage('error'));
    }

    componentDidMount() {
        this.runPrettier();
    }

    render() {
        const { status, messages } = this.state;

        return (
            <Box flexDirection="column">
                {messages.map((m, i) => (
                    <Color key={i} green={m[0] === 'success'} red={m[0] === 'error'}>
                        {m[0] === 'error' && <br />}
                        {m[0] === 'success' && '✅ '}
                        {m[1]}
                    </Color>
                ))}
                {status.includes('[running]') && (
                    <Text>
                        <Spinner green />{' '}
                    </Text>
                )}
                <Gradient name="cristal">{status}</Gradient>
            </Box>
        );
    }
}

module.exports = (pattern, cmd) => render(<Format pattern={pattern} cmd={cmd} />);
