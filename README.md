# React-Native Code Splitting

Further split the React Native code based on Metro build to improve performance, providing `Dll` and `Dynamic Imports` features

## Features & Solve issue

- `Dll` **The split 820KB + common code (react、react-native) can be built into the App, similar to the Webpack DLLPlugin**
- `Dynamic Imports` [**issue**](https://github.com/facebook/metro/issues/52)

## Compatibility with Metro versions

- dependencies react-native -> @react-native-community/cli -> metro
- metro-code-split -> metro

  | metro version | metro-code-split version |
  | :-----------: | :----------------------: |
  | 0.64.0 - 0.66.0 | 0.1.x |

## How to use it?

1. Install the package that matches the Metro version

```ts
  npm i metro-code-split -D | yarn add metro-code-split -D
```

2. Add the scripts in package.json

```ts
  "scripts": {
    "start": "mcs-scripts start -p 8081",
    "build:dllJson": "mcs-scripts build -t dllJson -od public/dll",
    "build:dll": "mcs-scripts build -t dll -od public/dll",
    "build": "mcs-scripts build -t busine -e index.js"
  }
```

- More command details

```ts
  npx mcs-scripts --help
```

3. Modify the metro.config.js

```ts
  const Mcs = require('metro-code-split')

  const mcs = new Mcs({
    output: {
      publicPath: 'https://a.cdn.com/a-rn-project',
    },
    dll: {
      entry: ['react-native', 'react'], // which three - party library into dll
      referenceDir: './public/dll', // the JSON address to reference for the build DLL file, also the npm run build:dllJson output directory
    },
    dynamicImports: {}, // DynamicImports can also be set to false to disable this feature if it is not required
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

  module.exports = process.env.NODE_ENV === 'production' ? mcs.mergeTo(busineConfig) : busineConfig
```

- [Mcs DefaultOptions](./src/index.js)

4. Execute the command

```ts
  npm run build:dllJson // build the reference json file for the Dll
  npm run build:dll // build the Dll file (the generated Dll file is usually built into the APP)
  npm run build // build busine code
```

## Custom logic

- Mcs options provides plugins. You can write plugins in the Mcs as if you were writing Webpack plugins

  |         hooks          |     type     |                      parameter                      |
  | :--------------------: | :----------: | :-------------------------------------------------: |
  |       beforeInit       |   SyncHook   |                ['bundleOutputInfos']                |
  |      beforeCheck       |   SyncHook   |                  ['freezeFields']                   |
  |       afterCheck       |   SyncHook   |                  ['freezeFields']                   |
  | beforeCustomSerializer | SyncBailHook | ['entryPoint', 'prepend', 'graph', 'bundleOptions'] |
  |   beforeOutputChunk    |   SyncHook   |                    ['chunkInfo']                    |
  | afterCustomSerializer  |   SyncHook   |                     ['bundle']                      |

## Attention to issue

- This package is only used in `production` environments! (There are currently no plans to be compatible with `development`)

- The add scripts are equivalent to The following (The main purpose is to optimize the `build:dllJson` `build:dll` long instructions, if you intend to provide commands using React-Native, be sure to add `NODE_ENV=xxx`)
  ```ts
    "scripts": {
      "start": "NODE_ENV=production react-native start --port 8081",
      "build:dllJson": "NODE_ENV=production react-native bundle --platform ios --entry-file node_modules/.cache/metro-code-split/dll-entry.js --bundle-output public/dll/_dll.ios.json --dev false & NODE_ENV=production react-native bundle --platform android --entry-file node_modules/.cache/metro-code-split/dll-entry.js --bundle-output public/dll/_dll.android.json --dev false",
      "build:dll": "NODE_ENV=production react-native bundle --platform ios --entry-file node_modules/.cache/metro-code-split/dll-entry.js --bundle-output public/dll/_dll.ios.bundle --dev false & NODE_ENV=production react-native bundle --platform android --entry-file node_modules/.cache/metro-code-split/dll-entry.js --bundle-output public/dll/_dll.android.bundle --dev false",
      "build": "NODE_ENV=production react-native bundle --platform ios --entry-file index.js --bundle-output dist/buz.ios.bundle --dev false & NODE_ENV=production react-native bundle --platform android --entry-file index.js --bundle-output dist/buz.android.bundle --dev false"
    }
  ```

## Rendering

<div align="center">
  <img src="./Example/ReadmeInfo/effect.gif" alt="rendering" width="70%"/>
</div>

## [Example](./Example/)

## TODO

- cacheStores: [], // concurrent build cache issues https://github.com/facebook/metro/issues/331
- source map support
- ts refactor
