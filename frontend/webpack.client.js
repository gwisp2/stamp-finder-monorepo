const path = require('path');
const common = require('./webpack.common');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
    const config = {
        ...common(env, argv),
        entry: './src/EntryClient.tsx',
        output: {
            path: path.resolve(__dirname, 'build-client'),
            assetModuleFilename: 'static/media/[name].[contenthash][ext][query]',
            filename: 'static/js/[name].[contenthash].js',
            sourceMapFilename: '[file].map',
            clean: true
        }
    };
    config.plugins = [
        ...config.plugins,
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
        })
    ];
    config.module.rules = [
        ...config.module.rules,        
        {
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, "css-loader"]
        }
    ];
    return config;
};
