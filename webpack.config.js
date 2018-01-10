const path = require('path');
const webpack = require('webpack');

const debug = {
  entry: './src/lib/index.js',

  output: {
    filename: 'stormjs.debug.js',
    path: path.resolve(__dirname, 'dist/standalone'),
    library: 'StormJS',
    libraryTarget: 'umd'
  },

  resolve: {
    alias: {
      './stormlib.debug.js': path.resolve(__dirname, 'build/stormlib.debug.js')
    }
  },

  module: {
    noParse: /stormlib\.debug\.js/
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    })
  ]
};

const release = {
  entry: './src/lib/index.js',

  output: {
    filename: 'stormjs.release.js',
    path: path.resolve(__dirname, 'dist/standalone'),
    library: 'StormJS',
    libraryTarget: 'umd'
  },

  resolve: {
    alias: {
      './stormlib.release.js': path.resolve(__dirname, 'build/stormlib.release.js')
    }
  },

  module: {
    noParse: /stormlib\.release\.js/
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  ]
};

module.exports = [
  debug,
  release
];
