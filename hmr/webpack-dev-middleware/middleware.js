/**
 *  ! 功能：express中间件，负责提供产出文件的预览，
 *  ! 原理：拦截HTTP请求，看看请求的是不是webpack打包出来的文件，如果是的话，从【内存】中读出来返回给客户端
 * @param {*}  fs 写入文件的系统 outputPath 写入路径
 * @returns
 */

const path = require("path");
const mime = require("mime");
function wrapper({ fs, outputPath }) {
  return (req, res, next) => {
    let url = req.url; // index.html
    if (url === "/") url = "/index.html";

    const filename = path.join(outputPath, url);

    try {
      // 读取文件的描述信息
      const stat = fs.statSync(filename);
      if (stat.isFile()) {
        const content = fs.readFileSync(filename);
        // 设置响应体
        res.setHeader("Content-type", mime.getType(filename));
        res.send(content);
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      // 找不到文件
      console.log(error);
      res.sendStatus(404);
    }
  };
}

module.exports = wrapper;
