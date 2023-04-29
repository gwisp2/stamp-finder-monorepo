const path = require('path');

const Dotenv = require('dotenv-webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (_env, argv) => {
  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'build'),
      assetModuleFilename: 'static/media/[name].[contenthash][ext][query]',
      filename: 'static/js/[name].[contenthash].js',
      sourceMapFilename: '[file].map',
      clean: true,
    },
    devServer: {
      historyApiFallback: {
        rewrites: [
          { from: /^\/search/, to: '/index.html' },
          { from: /./, to: '/404.html' },
        ],
      },
    },
    devtool: argv.mode === 'development' ? 'eval-source-map' : false,
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'babel-loader',
        },
        {
          test: /\.js$/,
          enforce: 'pre',
          use: ['source-map-loader'],
        },
        {
          test: /\.(png|jpg|gif|svg)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    optimization: {
      splitChunks: {
        name: 'vendor',
        chunks: 'all',
      },
    },
    plugins: [
      new Dotenv({
        path: './.env',
        allowEmptyValues: true, // allow empty variables (e.g. `FOO=`) (treat it as empty string, rather than missing)
        defaults: true, // load '.env.defaults' as the default values if empty.
      }),
      new ForkTsCheckerWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash].css',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            globOptions: {
              ignore: ['**/data/**'],
            },
          },
        ],
      }),
      new HtmlWebpackPlugin({
        template: 'src/index.html',
      }),
    ],
  };
};
