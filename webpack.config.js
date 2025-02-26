/* eslint-disable */
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require('path');

const devMode = process.env.NODE_ENV !== 'production';

cssLoaderOptions = [
    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
    'css-loader'
];

lessLoaderOptions = [...cssLoaderOptions, 'less-loader'];

module.exports = {
    mode: 'development',
    entry: './assets/src/index.js',
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: '[name].js',
    },
    plugins: [
        new CleanWebpackPlugin(['dist/*']),
        new HtmlWebpackPlugin({ template: './assets/index.html' }),
        new MiniCssExtractPlugin({ filename: `[name].css` }),
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: [/node_modules/, /libs/],
                use: ['babel-loader', 'eslint-loader'],
            },
            {
                test: /\.css$/,
                use: cssLoaderOptions,
            },
            {
                test: /\.less$/,
                use: lessLoaderOptions,
            },
            {
                test: /\.(jpe?g|png|gif|ttf|woff2?|eot|svg)$/i,
                use: 'file-loader',
            },
        ],
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /node_modules/,
                    name: 'vendor',
                    chunks: 'all',
                },
            }
        }
    },
    stats: {
        warnings: false,
    },
};
