const path = require('path')
const { paths } = require('general-tools')
const output = require('../output')

const outputDir = path.resolve(paths.cwdDir, output.relativeDir)

module.exports = {
  outputDir,
  asyncRequireModulePath: require('./asyncRequireModulePath'),
  chunkModuleIdToHashMapPath: require('./chunkModuleIdToHashMapPath'),
  dllEntryPath: require('./dllEntryPath'),
}
