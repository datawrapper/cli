const { h, Component, render, Bold, Underline } = require('ink');
const { exec } = require('shelljs');
const Box = require('ink-box');
const Gradient = require('ink-gradient');

const { name, version } = require('../package.json');

class Exit extends Component {
    componentDidMount () {
        setTimeout(() => {
            process.exit(0);
        }, 0);
    }

    render () {
        const { stdout } = exec(`npm show ${name}@latest version`, { silent: true });
        if (stdout.trim() === version.trim()) {
            return null;
        }

        return (
            <Box padding={1} align="center" float="center">
                <div>{name}</div>
                <br />
                <Bold>
                    <div>New version available</div>
                    <div>
                        <br/>
                        <Gradient name="cristal"> v{stdout.trim()}</Gradient>
                    </div>
                    <br />
                </Bold>
                <div>Please upgrade by running</div>
                <br />
                <div>
                    <Underline>dw update</Underline>
                </div>
            </Box>
        );
    }
}

module.exports = () => render(<Exit />);
