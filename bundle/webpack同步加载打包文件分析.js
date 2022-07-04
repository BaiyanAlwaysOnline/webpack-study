// 不管是commonjs还是esm，最后都编译成commonjs
// 如果原来是esm的话，就把export传给r方法处理一下，表示我这个模块之前是ESM的模块

// 为什么有很多require.n  .d  .r 的方法，为了减小代码体积
// 为什么 __webpack__require 类似这种的不简化，压缩混淆的时候，会简化， 但是属性不会

// common 加载 common
(() => {
  let modules = {
    // commonjs
    "./src/title.js": (module, exports, require) => {
      module.exports = "title";
    },
  };
  let cache = {};
  function require(moduleId) {
    if (cache[moduleId]) {
      return cache[moduleId].exports;
    }
    let module = (cache[moduleId] = {
      exports: {},
    });
    modules[moduleId].call(module.exports, module, module.exports, require);
    return module.exports;
  }
  (() => {
    let title = require("./src/title.js");
    console.log(title);
  })();
})();

// common 加载 ESM
(() => {
  let modules = {
    // ESM
    "./src/title.js": (module, exports, require) => {
      require.r(exports);

      const DEFAULT_EXPORT = "title";
      const age = "title_age";

      require.d(exports, {
        default: () => DEFAULT_EXPORT, // export default = 'title'
        age: () => age, // export const age = 'title_age'
      });
    },
  };

  let cache = {};
  function require(moduleId) {
    if (cache[moduleId]) {
      return cache[moduleId].exports;
    }
    let module = (cache[moduleId] = {
      exports: {},
    });
    modules[moduleId].call(module.exports, module, module.exports, require);
    return module.exports;
  }

  // require.r 增加标识符
  require.r = (exports) => {
    // Symbol.toStringTag是调用Object.prototype.toString.call() = '[object Module]'
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    Object.defineProperty(exports, "__esModule", { value: true });
  };

  // require.d
  require.d = (exports, definition) => {
    for (const key in definition) {
      Object.defineProperty(exports, key, { get: definition[key] });
    }
  };

  (() => {
    let title = require("./src/title.js");
    console.log(title);
  })();
})();

// ESM加载ESM
(() => {
  let modules = {
    // esm
    "./src/index.js": (module, exports, require) => {
      require.r(exports);
      let title = require("./src/title.js");
      console.log(title.default);
      console.log(title.age);
    },
    // esm
    "./src/title.js": (module, exports, require) => {
      require.r(exports);

      const DEFAULT_EXPORT = "title";
      const age = "title_age";

      require.d(exports, {
        default: () => DEFAULT_EXPORT, // export default = 'title'
        age: () => age, // export const age = 'title_age'
      });
    },
  };

  let cache = {};
  function require(moduleId) {
    if (cache[moduleId]) {
      return cache[moduleId].exports;
    }
    let module = (cache[moduleId] = {
      exports: {},
    });
    modules[moduleId].call(module.exports, module, module.exports, require);
    return module.exports;
  }

  // require.r 增加标识符
  require.r = (exports) => {
    // Symbol.toStringTag是调用Object.prototype.toString.call() = '[object Module]'
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    Object.defineProperty(exports, "__esModule", { value: true });
  };

  // require.d
  require.d = (exports, definition) => {
    for (const key in definition) {
      Object.defineProperty(exports, key, { get: definition[key] });
    }
  };

  (() => {
    // 和cm load es 的区别就是在modules中注册./src/index.js的模块，然后执行require
    require("./src/index.js");
  })();
})();

// ESM加载commonjs
(() => {
  let modules = {
    // esm
    "./src/index.js": (module, exports, require) => {
      /**
       * 源码 import title from "./src/title.js"
       * console.log(title)
       * console.log(title.age)
       */
      require.r(exports);

      let title = require("./src/title.js");
      let title_default = require.n(title); // require.n兼容性

      console.log(title_default());
      console.log(title.age);
    },
    // common
    "./src/title.js": (module, exports, require) => {
      module.exports = {
        title: "title",
        age: "title_age",
      };
    },
  };

  let cache = {};
  function require(moduleId) {
    if (cache[moduleId]) {
      return cache[moduleId].exports;
    }
    let module = (cache[moduleId] = {
      exports: {},
    });
    modules[moduleId].call(module.exports, module, module.exports, require);
    return module.exports;
  }

  // require.r 增加标识符
  require.r = (exports) => {
    // Symbol.toStringTag是调用Object.prototype.toString.call() = '[object Module]'
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    Object.defineProperty(exports, "__esModule", { value: true });
  };

  // require.d
  require.d = (exports, definition) => {
    for (const key in definition) {
      Object.defineProperty(exports, key, { get: definition[key] });
    }
  };

  require.n = (exports) => {
    return exports.__esModule ? () => exports.default : () => exports;
  };

  (() => {
    // 和cm load es 的区别就是在modules中注册./src/index.js的模块，然后执行require
    require("./src/index.js");
  })();
})();
