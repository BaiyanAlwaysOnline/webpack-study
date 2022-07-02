let babelCode = require("@babel/core");
/**
 * - babel-loader 代码转换器，调用 @babel/core
 * - @babel/core 本身只是提供一个过程管理的功能，把源代码转成抽象语法树，进行遍历和生成，它本身并不知道具体转换成什么语法，以及语法如何转换
 * - @babel/preset-env（预设是插件的集合） 提供要转换的语法，以及语法如何转换（只转换语法，不提供polyfill）
 */

/**
 * 执行步骤
 * 1.@babel/core先把ES6+转成ES6语法树；
 * 2.调用预设preset-env，把ES6语法树转成ES5语法树（按照配置target）
 * 3.@babel/core再把ES5语法树重新生成ES5代码
 */

function loader(source) {
  let es5 = babelCode.transform(source, {
    presets: ["@babel/preset-env"],
  });
  return es5;
}

module.exports = loader;
