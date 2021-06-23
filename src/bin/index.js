#!/usr/bin/env node

const { commander: { program }, clearConsole } = require('general-tools')
const { commandName } = require('../types')
const pkg = require('../../package.json')

clearConsole()

program
  .name(commandName)
  .version(pkg.version, '-v, --version', 'output package version')
  .helpOption('-h, --help', 'display help')

require('./clear')

require('./update')

require('./start')

require('./build')

program.parse(process.argv)
