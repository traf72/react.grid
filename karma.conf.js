module.exports = function ( config ) {
	config.set( {
		basePath: './js',
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
			module: {
				loaders: [
				{
					test: /\.js$/,
					exclude: [/node_modules/, /libs/],
					loader: 'babel-loader',
					query: {
						presets: ['es2015']
					}
				}]
			},
		},
		webpackMiddleware: {noInfo: true},

		concurrency: Infinity
	} );
};
