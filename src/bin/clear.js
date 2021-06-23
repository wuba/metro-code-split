const path = require('path')
const {
  execa,
  getDEO,
  fse,
  commander: { program },
  log,
  paths,
  clearConsole,
} = require('general-tools')
const { Commands, commandName } = require('../types')

const handleClear = async () => {
  log('👉🏼 clear the cache ...')
  const npmCacheDir = path.resolve(paths.cwdDir, 'node_modules/.cache')
  await Promise.all([
    fse.emptyDir(npmCacheDir),
    execa.command(
      [
        'npm cache clean --force',
        'rm -rf $TMPDIR/metro-cache $TMPDIR/react-native-packager-cache-* haste-map-*',
        'watchman watch-del-all',
      ].join(' && '), // && Just for elegant output
      { ...getDEO(), stdio: 'inherit' }
    ),
  ])
  clearConsole()
  log('✨ cache cleared！')
}

program
  .command(Commands.clear)
  .description('clear npm cache、metro cache、watchman')
  .action(handleClear)
  .on('--help', () => {
    log(['\nExamples:', `npx ${commandName} ${Commands.clear}`])
  })

module.exports = handleClear
