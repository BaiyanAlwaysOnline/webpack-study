/**
 * loader.raw = true 的话 loader得到的是一个二进制的buffer
 * loader.raw = false 的话 loader得到的是一个utf8的字符串
 */

function loader(source) {
  // 1.根据规则生成一个文件名
  let filename = "[name]_[hash].[ext]";
  // 2.向输出目录写入一个文件 this.emitFile(filename)
  // 3.返回一个JS脚本
  return `module.exports = "${filename}"`;
}

loader.raw = true;

module.exports = loader;
