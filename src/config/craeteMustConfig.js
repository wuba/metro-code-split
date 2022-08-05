const path = require('path')
const { fse } = require('general-tools')
const dynamicImports = require('./dynamicImports')
const { paths, replacePath, preName } = require('../utils')

/**
 * craete must config
 * @param {import('../index.js')} mcs 
 * @returns 
 */
module.exports = mcs => {
  return {
    // resetCache: true, // package body to build different projects
    // cacheStores: [], // concurrent build cache issues https://github.com/facebook/metro/issues/331
    transformer: mcs.hasDynamicImports ? { asyncRequireModulePath: paths.asyncRequireModulePath } : {},
    serializer: {
      // js with built-in App
      processModuleFilter: mcs.bundleOutputInfo.processModuleFilter,
      createModuleIdFactory: () => {
        const cacheMap = new Map()
        return absolutePath => {
          const moduleId = cacheMap.get(absolutePath)
          if (moduleId) return moduleId
          const relativePath = replacePath(absolutePath)
          if (mcs.isDllPath(absolutePath)) { // dll module
            const dllId = mcs.findDllModuleId(absolutePath)
            cacheMap.set(absolutePath, dllId)
            return dllId
          } else { // business module
            return mcs.options.createBusinessModuleId({ mcs, cacheMap, absolutePath, relativePath })
          }
        }
      },
      // Serializer
      async customSerializer (...args) {
        // build dllJosn pre section
        if (mcs.isBuildDllJson) {
          const preOutputPath = path.resolve(paths.outputDir, preName)
          const preContent = JSON.stringify(args[1].map(v => replacePath(v.path)), null, 2)
          await fse.writeFile(preOutputPath, preContent)
        }
        if (!mcs.isBuildDll) mcs.hooks.beforeCustomSerializer.call(...args)

        let bundle = ''
        if (mcs.hasDynamicImports && !mcs.isBuildDll) {
          bundle = await dynamicImports(mcs, ...args)
        } else {
          await fse.ensureDir(paths.outputDir)
          bundle = mcs.bundleToString(mcs.baseJSBundle(...args))
        }

        if (!mcs.isBuildDll) mcs.hooks.afterCustomSerializer.call(bundle)

        return bundle
      },
    },
  }
}
