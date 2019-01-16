# @datawrapper/cli [![CircleCI](https://circleci.com/gh/datawrapper/cli.svg?style=svg&circle-token=87e50e1f79908137e5b8dfe612cb779650cea400)](https://circleci.com/gh/datawrapper/cli)

Command Line Utility to make project scaffolding and tooling setup simple.

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

## Features

* [x] `--help` - List available commands and how to use them
* [x] `--version` - Prints the version of this tool
* [x] `lint` - Use eslint to lint your code base or a file
* [x] `format` - Use prettier to format your code base or a file
* [x] `update` - Updates the cli tool
* [x] `setup` - Setup tools
  * [ ] `test` - basic test setup with ava
  * [ ] `storybook` - Storybook project setup
