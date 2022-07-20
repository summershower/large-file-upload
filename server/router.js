const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { isFileExists, writeFile, sleep } = require('./utils')


/**
 * 单文件上传，基于FormData格式，不判断文件hash值，不判断文件名，直接写入
 */
router.post('/upload_single', async (req, res) => {
    try {
        // 创建busboy示例
        const bb = new busboy({
            headers: req.headers,
            limits: {
                fileSize: 100 * 1024 * 1024
            }
        })
        // 流式处理文件
        bb.on('file', (name, file, info) => {
            const { filename, encoding, mimeType } = info;
            const writeStream = fs.createWriteStream('./upload/' + filename)
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
                    path: path.join(__dirname + '/upload/' + filename)
                })
            });
        });
        req.pipe(bb);

    } catch (err) {
        res.send({
            code: -1,
            codeText: err
        })
    }
})

/**
 * 单文件上传，基于FormData格式，不判断文件hash值，但判断文件名，有重名文件不会写入
 */
router.post('/upload_single_name', async (req, res) => {
    try {
        const isExists = await isFileExists(path);
        if (isExists) {
            return res.send({
                code: 0,
                message: '文件已存在',
                filename: filename,
                path: path.join(__dirname)
            })
        } else {
            await writeFile()
            res.send({
                code: 0,
                message: '上传成功',
                filename: filename,
                path: path.join(__dirname)
            })
        }

    } catch (err) {
        res.send({
            code: -1,
            codeText: err
        })
    }
})

module.exports = router