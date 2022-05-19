(() => {
  // 最新的hash
  let currentHash;
  // 上一次的hash
  let lastHash;
  /**
   * 热更新步骤：
   * 1.下载hot-update.json
   * 2.下载hot-update.js
   *
   */
  function hotCheck() {
    console.log("hotCheck");
    hotDownloadManifest()
      .then((update) => {
        // {"c":["main"],"r":[],"m":[]} c里面存放的是模块id
        update.c.forEach((chunkId) => hotDownloadUpdateChunk(chunkId));
        // 执行完成后，更新hash
        lastHash = currentHash;
      })
      .catch(() => {
        // 下载失败则刷新
        // window.location.reload();
      });
  }

  function hotDownloadManifest() {
    return fetch(`main.${lastHash}.hot-update.json`).then((res) => res.json());
  }

  // 创建script标签去下载，jsonp的原理
  function hotDownloadUpdateChunk(chunkId) {
    const script = document.createElement("script");
    script.src = `${chunkId}.${lastHash}.hot-update.js`;
    // ! 下载的这个script会执行 self["webpackHotUpdatehmr"]的这个方法
    /**
     * `${moduleId}.${lastHash}.hot-update.js`
     * self["webpackHotUpdatehmr"]("main",{
          "./src/content.js":
          ((module) => {
          module.exports = "content";
          x })
          },
     */
    document.head.appendChild(script);
  }

  window.self["webpackHotUpdatehmr"] = (chunkId, modules) => {
    hotAddUpdateChunks(chunkId, modules);
  };

  let hotUpdate = {}; // 将要更新的模块
  function hotAddUpdateChunks(chunkId, modules) {
    for (let moduleId in modules) {
      // 更新模块
      hotUpdate[moduleId] = __webpack_modules__[moduleId] = modules[moduleId];
    }
    hotApply();
  }

  // 应用更新
  function hotApply() {
    for (let moduleId in hotUpdate) {
      /**
       * 更新的步骤
       * 1.拿到老的模块，并从缓存中删除（防止require的时候读缓存）
       * 2.让模块的父亲们调用更新方法
       */
      let oldModule = __webpack_module_cache__[moduleId];
      Reflect.deleteProperty(__webpack_module_cache__, moduleId);
      if (oldModule.parents && oldModule.parents.size > 0) {
        oldModule.parents.forEach((father) => {
          father.hot.check(moduleId);
        });
      }
    }
  }

  // webpackBootstrap
  var __webpack_modules__ = {
    "./src/content.js": (module) => {
      module.exports = "content12";
    },

    "./src/index.js": (
      module,
      __unused_webpack_exports,
      __webpack_require__
    ) => {
      // /* module decorator */ module = __webpack_require__.nmd(module);
      const render = () => {
        const title = __webpack_require__(/*! ./title.js */ "./src/title.js");
        const content = __webpack_require__(
          /*! ./content.js */ "./src/content.js"
        );
        root.innerText = title + content;
      };

      render();
      console.log(module);

      if (module.hot) {
        module.hot.accept(["./src/title.js"], render);
      }
    },

    "./src/title.js": (module) => {
      module.exports = "title1";
    },

    "./webpack/hot/emitter.js": (module) => {
      const eventEmitter = {
        listeners: {},
        on(type, fn) {
          this.listeners[type] = fn;
        },
        emit(type, ...args) {
          this.listeners[type](...args);
        },
      };

      module.exports = eventEmitter;
    },
  };
  // The module cache
  var __webpack_module_cache__ = {};

  // The require function
  function __webpack_require__(moduleId) {
    // Check if module is in cache
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    // Create a new module (and put it into the cache)
    var module = (__webpack_module_cache__[moduleId] = {
      id: moduleId,
      loaded: false,
      exports: {},
      hot: hotCreateModule(), // 每个模块都有hot属性，来注册热更新回调
      parents: new Set(), // 所有引用当前模块的模块
      children: new Set(), //当前模块所有引用的模块
    });

    // Execute the module function
    __webpack_modules__[moduleId](
      module,
      module.exports,
      hotCreateRequire(moduleId)
    );

    // Flag the module as loaded
    module.loaded = true;

    // Return the exports of the module
    return module.exports;
  }

  function hotCreateModule() {
    let hot = {
      _acceptedDependencies: {},
      accept(deps, cb) {
        deps.forEach((dep) => {
          hot._acceptedDependencies[dep] = cb;
        });
      },
      // 执行回调进行热更新
      check: (moduleId) => {
        hot._acceptedDependencies[moduleId]?.();
      },
    };
    return hot;
  }

  // HMR时，使用这个创建require方法，代替原来的require
  // ! 创建模块之间的父子关系  ？ 什么作用呢，还未知
  function hotCreateRequire(parentModuleId) {
    const parentModule = __webpack_module_cache__[parentModuleId];
    if (!parentModule) return __webpack_require__;
    // carry函数，缓存parentModuleId
    function hotRequire(childModuleId) {
      parentModule.children.add(childModuleId);
      const childExports = __webpack_require__(childModuleId);
      const childModule = __webpack_module_cache__[childModuleId];
      childModule.parents.add(parentModule);
      return childExports;
    }
    return hotRequire;
  }

  /************************************************************************/
  /* webpack/runtime/node module decorator */
  // (() => {
  //   __webpack_require__.nmd = (module) => {
  //     module.paths = [];
  //     if (!module.children) module.children = [];
  //     return module;
  //   };
  // })();

  /************************************************************************/

  (() => {
    console.log("来自webpack/hot/dev-server.js");

    const hotEmitter = __webpack_require__("./webpack/hot/emitter.js");

    hotEmitter.on("webpackHotUpdate", (newHash) => {
      console.log("devServer收到最新的hash", newHash);
      // 如果是首次编译，什么都不做
      if (!lastHash) {
        console.log("首次编译，hash为", newHash);
        lastHash = newHash;
        return;
      }
      currentHash = newHash;
      hotCheck();
    });
  })();

  (() => {
    console.log("来自webpack-dev-server/client/index.js");

    const hotEmitter = __webpack_require__("./webpack/hot/emitter.js");

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
  })();

  // startup
  // Load entry module and return exports
  // This entry module is referenced by other modules so it can't be inlined
  var __webpack_exports__ =
    hotCreateRequire("./src/index.js")("./src/index.js");
})();
