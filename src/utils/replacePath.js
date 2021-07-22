const { paths } = require('general-tools')

/**
 * converts absolute paths to relative paths
 * @param { string } to
 * @param { string } from
 * @returns
 * @describe Since some paths contain require-xxx, so use replace instead of path.relative
 */
const replacePath = (to, from = paths.cwdDir) => to.replace(from + '/', '')

module.exports = replacePath
