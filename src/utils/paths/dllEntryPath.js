const path = require('path')
const { paths } = require('general-tools')
const { relativeDllEntry } = require('../../types')

const dllEntryPath = path.resolve(paths.cwdDir, relativeDllEntry)

module.exports = dllEntryPath
