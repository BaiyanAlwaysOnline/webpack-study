// TODO path.resolve path.join require.resolve的区别

/**
 * 更新compiler，给用户配置的entry入口增加两个文件
 * @param {*} compiler
 */
function updateCompiler(compiler) {
  const options = compiler.options;
  const hooks = compiler.hooks;
  // ! 1.来自webpack-dev-server/client/index.js  => 浏览器中的websocket客户端
  options.entry.main.import.unshift(require.resolve("../../client/index.js"));
  // ! 2.来自webpack/hot/dev-server.js  => 浏览器中监听事件，处理热更新逻辑
  options.entry.main.import.unshift(
    require.resolve("../../../webpack/hot/dev-server.js")
  );
  // ? 修改入口后，需要通知webpack按新的入口编译 entryOption是干嘛的，参数context是什么
  hooks.entryOption.call(options.context, options.entry);
}

module.exports = updateCompiler;
