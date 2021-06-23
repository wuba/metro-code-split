const Platform = require('./Platform')
const relativeDllEntry = require('./relativeDllEntry')
const NodeEnv = require('./NodeEnv')
const Commands = require('./Commands')
const BuildType = require('./BuildType')
const pkg = require('../../package.json')

module.exports = {
  Platform,
  relativeDllEntry,
  NodeEnv,
  commandName: Object.keys(pkg.bin)[0],
  Commands,
  BuildType,
}
