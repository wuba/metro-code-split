const path = require('path')
const { paths } = require('general-tools')
const { name } = require('../../../package.json')

const asyncRequireModulePath = path.resolve(paths.cwdDir, `node_modules/.cache/${name}/asyncRequire.js`)

module.exports = asyncRequireModulePath
