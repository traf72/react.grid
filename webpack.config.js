const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        'index': './assets/src/index.js',
    },
    output: {
        path: path.resolve(__dirname, './bundles/js'),
        filename: '[name].bundle.js',
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /\.js/,
                    name: 'common',
                    chunks: 'all',
                }
            }
        },
    },
    plugins: [
        new ExtractTextPlugin('../css/[name].css'),
        new CopyWebpackPlugin([
            {
                from: './node_modules/bootstrap/dist/css/*.min.css',
                to: '../css/bootstrap/css/[name].[ext]',
            },
            {
                from: './node_modules/bootstrap/dist/fonts',
                to: '../css/bootstrap/fonts',
            },
        ]),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/, /libs/],
                loader: 'babel-loader',
                query: { presets: ['env', 'react'] },
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract(['css-loader']),
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract(['css-loader', 'less-loader']),
            },
            {
                test: require.resolve('jquery'),
                loader: 'expose-loader?$!expose-loader?jQuery',
            },
            {
                test: /\.(jpe?g|png|gif)$/i, loader: 'file-loader'
            },
        ],
    },
};
