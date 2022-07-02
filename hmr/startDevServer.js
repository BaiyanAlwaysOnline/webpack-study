const webpack = require("webpack");
const config = require("./webpack.config.js");
const Server = require("./webpack-dev-server/lib/Server.js");

function startDevServer(compiler, config) {
  const devServerOptions = config?.devServer || {};
  const { port = 8080, host = "localhost" } = devServerOptions;
  const server = new Server(compiler, devServerOptions);
  server.listen(8080, host, (err) => {
    if (!err) {
      console.log("App is listening at" + host + port);
    }
  });
}

// compiler是webpack工作的主要对象；
const compiler = webpack(config);

startDevServer(compiler, config);
