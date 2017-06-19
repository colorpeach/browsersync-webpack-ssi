const path = require('path');
const fs = require('fs');
const SSI = require('node-ssi');

/**
 * 返回处理html的中间件
 * @param  {[type]} webpackDevMiddlewareInstance [description]
 * @param  {[type]} options                      [description]
 * @return {[type]}                              [description]
 */
module.exports = function (webpackDevMiddlewareInstance, options) {
    const ssi = new SSI(options);

    return (req, res, next) => {
        webpackDevMiddlewareInstance.waitUntilValid(() => {
            const webpackFs = webpackDevMiddlewareInstance.fileSystem;
            let filename = webpackDevMiddlewareInstance.getFilenameFromUrl(req.url);
            let stat = null;
            let fileContent = void 0;

            try {
                stat = webpackFs.statSync(filename);
            } catch (e) {
                return next();
            }

            // 如果访问的是目录，将文件名接上index.html
            if (stat.isDirectory()) {
                filename = path.join(filename, 'index.html');
            }

            if (filename && filename.match(/\.html$/)) {
                // 先尝试从webpackdevmiddleware中读取文内容
                try {
                    fileContent = webpackFs.readFileSync(filename).toString();
                } catch (e) {
                    return next();
                }

                if (fileContent === void 0) {
                    // 如果webpackdevmiddleware中无法读取文件
                    // 再尝试从本地读取文件内容
                    try {
                        fileContent = fs.readFileSync(filename, { encoding: 'utf8' });
                    } catch (e) {
                        return next();
                    }
                }

                ssi.compile(fileContent, (err, content) => {
                    if (err) {
                        console.error(err);
                        return next();
                    }
                    res.statusCode = 200;
                    res.send ? res.send(content) : res.end(content);
                });
            } else {
                next();
            }
        });
    };
};
