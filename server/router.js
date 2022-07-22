const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { isFileExists, writeFile, sleep, busboyHandleFile } = require('./utils')


/**
 * 单文件上传，基于FormData格式，不判断文件hash值，不判断文件名，直接覆盖写入
 */
router.post('/upload_single', async (req, res) => {
    try {
        busboyHandleFile(req, res)
    } catch (err) {
        console.log(err);
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
        busboyHandleFile(req, res, true)
    } catch (err) {
        res.send({
            code: -1,
            codeText: err
        })
    }
})

module.exports = router