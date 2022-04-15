const path = require('path');
const common = require('./webpack.common');

module.exports = (env, argv) => {
    const config = {
        ...common(env, argv),
        entry: './src/EntryServer.tsx',
        target: 'node',
        output: {
            path: path.resolve(__dirname, 'build-server'),
            assetModuleFilename: 'static/media/[name].[contenthash][ext][query]',
            filename: 'generate.js',
            sourceMapFilename: '[file].map',
            clean: true
        }
    };    
    config.module.rules = [
        ...config.module.rules,        
        {
            test: /\.css$/i,
            use: "null-loader"
        }
    ];
    return config;
};