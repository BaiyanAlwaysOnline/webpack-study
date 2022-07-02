/**
 * webpack开发中间件
 * 1. 真的的以监听模式启动webpack的编译
 * 2. 返回express的中间件,用来预览产出的文件
 * @param {*} compiler
 */

const MemoryFileSystem = require("memory-fs");
const fs = require("fs");
const middle = require("./middleware");
function webpackDevMiddleware(compiler) {
  // 执行webpack的watch命令，监听文件变化
  // ? 原理是fs.watchFile
  /**
   * 执行webpack打包命令有两个
   * 1. compiler.run()  执行编译一次然后退出
   * 2. compiler.watch() 执行编译一次然后监听文件变化
   */
  compiler.watch({}, () => {
    console.log("监听到文件变化, webpack重写开始编译");
  });

  // ! 产出的文件并不是写在硬盘上了，为了提升性能，产出的文件放在内存中，所以磁盘上看不见
  // 把webpack的outputFileSystem改成memory-fs
  // const fs = (compiler.outputFileSystem = new MemoryFileSystem());
  return middle({
    fs,
    outputPath: compiler.options.output.path, // 写入目录的路径
  });
}

module.exports = webpackDevMiddleware;
