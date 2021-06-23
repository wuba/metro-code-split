module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    semi: [1, 'never'],
    'prettier/prettier': 0, // prettier 只用作格式化
    'react-native/no-inline-styles': 0, // 可以使用内联样式
    // 'comma-dangle': [1, 'only-multiline'], // 尾随逗号 允许（但不要求）多行可加可不加 单行不允许
    // 'no-return-assign': 0, // 函数不应该返回赋值 仅仅是为了更简洁
    // 'react/prop-types': 0, // 有了ts以后 不强制使用prop-types来校验
    // '@typescript-eslint/ban-ts-ignore': 0, // 禁止使用 @ts-ignore
    // '@typescript-eslint/no-empty-function': 0, // 不允许空函数 noop 一些默认的空函数
    // '@typescript-eslint/explicit-function-return-type': 0, // 要求函数和类方法的显式返回类型 (有些 是可以使用类型推断 省略的)
    // '@typescript-eslint/no-explicit-any': 0, // 禁止使用该any类型
  },
}
