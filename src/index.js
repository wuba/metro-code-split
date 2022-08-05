const path = require('path')
const { mergeConfig } = require('metro-config')
const { fse, ejs, tapable: { SyncHook, SyncBailHook }, log, paths: ps, dataExtend, argv } = require('general-tools')
const baseConfig = require('./config/baseConfig')
const InjectVar = require('./plugins/InjectVar')
const { isBaseDllPath, paths, dllJsonName, output, replacePath, preName } = require('./utils')
const { BuildType } = require('./types')
const pkg = require('../package.json')

/**
 * @typedef {typeof defaultOptions} DefaultOptions
 */
const defaultOptions = {
  output: {
    publicPath: '', // involving chunk prefix
    chunkDir: 'chunks', // chunk relative output dir
    chunkHashLength: 20, // chunk hash length
    chunkLoadTimeout: 120000, // chunk request timeout time
  },
  dll: {
    entry: [], // which three - party library into dll
    referenceDir: './dll', // the JSON address to reference for the build DLL file
  },
  dynamicImports: { // DynamicImports can also be set to false to disable this feature if it is not required
    asyncFlag: 'async', // async flag
    minSize: 20000, // minimum split size before compression
  },
  globalInlayVarName: '__APP__',
  // module path
  // /node_modules/metro/src/Server.js
  baseJSBundlePath: 'metro/src/DeltaBundler/Serializers/baseJSBundle',
  bundleToStringPath: 'metro/src/lib/bundleToString',
  asyncRequirePath: 'metro-runtime/src/modules/asyncRequire',
  // asyncRequire tpl address
  asyncRequireTpl: require.resolve('./tpl/wrapAsyncRequire.ejs'),
  asyncRequireTplExtraOptions: {},
  plugins: [],
  createBusinessModuleId ({ cacheMap, absolutePath, relativePath }) {
    cacheMap.set(absolutePath, relativePath)
    return relativePath
  }
}

class MetroCodeSplit {
  freezeFields = [
    'serializer.processModuleFilter',
    'serializer.createModuleIdFactory',
    'serializer.customSerializer',
  ]

  // match functions according to the output
  bundleOutputInfos = [
    {
      // Output dll json manifest
      name: BuildType.DllJson,
      regexp: /_dll\.(ios|android)\.json/,
      processModuleFilter: (() => {
        const dllArr = []
        const busineArr = []
        let timeId = null

        return arg => {
          const relativePath = replacePath(arg.path)
          const arr = this.options.dll.entry.length !== 0 && isBaseDllPath(relativePath) ? dllArr : busineArr
          arr.push(relativePath)

          timeId && clearTimeout(timeId)
          timeId = setTimeout(async () => {
            try {
              const dllOutputPath = path.resolve(paths.outputDir, dllJsonName)
              const dllContent = JSON.stringify([...new Set(dllArr)], null, 2)
              await fse.writeFile(dllOutputPath, dllContent)
              console.log(`info Writing json output to: ${replacePath(dllOutputPath)}`)
            } catch (err) {
              console.error(err)
            }
          }, 1500)

          return true
        }
      })(),
    },
    {
      // Output dll package
      name: BuildType.Dll,
      regexp: /_dll\.(ios|android)/,
      processModuleFilter: arg => this.isDllPath(arg.path),
    },
    {
      // Output busine package
      name: BuildType.Busine,
      regexp: /buz\.(ios|android)\.bundle/,
      processModuleFilter: arg => !this.isDllPath(arg.path),
    },
  ]

  /**
   * @param {DefaultOptions} options
   */
  constructor (options = {}) {
    /** @type {DefaultOptions} */
    this.options = dataExtend(true, {}, defaultOptions, options)
    this.hooks = Object.freeze({
      /** @type {SyncHook<[any[]]>} */
      beforeInit: new SyncHook(['bundleOutputInfos']),
      /** @type {SyncHook<[string[]]>} */
      beforeCheck: new SyncHook(['freezeFields']),
      /** @type {SyncHook<[string[]]>} */
      afterCheck: new SyncHook(['freezeFields']),
      /** @type {SyncBailHook<[any, any, any, any]>} */
      beforeCustomSerializer: new SyncBailHook(['entryPoint', 'prepend', 'graph', 'bundleOptions']),
      /** @type {SyncHook<[object]>} */
      beforeOutputChunk: new SyncHook(['chunkInfo']),
      /** @type {SyncHook<[string]>} */
      afterCustomSerializer: new SyncHook(['bundle']),
    })
    this.registerPlugin()
    this.hooks.beforeInit.call(this.bundleOutputInfos)
    // singleton pattern
    this._init = this.init()
  }

  registerPlugin () {
    const plugins = this.options.plugins.slice()
    plugins.push(new InjectVar()) // First the external plugin in the built-in plugin
    for (const plugin of plugins) {
      plugin && plugin.register && plugin.register(this)
    }
  }

  async init () {
    await Promise.all([
      this.isBuildDll && this.createDllEntryTpl(),
      this.hasDynamicImports && this.createAsyncRequire()
    ])
  }

  async createDllEntryTpl () {
    let dllEntryContent = ''
    for (const [i, v] of Object.entries(this.options.dll.entry)) {
      dllEntryContent += `\nimport * as arg${i} from '${v}'\nconsole.log(arg${i})\n`
    }
    await fse.ensureFile(paths.dllEntryPath)
    await fse.writeFile(paths.dllEntryPath, dllEntryContent)
  }

