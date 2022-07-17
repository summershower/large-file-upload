// 先创建一个Axios的副本实例，避免影响到项目其他axios实例
let uploadAxios = axios.create()
// 配置Axios基础设置
uploadAxios.defaults.baseURL = 'http://127.0.0.1:8888'
uploadAxios.defaults.headers['Content-Type'] = 'multipart/form-data'
uploadAxios.defaults.transformRequest = (data, headers) => {
    // 当手动传入请求类型为form-urlencoded时，需要将请求对象转换为字符串类型
    const contentType = headers['Content-Type']
    if (contentType === 'application/x-www-form-urlencoded') return Qs.stringify(data)
    return data
}
// 响应拦截器 ，统一处理返回数据
uploadAxios.interceptors.response.use(response => {
    return response.data
}, reason => {
    alert('发生错误：' + reason)
    return Promise.reject(reason)
})