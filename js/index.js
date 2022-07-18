function readBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            resolve(event.target.result)
        }
        // reader.onerror = (reason) => {
        //     reject(reason)
        // }
    })
}
function readBuffer(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (event) => {
            const buffer = event.target.result
            const hashName = new SparkMD5.ArrayBuffer().append(buffer).end()
            const suffix = /\.([a-zA-Z0-9]+)$/.exec(file.name)[1]
            resolve({
                filename: hashName + '.' + suffix
            })
        }
        // reader.onerror = (reason) => {
        //     reject(reason)
        // }
    })
}

//  FormData格式进行单文件上传
(function () {
    const container = document.querySelector('#upload1');
    const input = container.querySelector('input');
    const selectBtn = container.querySelector('.btn-select-file');
    const uploadBtn = container.querySelector('.btn-upload');
    const ul = container.querySelector('.file-list');
    let _file = null;
    selectBtn.addEventListener('click', () => {
        if (selectBtn.classList.contains('loading')) return
        input.click()
    })

    // 文件input控件change事件，可以校验文件大小和类型
    input.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return
        const { type, size, name } = file
        console.log(type, size, name);

        // 可以限制上传文件格式
        // if (!/png|jpg|jpeg/i.test(name)) {
        //     return alert('只能选择图片格式')
        // }

        // 可以限制上传文件大小
        // if(size> 1024*1024*10) {
        //     return alert('文件过大')
        // }
        _file = file;
        ul.classList.remove('hidden');
        ul.innerHTML = `<li>${name}<span class='remove'>移除</span></li>`
    })

    // 移除按钮事件委托到父组件上
    ul.addEventListener('click', (event) => {
        if (event.target.className === 'remove') {
            if (uploadBtn.classList.contains('loading')) return
            reset()
        }
    })

    // 上传按钮按钮事件
    uploadBtn.addEventListener('click', () => {
        if (uploadBtn.classList.contains('loading')) return
        if (!_file) return alert('没有选中文件')
        const formData = new FormData();
        // formData具体字段名需要跟后端协商
        formData.append('file', _file);
        formData.append('filename', _file.name);
        loading()
        uploadAxios.post('/upload_single', formData).then((res) => {
            if (+res.code === 0) {
                alert('上传成功')
            } else {
                alert('上传失败')
                return Promise.reject(res.codeText)
            }
        }).catch(e => {
            alert(e)
        }).finally(() => {
            reset()
        });
    })
    function loading() {
        selectBtn.classList.add('loading')
        uploadBtn.classList.add('loading')
    }
    function reset() {
        _file = null;
        input.file = null;
        ul.innerHTML = '';
        ul.classList.add('hidden')
        selectBtn.classList.remove('loading')
        uploadBtn.classList.remove('loading')

    }

})();

