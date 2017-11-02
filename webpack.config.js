const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const NodemonPlugin = require('nodemon-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

// List of styles to put into vendor.css
const vendorStyles = [
  require.resolve('bootstrap/dist/css/bootstrap.css'),
  require.resolve('font-awesome/css/font-awesome.css'),
  require.resolve('react-bootstrap-typeahead/css/Typeahead.css'),
];

// Plugins to use for each environment
const plugins = {
  any: [
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new ExtractTextPlugin('[name].css'),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$|\.svg$|\.eot$|\.ttf$/,
      threshold: 10240,
      minRatio: 0.8
    }),
    new webpack.DefinePlugin({
      'process.env': {
        IN_BROWSER: 'true',
      },
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
  ],
  development: [
    new NodemonPlugin({
      script: 'src/server.js',
      watch: [path.resolve('src')],
    }),
  ],
  test: []
};

const nodeModulesPath = process.env.NODE_PATH || 'node_modules';

module.exports = {
  entry: {
    app: ['./src/client.js']
      .concat(glob.sync(path.join(__dirname, 'src', 'styles', '**/*.css'))),
    vendor: vendorStyles
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: plugins.any.concat(plugins[process.env.NODE_ENV] || []),
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
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
    ],
  },
  resolveLoader: {
    modules: [nodeModulesPath],
  },
  resolve: {
    modules: [nodeModulesPath],
  }
};
