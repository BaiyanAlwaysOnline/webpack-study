const path = require("path");
const DonePlugin = require("./plugins/DonePlugin");
const RunPlugin = require("./plugins/RunPlugin");

module.exports = {
  context: process.cwd(),
  mode: "production",
  entry: "./src/page1.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".js"],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          path.resolve(__dirname, "loaders", "logger1-loader.js"),
          path.resolve(__dirname, "loaders", "logger2-loader.js"),
          path.resolve(__dirname, "loaders", "logger3-loader.js"),
          path.resolve(__dirname, "loaders", "logger4-loader.js"),
        ],
      },
    ],
  },
  plugins: [new DonePlugin(), new RunPlugin()],
};
