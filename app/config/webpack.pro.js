/* 生产环境 */
const os = require('os');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');
const HappyPack = require('happypack');
const { proHtmlWebpackPlugin } = require('./htmlWebpackPlugin');
const config = require('./webpack.config');
const sassConfig = require('./sass.config');

const happyThreadPool = HappyPack.ThreadPool({
  size: os.cpus().length
});

/* 合并配置 */
module.exports = config({
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'script/[name]_[chunkhash].js',
    chunkFilename: 'script/[name]_[chunkhash]_chunk.js'
  },
  module: {
    rules: [
      { // sass
        test: /^.*\.sass$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'happypack/loader',
              options: {
                id: 'sass_loader'
              }
            }
          ]
        })
      },
      { // css
        test: /^.*\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'happypack/loader',
              options: {
                id: 'css_loader'
              }
            }
          ]
        }),
        exclude: /(bootstrap)/
      },
      { // pug
        test: /^.*\.pug$/,
        use: [
          {
            loader: 'pug-loader',
            options: {
              name: '[name].html'
            }
          }
        ]
      },
      { // 矢量图片 & 文字
        test: /^.*\.(eot|svg|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash].[ext]',
              outputPath: 'file/',
              publicPath: '../'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    /* HappyPack */
    // sass
    new HappyPack({
      id: 'sass_loader',
      loaders: ['css-loader', sassConfig],
      threadPool: happyThreadPool,
      verbose: true
    }),
    // css
    new HappyPack({
      id: 'css_loader',
      loaders: ['css-loader'],
      threadPool: happyThreadPool,
      verbose: true
    }),
    // 代码压缩
    new UglifyJSPlugin({
      uglifyOptions: {
        warnings: true,
        output: {
          comments: false,
          beautify: false,
          quote_style: 3
        }
      }
    }),
    new OptimizeCSSPlugin(),
    // 抽离css
    new ExtractTextPlugin({
      filename: 'style/[name]_[contenthash].css',
      allChunks: true
    }),
    // html模板
    proHtmlWebpackPlugin('index', '../src/template/index.pug'),
    proHtmlWebpackPlugin('searchID', '../src/template/searchID.pug'),
    proHtmlWebpackPlugin('cut', '../src/template/cut.pug')
  ]
});