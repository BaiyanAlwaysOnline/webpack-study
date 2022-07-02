const express = require("express");
const http = require("http");
const webpackDevMiddleware = require("../../webpack-dev-middleware");
const updateCompiler = require("./utils/updateCompiler");
const { Server: WebSocketServer } = require("socket.io");

class Server {
  constructor(compiler, devServerOptions) {
    this.compiler = compiler;
    this.devServerOptions = devServerOptions;
    this.sockets = [];
    // 更新compiler，给用户配置的entry入口增加两个文件
    updateCompiler(compiler);
    this.setupHooks();
    this.setupApp();
    this.routes();
    this.setupDevMiddleware();
    this.createServer();
    this.createWebSocketServer();
  }

  setupApp() {
    this.app = express();
  }

  // 监听编译成功的事件
  setupHooks() {
    // stats: 编译成功后的成功描述（modules, chunks, files, assets, entries）
    this.compiler.hooks.done.tap("wds", (stats) => {
      console.log("一次完整编译完成 hooks.done", stats.hash);
      // 每次编译完成要广播通知
      this.sockets.forEach((socket) => {
        socket.emit("hash", stats.hash);
        socket.emit("ok");
      });
      this._stats = stats;
    });
  }

  // 开始启动编译
  setupDevMiddleware() {
    this.middleware = webpackDevMiddleware(this.compiler);
    this.app.use(this.middleware);
  }

  routes() {
    const contentBase = this.devServerOptions.contentBase;
    if (contentBase) {
      // express服务静态文件根
      this.app.use(express.static(contentBase));
    }
  }

  createServer() {
    this.server = http.createServer(this.app);
  }

  createWebSocketServer() {
    // ! 连接socket服务要握手，是通过HTTP服务建立的连接
    const io = new WebSocketServer(this.server);
    io.on("connection", (socket) => {
      console.log("a user connected");

      this.sockets.push(socket);

      // 断开连接
      socket.on("disconnect", () => {
        this.sockets = this.sockets.filter((s) => s !== socket);
      });

      if (this._stats) {
        // 说明客户端连进来socket服务的的时候已经编译好了文件
        socket.emit("hash", this._stats.hash);
        socket.emit("ok");
      }
    });
  }

  listen(port, hostname, cb) {
    this.server.listen(port, hostname, cb);
  }
}

module.exports = Server;
