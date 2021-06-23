/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const Mcs = require('metro-code-split')

const mcs = new Mcs({
  output: {
    // Only test
    publicPath: 'https://github.githubassets.com/a-rn-project',
  },
  dll: {
    entry: ['react-native', 'react'],
    referenceDir: './public/dll',
  },
  dynamicImports: { minSize: 0 },
})

const busineConfig = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
}

module.exports =
  process.env.NODE_ENV === 'production'
    ? mcs.mergeTo(busineConfig)
    : busineConfig
