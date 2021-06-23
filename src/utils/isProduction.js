const { argv } = require('general-tools')

// 该项目的配置仅用于热更新平台（生产环境）
// 本地开发 通常执行 react-native start 不会有 platform 及 bundle-output
const isProduction = argv._.includes('bundle') && ['ios', 'android'].includes(argv.platform)

module.exports = isProduction
