const fs = require('fs')
const path = require('path')

// 将异步回调的方式，写成async/await的同步调用方式
const promisify = require('util').promisify
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)

// 返给前端的html不使用字符串拼接方式，而是使用模板引擎进行编译获取
const Handlebars = require('handlebars')
const tplPath = path.join(__dirname, '../template/dir.tpl')
const source = fs.readFileSync(tplPath)
const template = Handlebars.compile(source.toString())


// 处理Content-Type
const mime = require('../helper/mime')
// 处理压缩
const compress = require('./compress')
// 处理range
const range = require('./range')
// 处理缓存 Cache-Control ETag
const isFresh = require('./cache')

module.exports = async function (req, res, config) {
  const url = req.url
  const filePath = path.join(config.root, url)
  try {
    const stats = await stat(filePath)

    if (stats.isFile()) {
      res.statusCode = 200
      // 处理Content-Type
      const contentType = mime(filePath)
      res.setHeader('Content-Type', contentType)

      // 处理浏览器缓存协商
      if(isFresh(stats, req, res)){
        res.statusCode = 304
        res.end()
        return
      }

      let rs
      // 处理Content-Range
      const { code, start, end } = range(stats.size, req, res)
      if (code === 200) {
        rs = fs.createReadStream(filePath)
      } else {
        rs = fs.createReadStream(filePath, {start, end})
      }
      // 对符合特定文件的进行压缩
      // 处理Content-Encoding
      // let rs = fs.createReadStream(filePath)
      if (filePath.match(config.compress)) {
        rs = compress(rs, req, res)
      }
      rs.pipe(res) // 压缩后比压缩前少了几B
      // fs.createReadStream(filePath).pipe(res) //未使用压缩
    } else if (stats.isDirectory()) {
      const files = await readdir(filePath)
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html')
      const dir = path.relative(config.root, filePath)

      // 处理模板引擎需要渲染的动态数据
      const data = {
        title: path.basename(filePath), //anydoor
        dir: dir ? `/${dir}` : '',
        files: files.map(file => {
          return {
            file,
            icon: mime(file)
          }
        })
      }
      res.end(template(data))
      // res.end(files.join(','))
    }
  } catch (error) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain')
    res.end(`${filePath} is not a directory or file`)
  }
}
