const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackExternalsPlugin = require("html-webpack-externals-plugin");
console.log(process.env.NODE_ENV);
module.exports = (env) => {
  console.log(env);
  return {
    mode: "production",
    devtool: false,
    entry: "./src/index.js",
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "[name]_[hash].js",
      // publicPath: "/assets/", // 打包出来的目录不会有publicPath，html文件里面引入的资源会加上这个前，可以是CDN地址
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-react",
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "usage", // 开启useBuiltIns配置才能转换API和实例方法，否则只能转换语法      usage（自动按需引入所需要的polyfill）  false（全量引入） entry（需要在入口文件手动引入，然后再按需加载）
                    corejs: { version: 3 },
                    targets: {
                      chrome: "60",
                      safari: "10",
                    },
                  },
                  // 或者使用polyfill-service
                  // polyfill.io自动化的JavaScript Polyfill服务
                  // polyfill.io通过分析请求头新增中的UserAgent实现自动按需加载用户使用的浏览器所需的polyfills
                ],
              ],
            },
          },
        },
        {
          test: /\.txt$/,
          use: "raw-loader",
        },
        {
          // css-loader处理@import url(path)
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.less$/,
          use: ["style-loader", "css-loader", "less-loader"],
        },
        {
          test: /\.scss$/,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
        {
          test: /\.jpeg|jpg$/,
          use: [
            {
              loader: "file-loader", // 把图片拷贝到output.path,然后改个名字
              options: {
                name: "images/[hash:10].[ext]",
                esModule: false, // 默认是true
              },
            },
            {
              loader: "url-loader", // 是对file-loader的增强
              options: {
                name: "images/[hash:10].[ext]",
                esModule: false, // 默认是true
                limit: 12 * 1024, //  小于12 * 1024的图片会转成base64内嵌，大于的话还是走file-loader
              },
            },
          ],
        },
      ],
    },
    // 使用externals忽略第三方类库的打包，配合HtmlWebpackExternalsPlugin使用
    externals: {
      _: "lodash",
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.html",
      }),
      new CleanWebpackPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.ProvidePlugin({
        // 可以在模块中直接使用lodash，而不用每个文件引，缺点：不能全局使用
        _: "lodash",
        // ...
      }),
      new webpack.DefinePlugin({
        ENV: process.env.NODE_ENV,
        VERSION: "1",
      }),
      // new HtmlWebpackExternalsPlugin({
      //   externals: [
      //     {
      //       module: "jquery",
      //       entry: "dist/jquery.min.js",
      //       global: "jQuery",
      //     },
      //   ],
      // }),
    ],
    devServer: {
      contentBase: path.join(__dirname, "static"),
      writeToDisk: true,
      port: 9000,
      hot: true,
      open: true,
    },
  };
};
