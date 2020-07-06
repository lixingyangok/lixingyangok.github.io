
const {
  override,
  overrideDevServer,
  // addLessLoader,
  // addPostcssPlugins,
  // fixBabelImports,
} = require('customize-cra');
const CompressionWebpackPlugin = require('compression-webpack-plugin');

// 打包配置
const addCustomize = () => config => {
  if (process.env.NODE_ENV !== 'production') return config;
  config.devtool = false; // 关闭sourceMap
  // config.output.path = __dirname + '../dist/demo/'; // 配置打包后的文件位置
  // config.output.publicPath = './demo';
  config.plugins.push( // 添加js打包gzip配置
    new CompressionWebpackPlugin({
      filename: '[path].gz[query]',
			algorithm: 'gzip',
			test: new RegExp(`\\.(${['js', 'css'].join('|')})$`),
			threshold: 1024 * 10,
			minRatio: 0.8,
			deleteOriginalAssets: false,
    }),
  )
  return config;
}

// 跨域配置
const devServerConfig = () => config => {
  return {
    ...config,
    // 服务开启gzip
    compress: true,
    // proxy: {
    //   '/api': {
    //     target: 'xxx',
    //     changeOrigin: true,
    //     pathRewrite: {
    //       '^/api': '/api',
    //     },
    //   }
    // }
  }
}

module.exports = {
  webpack: override(
    // fixBabelImports('import', {
    //   libraryName: 'antd-mobile',
    //   style: 'css',
    // }),
    // addLessLoader(),
    // addPostcssPlugins([require('postcss-pxtorem')({ rootValue: 75, propList: ['*'], minPixelValue: 2, selectorBlackList: ['am-'] })]),
    addCustomize(),
  ),
  devServer: overrideDevServer(
    devServerConfig(),
  ),
};

