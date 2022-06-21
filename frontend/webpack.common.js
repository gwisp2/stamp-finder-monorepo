const path = require('path');

const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = (env, argv) => {
    return {
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
                    test: /\.(png|jpg|gif|svg)$/i,
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
            })
        ]
    };
}