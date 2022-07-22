const fs = require('fs')
const busboy = require('busboy')
const path = require('path')

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
function isFileExists(path) {
    return new Promise(resolve => {
        fs.access(path, fs.constants.F_OK, err => {
            resolve(err ? false : true)
        })
    })
}

/**
 * 使用busboy处理文件
 * @param {boolean} isJudgeFileExists 是否需要判断文件名是否存在
 * @param {string} directory 需要保存的文件夹
 */
exports.busboyHandleFile = function (req, res, isJudgeFileExists = false, directory = 'upload') {
    // 创建busboy示例
    const bb = busboy({
        headers: req.headers,
        limits: {
            fileSize: 100 * 1024 * 1024
        }
    })
    // 流式处理文件
    bb.on('file', async (name, file, info) => {
        const { filename, encoding, mimeType } = info;
        if (isJudgeFileExists) {
            const isExist = await isFileExists(`./${directory}/` + filename)
            console.log(isExist);
            if (isExist) {
                return res.send({
                    code: 0,
                    message: '文件已存在',
                    filename: filename,
                    path: path.join(__dirname, 'upload', filename)
                })
            }
        }
        const writeStream = fs.createWriteStream(`./${directory}/` + filename)
        console.log(
            `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
            filename,
            encoding,
            mimeType
        );
        file.on('data', (data) => {
            console.log(`File [${name}] got ${data.length} bytes`);
            writeStream.write(data);
        }).on('close', () => {
            console.log(`File [${name}] done`);
            writeStream.end();
            res.send({
                code: 0,
                message: '上传成功',
                filename: filename,
                path: path.join(__dirname + `/${directory}/` + filename)
            })
        });
    });
    req.pipe(bb)
}

/**
 * 写入文件函数
 * @param {String} path 需要写入的文件路径
 * @param {Blob | File | String} file 文件本体
 * @param {String} filename 文件名
 * @param {*} stream 文件流
 */
exports.writeFile = function (path, file, stream) {
    return new Promise((resolve, reject) => {
        if (stream) {
            // 流式写入文件


        } else {
            fs.writeFile(path, file, err => {
                err ? reject(err) : resolve()
            })
        }


    })
}
