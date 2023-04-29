const path = require('path');

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (_env, argv) => {
  return {
    entry: './src/entrypoint.tsx',
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
      new ForkTsCheckerWebpackPlugin(),
      new ESLintPlugin({ extensions: ['ts', 'tsx'] }),
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
