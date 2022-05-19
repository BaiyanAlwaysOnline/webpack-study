/**
 * 开启了热更新，此文件会被自动写入到webpack.config.entry
 */

console.log("来自webpack-dev-server/client/index.js");

const hotEmitter = require("../../webpack/hot/emitter.js");

const socket = io(); // 域名跟当前域名相同可以省略

let currentHash;

socket.on("hash", (hash) => {
  console.log("客户端收到hash");
  currentHash = hash;
});

socket.on("ok", (hash) => {
  console.log("客户端收到ok");
  reloadApp();
});

function reloadApp() {
  hotEmitter.emit("webpackHotUpdate", currentHash);
}
