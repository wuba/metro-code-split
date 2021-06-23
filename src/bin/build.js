const path = require('path')
const {
  fse,
  commander: { program },
  log,
  execa,
  getDEO,
  paths,
  setNodeEnv,
} = require('general-tools')
const { Commands, BuildType, commandName, Platform, NodeEnv, relativeDllEntry } = require('../types')

const buildTypes = Object.values(BuildType)
const platforms = Object.values(Platform)

/**
 * CheckPlatforms
 * @param {string} str
 * @returns { string[] }
 */
const handleCheckPlatforms = (str) => {
  const vs = str.split(',').map((v) => v.trim())
  for (const v of vs) {
    if (!platforms.includes(v)) {
      log(
        `error: parameter "${v}" is not in the range of "${platforms.join(', ')}"`,
        'red'
      )
      process.exit(1)
    }
  }
  return vs
}

program
  .command(Commands.build)
  .description('build various types of packages')
  .option('-e, --entry <entryPath>', 'build entry file path (for busine only)', 'index.js')
  .option('-od, --output-dir <outputDir>', 'the output directory of the file', 'dist')
  .option(
    '-t, --type <type>',
    `build type (optional: ${buildTypes.join(' | ')})`,
    (value, dummyPrevious) => {
      if (!buildTypes.includes(value)) {
        log(
          `error: parameter "${value}" is not in the range of [${buildTypes.join(', ')}]`,
          'red'
        )
        process.exit(1)
      }
      return value
    },
    BuildType.Busine
  )
  .option(
    '-p, --platforms <items>',
    `build platform (optional: ${platforms.join(', ')})`,
    platforms.join(', ')
  )
  .action(async ({ entry, type, platforms, outputDir }) => {
    setNodeEnv(NodeEnv.production)

    const pfs = handleCheckPlatforms(platforms)

    const isBuildDll = [BuildType.DllJson, BuildType.Dll].includes(type)

    await fse[isBuildDll ? 'ensureDir' : 'emptyDir'](path.resolve(paths.cwdDir, outputDir))

    await Promise.all(
      pfs.map((v) => {
        const BuildTypeToFileNameMap = {
          [BuildType.DllJson]: `_dll.${v}.json`,
          [BuildType.Dll]: `_dll.${v}.bundle`,
          [BuildType.Busine]: `buz.${v}.bundle`,
        }
        return execa.command(
          [
            'react-native bundle',
            `--platform ${v}`,
            `--entry-file ${isBuildDll ? relativeDllEntry : entry}`,
            `--bundle-output ${path.join(
              outputDir,
              BuildTypeToFileNameMap[type]
            )}`,
            `--dev false`,
          ].join(' '),
          { ...getDEO(), stdio: 'inherit' }
        )
      })
    )

  })
  .on('--help', () => {
    log(['\nExamples:', `npx ${commandName} ${Commands.build}`])
  })
