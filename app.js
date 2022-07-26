const express = require('express');
const app = express();

const cors = require('cors')
app.use(cors())

app.use(express.urlencoded({ extended: false }))

//在路由之前封装res.cc函数
app.use((req, res, next) => {
    /* 
    status默认值为1.表示失败
    err的值可能是一个错误对象，也可能是一个错误的描述字符串 
     */
    res.cc = function (err, status = 1) {
        res.send({
            status,
            message: err instanceof Error ? err.message : err
        })
    }

    next()
})

//路由之前配置解析token的中间件
// 解析 token 的中间件
const { expressjwt: jwt } = require("express-jwt");
const config = require('./config')

// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
app.use(jwt({ secret: config.jwtSecretKey, algorithms: ["HS256"] }).unless({ path: [/^\/api\//] }))



// 导入并注册用户路由模块
const userRouter = require('./router/user');
app.use('/api', userRouter)

//导入并使用用户信息模块
const userinfoRouter = require('./router/userinfo')
app.use('/my', userinfoRouter)

// 导入并使用文章分类路由模块
const artCateRouter = require('./router/artcate')
// 为文章分类的路由挂载统一的访问前缀 /my/article
app.use('/my/article', artCateRouter)


// 导入并使用文章路由模块
const articleRouter = require('./router/article')
// 为文章的路由挂载统一的访问前缀 /my/article
app.use('/my/article', articleRouter)
// 托管静态资源文件
app.use('/uploads', express.static('./uploads'))

const joi = require('joi')

// 定义错误级别中间件
app.use(function (err, req, res, next) {
    // 数据验证失败
    if (err instanceof joi.ValidationError) return res.cc(err)
    if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
    // 未知错误
    res.cc(err)
})


app.listen(3007, () => {
    console.log('api server running at http://127.0.0.1:3007')
})