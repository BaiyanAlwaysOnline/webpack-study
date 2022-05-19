/**
 * 开启了热更新，此文件会被自动写入到webpack.config.entry
 */

console.log("来自webpack/hot/dev-server.js");

const hotEmitter = require("../../webpack/hot/emitter.js");

hotEmitter.on("webpackHotUpdate", (currentHash) => {
  console.log("devServer收到最新的hash", currentHash);
  // TODO 执行真正的热更新检查
});
