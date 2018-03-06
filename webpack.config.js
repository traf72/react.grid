var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        'index': './js/src/index.js',
    },
    output: {
        path: path.resolve(__dirname, './bundles/js'),
        filename: '[name].bundle.js',
        libraryTarget: 'var',
        library: '[name]',
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin('common'),
        new ExtractTextPlugin('../css/[name].css'),
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: [/node_modules/, /libs/],
                loader: 'babel-loader',
                query: { presets: ['es2015', 'react'] },
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
