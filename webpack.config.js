const path = require('path');

module.exports = {
  entry: ['babel-polyfill', './src/index.js'],
  devtool: 'source-map',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'md-graphql-spec',
    libraryTarget: 'commonjs2'
  },
  target: "node",
  optimization: {
  // We no not want to minimize our code.
  minimize: false
},
};
