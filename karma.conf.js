module.exports = function (config) {
    config.set( {
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
            '../node_modules/babel-polyfill/dist/polyfill.min.js',
            './test/**/*.spec.js'
        ],
        
        preprocessors: {
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
                    query: {
                        presets: ['env']
                    }
                }]
            },
        },
        webpackMiddleware: {noInfo: true},
        
        concurrency: Infinity
    });
};
