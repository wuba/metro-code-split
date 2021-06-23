const {
  execa,
  commander: { program },
  log,
  getDEO,
  setNodeEnv,
} = require('general-tools')
const { Commands, commandName, NodeEnv } = require('../types')

program
  .command(Commands.start)
  .description('start the local development server')
  .option('-p, --port <entryPath>', 'server port', '8081')
  .action(async ({ port }) => {
    setNodeEnv(NodeEnv.development)
    log(`service will soon run on ${port}`)
    await execa.command(`react-native start --port ${port}`, {
      ...getDEO,
      stdio: 'inherit',
    })
  })
  .on('--help', () => {
    log(['\nExamples:', `npx ${commandName} ${Commands.start}`])
  })
