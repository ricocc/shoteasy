module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'lib', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/prop-types': 0,
    'react/jsx-no-target-blank': 'off',
    // 本项目画布图层（View/Screenshot/ShapeLine/FrameBox 等）以命令式 LeaferJS 节点
    // effect 为主，依赖数组刻意保持窄依赖以控制节点重建时机；effect 内读取的 MobX
    // observable 由外层 observer 订阅重渲染触发，规则对此系统性误报，故关闭。
    'react-hooks/exhaustive-deps': 'off',
    // MobX observer() HOC 需注册为已知 HOC，规则才能识别具名 observer 组件导出。
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true, customHOCs: ['observer'] },
    ],
  },
}
