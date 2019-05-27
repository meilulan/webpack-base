//引入path
const path = require('path');
//引入压缩工具
const uglify = require('uglifyjs-webpack-plugin')

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
    },
    //模块：例如解读css，图片如何转换，压缩等功能
    module: {
        rules: [
            {
                //用于匹配处理文件的扩展名的正则表达式（必填）
                test: /\.css$/,
                //使用到的loader名（必填）
                //四种写法：
                //1.
                use: ['style-loader', 'css-loader'],
                //2.
                // loader: "style-loader",
                //3.
                // loader: ["style-loader", "css-loader"],
                //4.
                // use: [
                //     {
                //         loader: 'style-loader'
                //     },
                //     {
                //         loader: 'css-loader'
                //     }
                // ]
                //手动添加必须处理 或 屏蔽不需要处理的文件（可选）
                // include/exclude:['',''],
                //提供额外的设置选项（可选）
                // query:{},

            }
        ]
    },
    //插件：根据需求配置，用于生产模板和各项功能
    plugins: [
        //实例化压缩工具
        new uglify(),
    ],
    //配置webpack开发服务功能
    devServer: {
        hot: true,
        // inline:true,//添加为 inline模式的 热模块替换，默认为 iframe模式的 热模块替换
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