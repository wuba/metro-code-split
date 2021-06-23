// base default config
const baseConfig = {
  resolver: {},
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: true,
        inlineRequires: true,
      },
    }),
  },
}

module.exports = baseConfig
