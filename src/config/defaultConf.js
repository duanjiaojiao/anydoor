module.exports = {
  hostname: '127.0.0.1',
  port: 3000,
  root: process.cwd(), // node命令执行的文件路径
  compress: /\.(html|js|css|md)/,
  cache: {
    maxAge: 600,
    expires: true,
    cacheControl: true,
    lastModified: true,
    eTag: true
  }
}
