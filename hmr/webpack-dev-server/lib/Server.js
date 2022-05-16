const express = require("express");
const http = require("http");
const webpackDevMiddleware = require("../../webpack-dev-middleware");
const updateComplier = require("./utils/updateComplier");

class Server {
  constructor(complier, devServerOptions) {
    this.complier = complier;
    this.devServerOptions = devServerOptions;
    // 更新complier，给用户配置的entry入口增加两个文件
    updateComplier(complier);
    this.setupHooks();
    this.setupApp();
    this.routes();
    this.setupDevMiddleware();
    this.createServer();
  }

  setupApp() {
    this.app = express();
  }

  // 监听编译成功的事件
  setupHooks() {
    // stats: 编译成功后的成功描述（modules, chunks, files, assets, entries）
    this.complier.hooks.done.tap("wds", (stats) => {
      console.log("一次完整编译完成 hooks.done", stats.hash);
      this._stats = stats;
    });
  }

  // 开始启动编译
  setupDevMiddleware() {
    this.middleware = webpackDevMiddleware(this.complier);
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

  listen(port, hostname, cb) {
    this.server.listen(port, hostname, cb);
  }
}

module.exports = Server;
