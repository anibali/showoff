const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const NodemonPlugin = require('nodemon-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const AssetsManifestPlugin = require('webpack-assets-manifest');
const CleanObsoleteChunksPlugin = require('webpack-clean-obsolete-chunks');

// Plugins to use for each environment
const plugins = {
  any: [
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new ExtractTextPlugin('[name]-[contenthash].css'),
    new webpack.DefinePlugin({
      'process.env': {
        IN_BROWSER: 'true',
      },
    }),
    new webpack.HashedModuleIdsPlugin(),
    new AssetsManifestPlugin({
      publicPath: true,
    }),
  ],
  production: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/,
      cssProcessorOptions: { discardComments: { removeAll: true } }
    }),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$|\.svg$|\.eot$|\.ttf$/,
      threshold: 10240,
      minRatio: 0.8
    }),
  ],
  development: [
    new NodemonPlugin({
      script: 'src/server.js',
      watch: [path.resolve('src')],
    }),
    new CleanObsoleteChunksPlugin({ deep: true }),
  ],
  test: []
};

const nodeModulesPath = process.env.NODE_PATH || 'node_modules';

module.exports = {
  entry: {
    app: ['./src/client.js']
      .concat(glob.sync(path.join(__dirname, 'src', 'styles', '**/*.css'))),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]-[chunkhash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: '/assets/bundle/'
  },
  plugins: plugins.any.concat(plugins[process.env.NODE_ENV] || []),
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(icepick)\/).*/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              plugins: ['lodash'],
              presets: [
                ['env', {
                  modules: false,
                  useBuiltIns: 'entry',
                  targets: {
                    browsers: ['last 2 versions', 'ie >= 9', 'safari >= 7']
                  }
                }],
                'react'
              ],
            }
          },
        ]
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        })
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
        use: [
          { loader: 'url-loader', options: { limit: 10000 } },
        ]
      },
      {
        test: /\.js$/,
        loader: 'ify-loader'
      },
    ],
  },
  resolveLoader: {
    modules: [nodeModulesPath],
  },
  resolve: {
    modules: [nodeModulesPath],
  }
};
