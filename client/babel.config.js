module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, modules: false }],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    'babel-plugin-styled-components',
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-syntax-jsx',  // <-- add this line
  ],
};
