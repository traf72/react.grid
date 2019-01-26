const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== 'production'
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
    plugins: [
        new MiniCssExtractPlugin('../css/[name].css'),
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
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.(le|c)ss$/,
                use: [
                  devMode ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'
                ],
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