  async createAsyncRequire () {
    const content = await ejs.renderFile(
      path.resolve(ps.cwdDir, this.options.asyncRequireTpl),
      {
        options: {
          packageName: pkg.name,
          asyncRequirePath: this.options.asyncRequirePath,
          globalInlayVarName: this.options.globalInlayVarName,
          relativeChunkDir: this.options.output.chunkDir,
          fileSuffix: output.fileSuffix,
          timeoutTime: (this.hasDynamicImports ? this.options : defaultOptions)['output']['chunkLoadTimeout'],
          ...this.options.asyncRequireTplExtraOptions,
        }
      }
    )
    await fse.ensureFile(paths.asyncRequireModulePath)
    await fse.writeFile(paths.asyncRequireModulePath, content)
  }

  check (busineConfig) {
    this.hasDynamicImports && this.freezeFields.push('transformer.asyncRequireModulePath')
    // check freezeFields
    for (const v of this.freezeFields) {
      const arr = v.split('.')
      let median = null
      for (let i = 0; i <= arr.length - 1; i++) {
        const key = arr[i]
        if (i === arr.length - 1 && median[key]) {
          log(
            `The merge conflict originates from field "${v}". Try to delete the conflicting fieldMerging Conflicts Origins!`,
            'red'
          )
          process.exit(1)
        } else {
          if (typeof busineConfig[key] === 'object') {
            median = busineConfig[key]
          } else {
            break // there is no problem
          }
        }
      }
    }
  }

  /**
   * is dll resource path
   * @param { string } p absolute path
   * @returns { boolean }
   */
  isDllPath = p => {
    let prePaths = []
    let commonPaths = []
    const preRefPath = path.resolve(ps.cwdDir, path.join(this.options.dll.referenceDir, preName))
    const dllRefPath = path.resolve(ps.cwdDir, path.join(this.options.dll.referenceDir, dllJsonName))
    try {
      prePaths = require(preRefPath)
    } catch (err) {
      !this.isBuildDllJson && log('warning: failed to load the preRefPath correctly! are you setting the "dll.referenceDir" correctly?', 'yellow')
    }
    try {
      commonPaths = require(dllRefPath)
    } catch (err) {
      !this.isBuildDllJson && log('warning: failed to load the dllRefPath correctly! are you setting the "dll.referenceDir" correctly?', 'yellow')
    }
    // inertia method
    this.isDllPath = ap => {
      const rp = replacePath(ap)
      // iife section contains | __d ===
      return prePaths.some(v => rp.endsWith(v) || v.endsWith(rp)) || commonPaths.includes(rp)
    }
    return this.isDllPath(p)
  }

  /**
   * @param { string } p absolute path
   * @returns { string }
   */
  findDllModuleId = p => {
    let prePaths = []
    let commonPaths = []
    const preRefPath = path.resolve(ps.cwdDir, path.join(this.options.dll.referenceDir, preName))
    const dllRefPath = path.resolve(ps.cwdDir, path.join(this.options.dll.referenceDir, dllJsonName))
    try {
      prePaths = require(preRefPath)
    } catch (err) {
      !this.isBuildDllJson && log('warning: failed to load the preRefPath correctly! are you setting the "dll.referenceDir" correctly?', 'yellow')
    }
    try {
      commonPaths = require(dllRefPath)
    } catch (err) {
      !this.isBuildDllJson && log('warning: failed to load the dllRefPath correctly! are you setting the "dll.referenceDir" correctly?', 'yellow')
    }
    // inertia method
    this.findDllModuleId = ap => {
      const rp = replacePath(ap)
      const iifeId = prePaths.find(v => rp.endsWith(v) || v.endsWith(rp))
      if (iifeId) return iifeId
      const dId = commonPaths.find(v => v === rp)
      if (dId) return dId
      throw new Error('failed to find the dll module id!')
    }
    return this.findDllModuleId(p)
  }

  async mergeTo (busineConfig) {
    if (!require('./utils').isProduction) {
      log(
        `Package "${pkg.name}" should only be used in production environments!`,
        'red'
      )
      process.exit(1)
    }
    await this._init
    this.hooks.beforeCheck.call(this.freezeFields)
    this.check(busineConfig)
    this.hooks.afterCheck.call(this.freezeFields)
    const craeteMustConfig = require('./config/craeteMustConfig')
    return mergeConfig(baseConfig, busineConfig, craeteMustConfig(this))
  }

  get baseJSBundle () { return require(this.options.baseJSBundlePath) }

  get bundleToString () { return require(this.options.bundleToStringPath) }

  get outputDir () { return paths.outputDir }

  get outputChunkDir () { return path.resolve(paths.outputDir, this.options.output.chunkDir) }

  get hasDynamicImports () { return !!this.options.dynamicImports }

  // Do not match the default required to play the business
  get bundleOutputInfo () {
    let bundleOutputInfo = this.bundleOutputInfos.find(({ regexp }) => regexp.test(argv['bundle-output']))
    bundleOutputInfo === undefined && (bundleOutputInfo = this.bundleOutputInfos.find(({ name }) => name === BuildType.Busine))
    return bundleOutputInfo
  }

  // Whether or not to build Dll is relevant
  get isBuildDll () {
    return [BuildType.DllJson, BuildType.Dll].includes(this.bundleOutputInfo.name)
  }

  get isBuildDllJson () {
    return BuildType.DllJson === this.bundleOutputInfo.name
  }
}

module.exports = MetroCodeSplit
