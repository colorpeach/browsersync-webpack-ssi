## browsersync-webpack-ssi

## 安装

```
npm install browsersync-webpack-ssi --save-dev
```

## 特性

在开发环境下，支持ssi的语法：

```html
<!--# include file="path" -->
<!--# include virtual="path" -->

<!--# set var="k" value="v" -->

<!--# echo var="n" default="default" -->

<!--# if expr="test" -->
<!--# elif expr="" -->
<!--# else -->
<!--# endif -->
```

特性同[node-ssi](https://github.com/yanni4night/node-ssi)

## 使用

需要结合`browsersync`和`webpack-dev-middleware`一起使用。

在`gulpfile.js`中配置如下

```js
const reallyWebpack = require('webpack');
const browserSync = require('browser-sync').create();
const webpackDevMiddleware = require('webpack-dev-middleware');
const browsersyncWebpackSsi = require('browsersync-webpack-ssi');

gulp.task('serve', () => {
    const webpackConfig = require('./webpack.config.dev.js');
    const compiler = reallyWebpack(webpackConfig);
    // 定义webpack-dev-middleware实体
    const webpackDevMiddlewareInstance = webpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        noInfo: false,
        stats: {
            colors: true,
            timings: true,
            chunks: false
        }
    });

    browserSync.init({
        server: path.join(__dirname, '../src/'),
        middleware: [
            // 中间件中传入webpack-dev-middleware实体，以及ssi配置
            // ssi配置查看：https://github.com/yanni4night/node-ssi
            browsersyncWebpackSsi(webpackDevMiddlewareInstance, {
                baseDir: path.join(__dirname, '../src/'),
                encoding: 'utf-8'
            }),
            webpackDevMiddlewareInstance
        ]
    });

    compiler.plugin('done', stats => {
        if (stats.hasErrors() || stats.hasWarnings()) {
            console.log(stats.toString());
            return;
        }
        browserSync.reload();
    });
});
```

如果需要结合`webpack-dev-server`使用，配置如下：

```
const server = new WebpackDevServer(compiler, {
	stats: {
		colors: true
	},
	setup: function(app, _this) {
		app.use(browsersyncWebpackSsi(_this.middleware, {
			baseDir: path.join(__dirname, '../src/'),
			encoding: 'utf-8'
		}));
	}
});
```

## 参数

* webpackDevMiddlewareInstance：传入webpack-dev-middleware实体
* options：同`node-ssi`参数，查看[https://github.com/yanni4night/node-ssi](https://github.com/yanni4night/node-ssi)

## 感谢

[node-ssi](https://github.com/yanni4night/node-ssi)

## license

MIT
