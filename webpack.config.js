//需要同步检查html模板，所以需要引入node的glob对象
const glob = require('glob');
//引入path
const path = require('path');
const webpack = require('webpack');
//引入压缩工具（不需要 npm install）
const uglify = require('uglifyjs-webpack-plugin')
//引入html的打包工具（需要 npm install）
const htmlWebpackPlugin = require('html-webpack-plugin')
//引入分离工具
const extractTextPlugin = require('extract-text-webpack-plugin');
//引入净化css工具
const purifyCSSPlugin = require('purifycss-webpack');
//引入模块化文件
const moduleEntry = require('./build/webpack.entry');
//静态资源集中输出
const copyPlugin = require('copy-webpack-plugin');

let buildType = process.env.type;
console.log(buildType)
var website = { publicPath: "" };
if (buildType == "dev") {
    website.publicPath = "http://localhost:8880/";
} else if (buildType == "prod") {
    website.publicPath = "http://meilulan:8880/";
}

module.exports = {
    //配置调试模式
    // devtool:false,//打包后的代码（生产环境）
    // devtool: 'source-map',//原始源代码（生产环境，单独map文件）
    // devtool:'cheap-module-source-map',//原始源代码（仅限行，开发环境，单独map文件）
    // devtool:'eval-source-map',//原始源代码（开发环境，打包后的文件里）
    devtool: 'cheap-module-eval-source-map',//原始源代码（仅限行，开发环境，打包后的文件里）
    // devtool:'inline-source-map',//原始源代码（开发环境，以dataURL写入打包后的文件里）
    // devtool:'inline-cheap-module-source-map',//原始源代码（仅限行，开发环境，以dataURL写入打包后的文件里）

    //入口文件 配置项：可以是单一入口，也可以是多入口，一般是js文件（也可以是css）
    entry: {
        entry: './src/entery.js',//属性名可以自定义
        // entry2:'....',//其他入口

        //优化：引入需抽离的类库
        jq: 'jquery',
        vue: 'vue',

    },
    //模块化测试
    // entry: moduleEntry,

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

                //使用到的loader名，加载顺序不能颠倒（webpack是自下而上解析）（必填）
                //四种写法：
                //1.
                // use: ['style-loader', 'css-loader','postcss-loader'],
                //2.
                // loader: "style-loader",
                //3.
                // loader: ["style-loader", "css-loader","postcss-loader"],
                //4.
                /* use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    }
                    },
                    {
                        loader: 'postcss-loader'
                    }
                ] */

                //若需要用到 文件分离工具 分离css到不同的目录中，则进行下述配置
                //注：该组件不支持热更新
                use: extractTextPlugin.extract(
                    {
                        //需要用什么样的loader去编译文件
                        use: ["css-loader", "postcss-loader"],
                        //编译后用什么loader来提取文件
                        fallback: "style-loader",
                        //用来覆盖项目路径，生成该文件路径
                        // publicfile:'',
                    }
                ),

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
            },

            //处理scss文件
            {
                test: /\.scss$/,

                //开发环境
                /* use: [
                    //顺序不能颠倒
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'sass-loader'
                    },
                ], */

                //生产环境
                use: extractTextPlugin.extract({
                    use: [
                        {
                            loader: 'css-loader'
                        },
                        {
                            loader: 'sass-loader'
                        }
                    ],
                    fallback: 'style-loader',
                }),
            },

            //配置babel
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader'
                },
                exclude: __dirname + 'node_modules',
                include: __dirname + 'src',
            },
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

        //实例化 净化工具，该插件必须配合extract-text-webpack-plugin插件使用
        new purifyCSSPlugin({
            //主要是需找html模板，purifycss根据这个配置会遍历你的文件，查找哪些css被使用了
            paths: glob.sync(path.join(__dirname, 'src/*.html')),
        }),

        //引入第三方类库：方式二
        new webpack.ProvidePlugin({
            $: "jquery"
        }),

        //优化：引入插件
        new webpack.optimize.CommonsChunkPlugin({
            //name对应入口文件中的名字
            // name: 'jquery',
            name: ['jq', 'vue'],//多文件
            //把文件打包到哪里，指明路径和文件名
            // filename: 'assests/js/jquery.min.js',
            filename: 'assests/js/[name].js',//多文件
            //最小打包的文件模块数，一般是大于等于2
            minChunks: 2
        }),

        //静态资源集中输出
        new copyPlugin([
            {
                from: __dirname + '/src/static',
                to: './static'
            }
        ]),
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