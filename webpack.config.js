//引入path
const path = require('path');
const webpack = require('webpack');
//引入压缩工具（不需要 npm install）
const uglify = require('uglifyjs-webpack-plugin')
//引入html的打包工具（需要 npm install）
const htmlWebpackPlugin = require('html-webpack-plugin')
//引入分离工具
const extractTextPlugin = require('extract-text-webpack-plugin');

var website = {
    publicPath: "http://localhost:8880/",
}

module.exports = {

    //入口文件 配置项：可以是单一入口，也可以是多入口，一般是js文件（也可以是css）
    entry: {
        entry: './src/entery.js',//属性名可以自定义
        // entry2:'....',//其他入口
    },

    //出口文件 配置项：2.X版本后，支持多出口
    output: {

        //打包的路径
        path: path.resolve(__dirname, 'dist'),//获取项目的绝对路径

        //打包的文件名称
        filename: "bundle.js",
        // filename:[name].js,//多出口文件时的配置，意思是入口文件是什么名称，生成的出口文件就是什么名称

        //主要是处理静态文件路径问题，将根目录的绝对路径写入
        publicPath: website.publicPath,
    },

    //模块：例如解读css，图片如何转换，压缩等功能
    module: {
        rules: [
            //加载css
            {
                //用于匹配处理文件的扩展名的正则表达式（必填）
                test: /\.css$/,

                //使用到的loader名（必填）
                //四种写法：
                //1.
                // use: ['style-loader', 'css-loader'],
                //2.
                // loader: "style-loader",
                //3.
                // loader: ["style-loader", "css-loader"],
                //4.
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    }
                ]

                //若需要用到 文件分离工具 分离css到不同的目录中，则进行下述配置
                //注：该组件不支持热更新
                // use: extractTextPlugin.extract(
                //     {
                //         //需要用什么样的loader去编译文件
                //         use: "css-loader",
                //         //编译后用什么loader来提取文件
                //         fallback: "style-loader",
                //         //用来覆盖项目路径，生成该文件路径
                //         // publicfile:'',
                //     }
                // ),

                //手动添加必须处理 或 屏蔽不需要处理的文件（可选）
                // include/exclude:['',''],

                //提供额外的设置选项（可选）
                // query:{},
            },

            //加载图片
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        //url-loader已经封装了file-loader
                        loader: 'url-loader',
                        options: {
                            //把小于limit(B)的文件，打包成Base64的格式（DataURL），并写入js中
                            //把大于limit(B)的文件，调用file-loader，生成图片文件，并在js中引入其路径
                            limit: 8000,
                            //将图片打包到指定的文件夹下
                            outputPath: 'images/'
                        },
                    }
                ]
            },

            //打包html中的img图片
            {
                test: /\.(htm|html)$/,
                use: ['html-withimg-loader']
            }
        ]
    },

    //插件：根据需求配置，用于生产模板和各项功能
    plugins: [
        //实例化 压缩工具，只适用于生产环境，开发环境屏蔽掉
        // new uglify(),

        //实例化 html 的打包工具
        new htmlWebpackPlugin({
            //要打包的html模板路径和文件名
            template: './src/index.html',
            //是否取消缓存，自动的在js文件后面带上hash串
            hash: true,
            inject: true,
            //对html文件进行压缩，更多属性：https://github.com/kangax/html-minifier#options-quick-reference
            minify: {
                //去掉标签属性的双引号
                removeAttributeQuotes: true,
                //去掉空格，包括回车
                collapseWhitespace: true,
            },
        }),

        //实例化 分离工具，填写的是分离后的路径
        new extractTextPlugin({
            filename: 'css/index.css'
        }),
    ],

    //配置webpack开发服务功能
    devServer: {
        hot: true,
        inline: true,//添加为 inline模式的 热模块替换，默认为 iframe模式的 热模块替换
        //配置服务器基本运行路径，用于找到程序打包地址
        contentBase: path.resolve(__dirname, 'dist'),
        //服务器的IP地址，可以使用localhost
        host: "localhost",
        //服务端口号
        port: 8880,
        //服务端压缩是否开启
        compress: true,
    }
}