const fs = require('fs')
const busboy = require('busboy')

// 睡眠函数，模拟网络上传需要时间
exports.sleep = async function (ms) {
    if (typeof ms !== 'number') return
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, ms)
    })
}

// 判断文件是否存在 
exports.isFileExists = function (path) {
    return new Promise(resolve => {
        fs.access(path), fs.constants.F_OK, err => {
            resolve(err ? false : true)
        }
    })
}

/**
 * 写入文件函数
 * @param {String} path 需要写入的文件路径
 * @param {Blob | File | String} file 文件本体
 * @param {String} filename 文件名
 * @param {*} stream 文件流
 * @returns 
 */
exports.writeFile = function (path, file, stream) {
    return new Promise((resolve, reject) => {
        // STREAM TODO
        if (stream) { }

        return reject('123')
        fs.writeFile(path, file, err => {
            err ? reject(err) : resolve()
        })
    })
}

// 使用busboy插件解析处理网络请求传入的文件
exports.busboyParse = function (req) {
    const config = {
        headers: req.headers,
        limits: {
            fileSize: 100 * 1024 * 1024
        }
    }
    const bb = new multiparty.Form(config)
    return new Promise((resolve, reject) => {
        bb.on('file', (name, file, info) => {
            const { filename, encoding, mimeType } = info;
            console.log(
                `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
                filename,
                encoding,
                mimeType
            );
            file.on('data', (data) => {
                console.log(`File [${name}] got ${data.length} bytes`);
            }).on('close', () => {
                console.log(`File [${name}] done`);
            });
        });
        req.pipe(bb);
    }
    )

}