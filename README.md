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

```sh
# lints your projects source files based on Datawrapper Code Guidelines
$ dw lint 

# formats your projects source files based on Datawrapper Code Guidelines
$ dw format 
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
