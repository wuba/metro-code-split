const { argv } = require('general-tools')
const paths = require('./paths')
const isProduction = require('./isProduction')
const output = require('./output')
const replacePath = require('./replacePath')
const { relativeDllEntry } = require('../types')

/**
 * 是否是基础 dll资源路径
 * @param { string } p
 */
const isBaseDllPath = (p) =>
  ['__prelude__', 'node_modules', 'require-node_modules'].some((v) =>
    p.includes(v)
  ) && ![relativeDllEntry, `require-${relativeDllEntry}`].some((v) => p.includes(v))

module.exports = {
  paths,
  isProduction,
  output,
  replacePath,
  dllJsonName: `_dll.${argv.platform}.json`,
  isBaseDllPath,
}
