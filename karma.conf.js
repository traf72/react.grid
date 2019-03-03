module.exports = function (config) {
    config.set({
        basePath: './assets',
        frameworks: ['mocha', 'chai'],
        reporters: ['mocha'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Firefox'],
        singleRun: false,

        files: [
            './src/polyfills.js',
            './test/**/*.spec.js'
        ],

        preprocessors: {
            './src/polyfills.js': ['webpack'],
            './test/**/*.spec.js': ['webpack']
        },

        webpack: {
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: [/node_modules/, /libs/],
                        loader: 'babel-loader',
                    },
                ]
            },
        },
        webpackMiddleware: {
            stats: 'errors-only',
        },

        concurrency: Infinity
    });
};
