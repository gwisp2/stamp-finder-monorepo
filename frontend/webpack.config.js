const path = require('path');

const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
    return {
        entry: './src/index.tsx',
        devtool: argv.mode === 'development' ? 'eval-source-map' : 'source-map',
        resolve: {
            modules: [path.resolve(__dirname, 'src'), 'node_modules'],
            extensions: [".ts", ".tsx", ".js"]
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'babel-loader',
                },
                {
                    test: /\.css$/i,
                    use: [MiniCssExtractPlugin.loader, "css-loader"],
                },
                {
                    test: /\.(png|jpg|gif)$/i,
                    type: 'asset/resource'
                },
                {
                    test: /\.js$/,
                    enforce: "pre",
                    use: ["source-map-loader"],
                }
            ],
        },
        plugins: [
            new ForkTsCheckerWebpackPlugin(),
            new ESLintPlugin({ extensions: ["ts", "tsx"] }),
            new webpack.EnvironmentPlugin({
                REACT_APP_GA_ID: null,
                REACT_APP_DATA_URL: null,
                REACT_APP_CALL_URL: null
            }),
            new MiniCssExtractPlugin({
                filename: "static/css/[name].[contenthash].css"
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: 'public',
                        globOptions: {
                            ignore: ["**/index.html"]
                        },
                    }
                ]
            }),
            new HtmlWebpackPlugin({
                template: 'public/index.html'
            }),
        ],
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'build'),
            assetModuleFilename: 'static/media/[name].[contenthash][ext][query]',
            filename: 'static/js/[name].[contenthash].js',
            sourceMapFilename: '[file].map',
            clean: true
        }
    };
};