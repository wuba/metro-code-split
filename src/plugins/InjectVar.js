class InjectVar {
  register (mcs) {
    mcs.hooks.beforeCustomSerializer.tap('InjectVar', (entryPoint, prepend, graph, bundleOptions) => {
      for (const [key, value] of graph.dependencies) {
        // to entry file injection of global variables __APP__
        if (entryPoint === key) {
          for (const { data } of value.output) {
            // TODO Ast
            data.code = `var __APP__ = ${JSON.stringify({ publicPath: mcs.options.output.publicPath })};\n` + data.code
          }
          break
        }
      }
    })
  }
}

module.exports = InjectVar
