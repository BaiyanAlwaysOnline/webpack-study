const { SyncHook } = require("tapable");
const path = require("path");
const fs = require("fs");

// babel
const types = require("babel-types");
const parser = require("@babel/parser"); // 源代码转成AST抽象语法树
const traverse = require("@babel/traverse").default; // 遍历语法树
const generator = require("@babel/generator").default; // 把语法树重新生成代码

function toUnixPath(filePath) {
  return filePath.replace(/\\/g, path.posix.sep); // 不同系统的路径分隔符
}

//根目录，当前工作目录
let baseDir = toUnixPath(process.cwd());

class Compiler {
  constructor(options) {
    this.options = options;
    this.hooks = {
      run: new SyncHook(),
      done: new SyncHook(),
      emit: new SyncHook(),
    };
    this.entries = []; // 这个数组存放着所有的入口
    this.modules = []; // 这里存放着所有的模块
    this.chunks = []; // 代码块
    this.assets = {}; // 输出列表 存放着将要产出的资源文件
    this.files = []; // 表示本次编译的所有产出的文件名
  }

  run(cb) {
    // 开始编译
    this.hooks.run.call();
    // 开始编译
    let entry = {};
    if (typeof this.options.entry === "string") {
      entry.main = this.options.entry;
    } else {
      entry = this.options.entry;
    }
    // 5.根据配置中的entry找出入口文件,得到entry的绝对路径
    for (let entryName in entry) {
      let entryFilePath = toUnixPath(
        path.join(this.options.context, entry[entryName])
      );
      // 6.从入口文件出发,调用所有配置的Loader对模块进行编译
      let entryModule = this.buildModule(entryName, entryFilePath);
      // 7.根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk
      let chunk = {
        name: entryName,
        entryModule,
        modules: this.modules.filter((module) => module.name === entryName),
      };
      this.chunks.push(chunk);
      this.entries.push(chunk); // 也是入口代码块
    }
    this.chunks.forEach((chunk) => {
      //key文件名 值是打包后的内容
      let filename = this.options.output.filename.replace("[name]", chunk.name);
      this.assets[filename] = getSource(chunk);
    });
    this.hooks.emit.call();
    // 8.在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统
    this.files = Object.keys(this.assets); //['main.js']
    // 存放本次编译输出的目标文件路径
    for (let file in this.assets) {
      let targetPath = path.join(this.options.output.path, file); //page1.js page2.js
      fs.writeFileSync(targetPath, this.assets[file]);
    }
    // 完成编译
    this.hooks.done.call();

    cb(null, {
      toJson: () => {
        return {
          entries: this.entries,
          chunks: this.chunks,
          modules: this.modules,
          files: this.files,
          assets: this.assets,
        };
      },
    });
  }

  buildModule(name, modulePath) {
    // 6.1 读取原始源代码
    let originalSourceCode = fs.readFileSync(modulePath, "utf8");
    // 6.2 查找此模块对应的loader对代码进行转换
    let rules = this.options.module.rules;
    let loaders = [];
    for (let i = 0; i < rules.length; i++) {
      //正则匹配上了模块的路径
      if (rules[i].test.test(modulePath)) {
        loaders = [...loaders, ...rules[i].use];
      }
    }
    // 逆序执行 loaders=['logger1-loader.js','logger2-loader.js','logger3-loader.js','logger4-loader.js']
    for (let i = loaders.length - 1; i >= 0; i--) {
      let loader = loaders[i];
      originalSourceCode = require(loader)(originalSourceCode);
    }
    // originalSourceCode 此时已经是对应loader编译过的代码;

    // 模块ID  __webpack_modules_
    let moduleId = "./" + path.posix.relative(baseDir, modulePath);
    // 模块对象
    let module = { id: moduleId, dependencies: [], name };

    // 6.3 再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
    // 6.3.1 将源码生成AST语法树
    let astTree = parser.parse(originalSourceCode, { sourceType: "module" });
    // 6.3.2 遍历AST语法树
    // 遍历语法树，找出模块的依赖模块，并添加到module.dependencies中去；
    traverse(astTree, {
      CallExpression: ({ node }) => {
        if (node.callee.name === "require") {
          // 1.相对路径 2.相对当前模块
          // 2.绝对路径
          let moduleName = node.arguments[0].value;
          // 要判断一个moduleName绝对还是相对，相对路径才需要下面的处理
          // 获取路径所有的目录
          // User/boyan/desktop/flow/src
          let dirname = path.posix.dirname(modulePath);
          // User/boyan/desktop/flow/src/title
          let depModulePath = path.posix.join(dirname, moduleName);
          // 解析拓展名
          let extensions = this.options.resolve.extensions;
          // User/boyan/desktop/flow/src/title.js
          depModulePath = tryExtensions(
            depModulePath,
            extensions,
            moduleName,
            dirname
          );
          // 模块ID的问题 每个打包后的模块都会有一个moduleId
          // "./src/title.js"  depModulePath=/a/b/c  baseDir=/a/b relative=>c ./c
          let depModuleId = "./" + path.posix.relative(baseDir, depModulePath); // ./title =>  ./src/title.js
          // 修改抽象语法树
          node.arguments = [types.stringLiteral(depModuleId)];
          module.dependencies.push(depModulePath);
        }
      },
    });
    // 根据新的语法树生成新代码
    let { code } = generator(astTree);
    // 转换后的代码 module moduleId dependencies _source
    module._source = code;
    // 再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理
    module.dependencies.forEach((dependency) => {
      let dependencyModule = this.buildModule(name, dependency);
      this.modules.push(dependencyModule);
    });

    return module;
  }
}

function getSource(chunk) {
  return `
   (() => {
    var modules = {
      ${chunk.modules
        .map(
          (module) => `
          "${module.id}": (module,exports,require) => {
            ${module._source}
          }`
        )
        .join(",")}
    };
    var cache = {};
    function require(moduleId) {
      if (cache[moduleId]) {
        return cache[moduleId].exports;
      }
      var module = (cache[moduleId] = {
        exports: {},
      });
      modules[moduleId](module, module.exports, require);
      return module.exports;
    }
    (() => {
     ${chunk.entryModule._source}
    })();
  })();
   `;
}

function tryExtensions(
  modulePath,
  extensions,
  originalModulePath,
  moduleContext
) {
  for (let i = 0; i < extensions.length; i++) {
    if (fs.existsSync(modulePath + extensions[i])) {
      return modulePath + extensions[i];
    }
  }
  throw new Error(
    `Module not found: Error: Can't resolve '${originalModulePath}' in '${moduleContext}'`
  );
}

module.exports = Compiler;
