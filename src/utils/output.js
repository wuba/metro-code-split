const path = require('path')
const { argv } = require('general-tools')

const { dir, ext } = path.parse(argv['bundle-output'] || '')

module.exports = {
  relativeDir: dir,
  fileSuffix: ext,
}
