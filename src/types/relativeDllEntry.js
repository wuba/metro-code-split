const pkg = require('../../package.json')

const relativeDllEntry = `node_modules/.cache/${pkg.name}/dll-entry.js`

module.exports = relativeDllEntry
 