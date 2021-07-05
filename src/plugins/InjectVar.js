const { babel: { t, template, generate } } = require('general-tools')

class InjectVar {
  register (mcs) {
    mcs.hooks.beforeCustomSerializer.tap('InjectVar', (entryPoint, prepend, graph, bundleOptions) => {
      for (const [key, value] of graph.dependencies) {
        // to entry file injection of global variables __APP__
        if (entryPoint === key) {
          for (const { data } of value.output) {
            const ast = template(`var %%globalInlayVarName%% = { publicPath: %%publicPath%% }`)({
              globalInlayVarName: mcs.options.globalInlayVarName,
              publicPath: t.stringLiteral(mcs.options.output.publicPath)
            })

            const { code } = generate(ast, { minified: true })
            data.code = code + '\n' + data.code
          }
          break
        }
      }
    })
  }
}

module.exports = InjectVar
