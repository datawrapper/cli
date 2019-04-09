import React, { Component } from 'react';
import { render, Color, Box, Text } from 'ink';
import { exec } from 'shelljs';
import Spinner from 'ink-spinner';
import Gradient from 'ink-gradient';
import SelectInput from 'ink-select-input';

const name = require('../package.json').name;

class Update extends Component {
    constructor(props) {
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

    update(name) {
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
            }
        );
        install.stdout.on('data', this.pushMessage('message'));
        install.stderr.on('data', this.pushMessage('error'));
    }

    loadVersions() {
        this.setState({ status: '[loading] Loading versions' });
        exec(`npm show ${name}@* version`, { async: true, silent: true }, (err, stdout, stderr) => {
            if (err) {
                this.setState({ status: '[error] Loading failed.' });
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

    handleSelect({ value }) {
        this.update(value);
    }

    componentDidMount() {
        if (!this.props.cmd.select) {
            this.update(name);
        } else {
            this.loadVersions();
        }
    }

    render() {
        const { status, messages, versions, select } = this.state;

        if (select && !status.includes('[running]')) {
            return (
                <Box flexDirection="column">
                    <Gradient name="cristal">What version do you want to install?</Gradient>
                    {status.includes('[loading]') && (
                        <Box>
                            <Spinner green />
                            <Gradient name="cristal"> {status}</Gradient>
                        </Box>
                    )}
                    <SelectInput
                        items={versions.map(v => ({ label: v, value: v }))}
                        onSelect={this.handleSelect}
                    />
                </Box>
            );
        }

        return (
            <Box flexDirection="column">
                {messages.map((m, i) => (
                    <Color key={i} green={m[0] === 'success'} red={m[0] === 'error'}>
                        {m[0] === 'success' && '✅ '}
                        {m[1]}
                    </Color>
                ))}
                {status.includes('[running]') && (
                    <Text>
                        <Spinner green />{' '}
                    </Text>
                )}
                <Gradient name="cristal"> {status}</Gradient>
            </Box>
        );
    }
}

module.exports = cmd => render(<Update cmd={cmd} />);
