# @datawrapper/cli [![CircleCI](https://circleci.com/gh/datawrapper/cli.svg?style=svg&circle-token=87e50e1f79908137e5b8dfe612cb779650cea400)](https://circleci.com/gh/datawrapper/cli)

Command Line Utility to make project scaffolding and tooling setup simple.

## Installation

### Install as project dependency (recommended)

```sh
$ npm i -D @datawrapper/cli
```

### Install globally or use `npx`

```sh
# global installation
$ npm i -g @datawrapper/cli

# usage with `npx`
$ npx @datawrapper/cli lint
```

## Usage

```sh
# lints your projects source files based on Datawrapper Code Guidelines

$ dw lint 

# formats your projects source files based on Datawrapper Code Guidelines

$ dw format 
```

## Features

* [x] `--help` - List available commands and how to use them
* [x] `--version` - Prints the version of this tool
* [ ] `lint` - Use eslint to lint your code base or a file
* [ ] `format` - Use eslint to format your code base or a file
* [ ] `setup` - Setup tools
  * [ ] `repo` - Configures a new empty project with `lint`, `format` and `hooks`
  * [ ] `ci` - CircleCI config
  * [ ] `hooks` - Git commit hooks
  * [ ] `storybook` - Storybook project setup
