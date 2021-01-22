/* eslint-disable @typescript-eslint/no-var-requires */
const bodyParser = require('body-parser')
const mockServer = require('./src/utils/mock/server');
const { NODE_ENV, VUE_APP_PORT, VUE_APP_MOCK } = process.env;
module.exports = {
    publicPath: '/',
    outputDir: 'dist',
    productionSourceMap: false,
    devServer: {
        host: '0.0.0.0',
        port: VUE_APP_PORT || 8000,
        // 配置反向代理
        /*
        proxy: {
            '/api': {
              target: '<url>',
              ws: true,
              changeOrigin: true
            },
            '/foo': {
              target: '<other_url>'
            }
        }, 
        */
        before: function(app, server) {
            if(NODE_ENV === 'development' && VUE_APP_MOCK === 'true') {
                // parse app.body
                // https://expressjs.com/en/4x/api.html#req.body
                // create application/json parser
                app.use(bodyParser.json());
                // create application/x-www-form-urlencoded parser
                app.use(bodyParser.urlencoded({ extended: false}));
                mockServer(app);            
            }            
        }
    },
    // 修改webpack的配置
    configureWebpack: {
        // 不需要打包的插件
        externals: {
            // 'vue': 'Vue',
            // 'vue-router': 'VueRouter',
            // 'element-ui': 'ELEMENT'            
        }
    },
    chainWebpack(config) {

        // 内置的 svg Rule 添加 exclude
        config.module
        .rule('svg')
        .exclude.add(/iconsvg/)
        .end();

        // 添加 svg-sprite-loader Rule
        config.module
        .rule('svg-sprite-loader')
        .test(/.svg$/)
        .include.add(/iconsvg/)
        .end()
        .use('svg-sprite-loader')
        .loader('svg-sprite-loader');

        // 添加 svgo Rule
        config.module
        .rule('svgo')
        .test(/.svg$/)
        .include.add(/iconsvg/)
        .end()
        .use('svgo-loader')
        .loader('svgo-loader')
        .options({
            // externalConfig 配置特殊不是相对路径，起始路径是根目录
            externalConfig: './src/assets/iconsvg/svgo.yml',
        });

    },
    pluginOptions: {        
        electronBuilder: {
            // electron 构建配置
            builderOptions: {
                productName: 'electron-admin-element-vue', // 项目名，也是生成的安装文件名，即electron-admin-element-vue.exe
                appId: 'cc.liqingsong.electron-admin-element-vue', // 包名
                copyright: 'Copyright © 2018-present LiQingSong', // 版权
                nsis: {
                    oneClick: false, // 是否一键安装
                    allowElevation: true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
                    allowToChangeInstallationDirectory: true, // 允许修改安装目录
                    installerIcon: './build/icons/icon.ico', // 安装图标
                    uninstallerIcon: './build/icons/icon.ico', // 卸载图标
                    installerHeaderIcon: './build/icons/icon.ico', // 安装时头部图标
                    createDesktopShortcut: true, // 创建桌面图标
                    createStartMenuShortcut: true, // 创建开始菜单图标
                    shortcutName: 'electron-admin-element-vue' // 图标名称
                },
                dmg: { // macOSdmg
                    contents: [
                      {
                        "x": 410,
                        "y": 150,
                        "type": "link",
                        "path": "/Applications"
                      },
                      {
                        "x": 130,
                        "y": 150,
                        "type": "file"
                      }
                    ]
                },
                mac: { // mac
                    icon: "./build/icons/icon.icns",
                    artifactName: '${productName}-v${version}-mac.${ext}'
                },
                win: { // win 相关配置
                    icon: './build/icons/icon.ico',
                    artifactName: '${productName}-v${version}-win32-setup.${ext}',
                    target: [
                        {
                          target: "nsis", // 利用nsis制作安装程序
                          arch: [ // 这个意思是打出来32 bit + 64 bit的包，但是要注意：这样打包出来的安装包体积比较大，所以建议直接打32的安装包。
                            // "x64",
                            "ia32"
                          ]
                        }
                      ]
                },
                linux: {
                    icon: "./build/icons",
                    artifactName: '${productName}-v${version}-linux.${ext}'
                }
            }
        }
    }
}