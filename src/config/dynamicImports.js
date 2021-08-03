const path = require('path')
const { fse, getContentHash, babel: { parser, traverse, generate } } = require('general-tools')
const { paths, output, replacePath } = require('../utils')

const mainModuleId = 'main' // main moduleId flag

/**
 * dynamicImports
 * @param {import('../index.js')} mcs 
 * @param {*} entryPoint 
 * @param {*} prepend 
 * @param {*} graph 
 * @param {*} bundleOptions 
 * @returns 
 */
module.exports = async (mcs, entryPoint, prepend, graph, bundleOptions) => {
  const asyncFlag = mcs.options.dynamicImports.asyncFlag
  const minSize = mcs.options.dynamicImports.minSize

  const map = new Map([
    [
      mainModuleId, {
        moduleIds: new Set([]),
        modules: [],
      }
    ]
  ])
  const chunkModuleIdToHashMap = {} // record map info
  const outputChunkFns = [] // output chunk fns

  // finds if the parent ID is assigned to a chunk
  const findAllocationById = (fatheId) => {
    for (const [key, val] of map) {
      if (key === mainModuleId) continue
      if (val.moduleIds.has(fatheId)) return key
    }
    return null
  }

  // compute chunks
  for (const [key, value] of graph.dependencies) {
    // dll模块一定在主包中 不拆分 但是也必须走流程检测 否则异步引用dll模块 不会记录它的chunkModuleIdToHashMap
    const asyncTypes = [...value.inverseDependencies].map(absolutePath => {
      const relativePath = replacePath(absolutePath)
      const val = graph.dependencies.get(absolutePath)
      for (const [k, v] of val.dependencies) {
        if (v.absolutePath === key) {
          // 父级被拆分到某个chunk中 该模块同步引用
          const chunkModuleId = findAllocationById(relativePath)
          if (chunkModuleId && v.data.data.asyncType === null) return chunkModuleId
          return v.data.data.asyncType
        }
      }
    })

    // [] main

    // [null] main
    // [asyncFlag] only async add chunk
    // ['src/components/AsyncComA.tsx'] 异步模块中同步引用 从属与某个chunk

    // [null, asyncFlag] main
    // [asyncFlag, 'src/components/AsyncComA.tsx'] （理论应该拆分，本期拆到main中）
    // ['src/components/AsyncComA.tsx', 'src/components/AsyncComB.tsx'] 多个异步模块中同步引用相同的代码 （理论应该拆分，本期拆到main中）
    // [null, 'src/components/AsyncComA.tsx'] main

    // [null, asyncFlag, 'src/components/AsyncComA.tsx'] main

    const relativePath = replacePath(key)
    if (asyncTypes.length === 0 || asyncTypes.some(v => v === null)) { // 没有任何逆依赖 （如入口文件）
      map.get(mainModuleId).moduleIds.add(relativePath)
    } else if (asyncTypes.every(v => v === asyncFlag)) {
      map.set(relativePath, {
        moduleIds: new Set([relativePath]),
        modules: [],
      })
    } else if (asyncTypes.length === 1) {
      map.get(asyncTypes[0]).moduleIds.add(relativePath)
    } else {
      map.get(mainModuleId).moduleIds.add(relativePath)
    }
  }

  const { pre, post, modules } = mcs.baseJSBundle(entryPoint, prepend, graph, bundleOptions) // { pre, post, modules }

  const allocation = () => {
    for (const [key, val] of map) val.modules.length = 0 // clear modules
    for (const [moduleId, moduleCode] of modules) {
      for (const [key, val] of map) {
        if (val.moduleIds.has(moduleId)) {
          val.modules.push([moduleId, moduleCode])
          break
        }
      }
    }
  }

  // pre allocated
  allocation()

  for (const [key, val] of map) {
    if (key === mainModuleId) continue
    const totalByteLength = val.modules.reduce((b, [moduleId, moduleCode]) => b + Buffer.byteLength(moduleCode), 0)
    if (totalByteLength < minSize) { // non't break up
      const main = map.get(mainModuleId)
      main.moduleIds = new Set([...main.moduleIds, ...val.moduleIds])
      map.delete(key)
    }
  }

  // formal allocated
  allocation()

  map.size >= 2 && await fse.ensureDir(mcs.outputChunkDir)
  for (const [key, val] of map) {
    if (key === mainModuleId) continue
    const { code } = mcs.bundleToString({ pre: '', post: '', modules: val.modules })
    const hash = getContentHash(Buffer.from(code)).substr(0, mcs.options.output.chunkHashLength)
    if (chunkModuleIdToHashMap[key] === undefined) chunkModuleIdToHashMap[key] = {}
    chunkModuleIdToHashMap[key] = { ...chunkModuleIdToHashMap[key], hash }
    mcs.hooks.beforeOutputChunk.call({
      code,
      chunkModuleIdToHashMapVal: chunkModuleIdToHashMap[key],
      outputChunkFns,
    })
    outputChunkFns.push((async () => {
      const dir = path.resolve(mcs.outputChunkDir, `${hash}${output.fileSuffix}`)
      await fse.writeFile(dir, code)
      console.log(`info Writing chunk bundle output to: ${replacePath(dir)}`)
    })())
  }
  await Promise.all(outputChunkFns)

  // inject map info
  for (const arr of map.get(mainModuleId).modules) {
    if (arr[0] === replacePath(paths.chunkModuleIdToHashMapPath)) {
      const ast = parser.parse(arr[1])
      traverse(ast, {
        FunctionExpression(nodePath) {
          nodePath
            .get('body.body.0')
            .get('expression')
            .get('right')
            .replaceWithSourceString(JSON.stringify(chunkModuleIdToHashMap))
        }
      })
      const { code } = generate(ast, { minified: true })
      arr[1] = code
      break
    }
  }

  return mcs.bundleToString({ pre, post, modules: map.get(mainModuleId).modules })
}