//  Base64格式进行单图片上传
(function () {
    const container = document.querySelector('#upload2');
    const input = container.querySelector('input');
    const selectBtn = container.querySelector('.btn-select-file');
    const uploadBtn = container.querySelector('.btn-upload');
    const ul = container.querySelector('.file-list');
    let _file = null;
    selectBtn.addEventListener('click', () => {
        if (selectBtn.classList.contains('loading')) return
        input.click()
    })


    // 文件input控件change事件，可以校验文件大小和类型
    input.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return
        const { type, size, name } = file
        console.log(type, size, name);

        if (!/png|jpg|jpeg|gif/i.test(type)) {
            return alert('只能选择图片格式')
        }

        if (size > 1024 * 1024 * 10) {
            return alert('文件过大')
        }
        _file = file;
        ul.classList.remove('hidden');

        // 可以使用BlobUrl实现图片预览（无需读取到JS中）
        // const imageUrl = URL.createObjectURL(_file)
        // ul.innerHTML = `<li><image src="${imageUrl}" style="width:100px;height:100px;object-fit:contain"/><span class='remove'>移除</span></li>`

        // 也可以使用FileReader读取成Base64
        const imageUrl = await readBase64(_file)
        ul.innerHTML = `<li><image src="${imageUrl}" style="width:100px;height:100px;object-fit:contain"/><span class='remove'>移除</span></li>`


    })

    // 移除按钮事件委托到父组件上
    ul.addEventListener('click', (event) => {
        if (event.target.className === 'remove') {
            if (uploadBtn.classList.contains('loading')) return
            reset()
        }
    })

    // 上传按钮按钮事件
    uploadBtn.addEventListener('click', async () => {
        if (uploadBtn.classList.contains('loading')) return
        if (!_file) return alert('没有选中文件')
        loading()
        const base64 = await readBase64(_file)
        uploadAxios.post('/upload_single_base64', {
            file: encodeURIComponent(base64),
            filename: _file.name
        }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then((res) => {
            if (+res.code === 0) {
                alert('上传成功')
            } else {
                alert('上传失败')
                return Promise.reject(res.codeText)
            }
        }).catch(e => {
            alert(e)
        }).finally(() => {
            reset()
        });
    })
    function loading() {
        selectBtn.classList.add('loading')
        uploadBtn.classList.add('loading')
    }
    function reset() {
        // 如果用了createObjectURL需要补上此行
        // URL.revokeObjectURL(_file)
        _file = null;
        input.file = null;
        ul.innerHTML = '';
        ul.classList.add('hidden')
        selectBtn.classList.remove('loading')
        uploadBtn.classList.remove('loading')
    }

})();

//  FormData上传单文件，携带哈希值
(function () {
    const container = document.querySelector('#upload3');
    const input = container.querySelector('input');
    const selectBtn = container.querySelector('.btn-select-file');
    const uploadBtn = container.querySelector('.btn-upload');
    const ul = container.querySelector('.file-list');
    let _file = null;
    selectBtn.addEventListener('click', () => {
        if (selectBtn.classList.contains('loading')) return
        input.click()
    })


    // 文件input控件change事件，可以校验文件大小和类型
    input.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return
        const { type, size, name } = file
        _file = file;
        ul.classList.remove('hidden');

        // 可以使用BlobUrl实现图片预览（无需读取到JS中）
        // const imageUrl = URL.createObjectURL(_file)
        // ul.innerHTML = `<li><image src="${imageUrl}" style="width:100px;height:100px;object-fit:contain"/><span class='remove'>移除</span></li>`

        // 也可以使用FileReader读取成Base64
        const imageUrl = await readBase64(_file)
        if (!/png|jpg|jpeg|gif/i.test(type)) {

        } else {
            ul.innerHTML = `<li><image src="${imageUrl}" style="width:100px;height:100px;object-fit:contain"/><span class='remove'>移除</span></li>`
        }
    })

    // 移除按钮事件委托到父组件上
    ul.addEventListener('click', (event) => {
        if (event.target.className === 'remove') {
            if (uploadBtn.classList.contains('loading')) return
            reset()
        }
    })

    // 上传按钮按钮事件
    uploadBtn.addEventListener('click', async () => {
        if (uploadBtn.classList.contains('loading')) return
        if (!_file) return alert('没有选中文件')
        loading()
        const formData = new FormData();
        const { filename } = await readBuffer(_file)
        formData.append('file', _file)
        formData.append('filename', filename)
        uploadAxios.post('/upload_single_name', formData).then((res) => {
            if (+res.code === 0) {
                alert('上传成功')
            } else {
                alert('上传失败')
                return Promise.reject(res.codeText)
            }
        }).catch(e => {
            alert(e)
        }).finally(() => {
            reset()
        });
    })
    function loading() {
        selectBtn.classList.add('loading')
        uploadBtn.classList.add('loading')
    }
    function reset() {
        // 如果用了createObjectURL需要补上此行
        // URL.revokeObjectURL(_file)
        _file = null;
        input.file = null;
        ul.innerHTML = '';
        ul.classList.add('hidden')
        selectBtn.classList.remove('loading')
        uploadBtn.classList.remove('loading')
    }

})();