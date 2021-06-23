const {
  fse,
  execa,
  getDEO,
  commander: { program },
  log,
  paths,
} = require('general-tools')
const handleClear = require('./clear')
const { Commands, commandName } = require('../types')
const pkg = require('../../package.json')

const hasNpmLock = () => fse.pathExists(path.resolve(paths.cwdDir, 'package-lock.json'))
const hasYarnLock = () => fse.pathExists(path.resolve(paths.cwdDir, 'yarn.lock'))

program
  .command(Commands.update)
  .description(`update ${pkg.name}`)
  .action(async () => {
    await handleClear()
    const [isNpmLock, isYarnLock] = await Promise.all([hasNpmLock(), hasYarnLock()])
    await execa.command(
      isYarnLock && !isNpmLock
        ? `yarn upgrade ${pkg.name}`
        : `npm update ${pkg.name}`,
      { ...getDEO(), stdio: 'inherit' }
    )
  })
  .on('--help', () => {
    log(['\nExamples:', `npx ${commandName} ${Commands.update}`])
  })
