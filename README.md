# @datawrapper/cli [![CircleCI](https://circleci.com/gh/datawrapper/cli.svg?style=svg&circle-token=87e50e1f79908137e5b8dfe612cb779650cea400)](https://circleci.com/gh/datawrapper/cli)

> **Note:** This is an internal tool used by the Datawrapper development team. It is _not_ a command-line interface for the Datawrapper API, so you can't use it to create/edit charts etc.
>
> **⚠️ This is an internal tool used by the Datawrapper development team️️️️️! ⚠️**

Command Line Utility to make project scaffolding and tooling setup simple.

This tool is mainly in use at Datawrapper internally and has Datawrapper specific settings and configuration. If this is helpful for you great but it might not. PRs welcome but we might not merge everything.

## Installation

### Install globally (recommended)

```sh
# global installation
$ npm i -g @datawrapper/cli
```

### Install as project dependency or use `npx`

```sh
$ npm i -D @datawrapper/cli

# usage with `npx`
$ npx @datawrapper/cli lint
```

## Usage

The `--help` command shows you more information about everything you can do with `dw`.

It is possible to run `--help` for all sub commands.

```
❯ dw --help
Usage: dw [options] [command]

Options:
  -V, --version     output the version number
  -h, --help        output usage information

Commands:
  lint [pattern]    Use eslint to lint your code

  This command will by default only lint files in the `src` directory.
  It's possible to pass a custom glob pattern:

  > dw lint index.js

  This will only lint `index.js`.

  format [pattern]  Use prettier to format your code

  This command will by default only lint files in the `src` directory.

  setup             Project setup commands
  update [options]  Update `dw` cli
```

The following commands are available.

```sh
# Quick setup scripts for use in existing or new projects
❯ dw setup

What do you want to setup?

# configures eslint with the Datawrapper eslint config
❯  ☐  Code linting

# configures prettier to format code
   ☐  Code formatting

# configures commit hooks that run linting and/or formatting scripts before commits
   ☐  Git Hooks

# copies a standard CircleCI config into the repository
   ☐  CircleCI

# Adds a standard gitignore file for node based projects
   ☐  Add gitignore

# Installs recommended Visual Studio Code Extensions for a better workflow in Datawrapper projects.
   ☐  VSCode Extensions

Press [space] to select an option and [enter] to start the setup.
```

Other commands to update or quickly lint/format a file:

```sh
# lints your projects source files based on Datawrapper Code Guidelines
# Wrapper around `eslint src --fix`
❯ dw lint

# formats your projects source files based on Datawrapper Code Guidelines
# Wrapper around `prettier src/**/*.js --write`
❯ dw format

# Updates the `dw` CLI to the latest version
# Wrapper around `npm i -g @datawrapper/cli`
❯ dw update
```

## Important!

**The setup command will overwrite existing files, and keys in your package.json. DO Not run it if you want to keep your current config!**

If by accident, you overwrite your config files it should be pretty easy to revert when using git.  
(In a future update this behaviour might change and `dw` won't just blindly overwrite files.)

## Development

To contribute features to `@datawrapper/cli`, clone the repository and install dependencies with `npm`.

```sh
❯ git clone git@github.com:datawrapper/cli.git
❯ npm install
```

With these commands the development environment is setup. Run `npm start` to build the executable with Parcel, which will end up in `bin/index.js`. Try to run it with `node bin/index.js --help`. The terminal should print the help instructions. To get a global `dw` command, link the project with `npm link`.

The recommended setup is to run `npm start` in a terminal window. This will start Parcel and watches all source files for changes and rebuilds the executable.

```sh
~/code/dw-cli
❯ npm start

> @datawrapper/cli@0.1.1 start /Users/fabian/code/dw-cli
> parcel src/index.js --target node --out-dir bin/

✨  Built in 26ms.
```

In another terminal window try out the CLI by linking once and running `dw --help`.

```sh
~/code/dw-cli
❯ npm link
❯ dw --help
```

## Features

-   [x] `--help` - List available commands and how to use them
-   [x] `--version` - Prints the version of this tool
-   [x] `lint` - Use eslint to lint your code base or a file
-   [x] `format` - Use prettier to format your code base or a file
-   [x] `update` - Updates the cli tool
-   [x] `setup` - Setup tools
