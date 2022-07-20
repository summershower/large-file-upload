const express = require('express')
const useRouter = require('./router')

// 创建express示例
const app = express()

// 监听端口
app.listen(9999, () => {
    console.log('上传服务器已开启，端口号9999');
})

// 引入路由
app.use(useRouter) 

// 静态资源中间件
app.use(express.static('./'))

// 错误处理中间件 
app.use((req, res) => {
    res.status(404).send('404 Not Found')
})