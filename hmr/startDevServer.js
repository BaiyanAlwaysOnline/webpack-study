const webpack = require("webpack");
const config = require("./webpack.config.js");
const Server = require("./webpack-dev-server/lib/Server.js");

function startDevServer(complier, config) {
  const devServerOptions = config?.devServer || {};
  const { port = 8080, host = "localhost" } = devServerOptions;
  const server = new Server(complier, devServerOptions);
  server.listen(8080, host, (err) => {
    if (!err) {
      console.log("App is listening at" + host + port);
    }
  });
}

const complier = webpack(config);

startDevServer(complier, config);
