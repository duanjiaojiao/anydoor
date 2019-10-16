const http = require('http')
const chalk = require('chalk')

const conf = require('./config/defaultConf')
const route = require('./helper/route')
const openUrl = require('./helper/open')

// const server = http.createServer((req, res) => {
//   const url = req.url
//   const filePath = path.join(conf.root, url)
//   fs.stat(filePath, (err, stats) => {
//     if (err) {
//       res.statusCode = 404
//       res.setHeader('Content-Type', 'text/plain')
//       res.end(`${filePath} is not a directory or file`)
//       return
//     }
//     if (stats.isFile()) {
//       res.statusCode = 200
//       res.setHeader('Content-Type', 'text/plain')
//       // fs.readFile(filePath, (err, data) => {
//       //   res.end(data)
//       // })
//       fs.createReadStream(filePath).pipe(res) //用流的方式读取更快
//     } else if (stats.isDirectory()) {
//       fs.readdir(filePath, (err, files) => {
//         res.statusCode = 200
//         res.setHeader('Content-Type', 'text/plain')
//         res.end(files.join(','))
//       })
//     }
//   })
// })

// const server = http.createServer((req, res) => {
//   const url = req.url
//   const filePath = path.join(conf.root, url)
//   route(req, res, filePath)
// })

// server.listen(conf.port, conf.hostname, () => {
//   const addr = `http://${conf.hostname}:${conf.port}`
//   console.info(`Server started at ${chalk.green(addr)}`)
// })



class Server {
  constructor (config) {
    this.conf = Object.assign({}, conf, config)
  }

  start() {
    const server = http.createServer((req, res) => {
      route(req, res, this.conf)
    })

    server.listen(this.conf.port, this.conf.hostname, () => {
      const addr = `http://${this.conf.hostname}:${this.conf.port}`
      console.info(`Server started at ${chalk.green(addr)}`)
      openUrl(addr)
    })
  }
}

module.exports = Server
