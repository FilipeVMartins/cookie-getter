const path = require('path');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    popup: './popup/popup.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: '[name]/[name].js',
    publicPath: '/',
  },
  plugins: [
    new LiveReloadPlugin({
      appendScriptTag: true,
      // ignore: /node_modules/, // Add this line to ignore node_modules
      protocol: 'http', // Use http protocol
      hostname: 'localhost',
      port: 35729, // Specify the port for livereload
      // delay: 1000, // Optional delay
      ignoreErrors: false, // Optional
      // 'scriptSrc': 'http://localhost:35729/livereload.js', // Specify the script source
    }),
    // Copy webpack.config.js to dist folder
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: '.' },
        { from: 'assets/icons', to: 'assets/icons' },
        { from: 'popup/popup.html', to: 'popup' },
        // { from: 'options/options.html', to: 'options' },
        { from: 'blockingRules.json', to: '.' },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    hot: true,
    // bellow to avoid unsafe-eval when running watch
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    writeToDisk: true, // This is important for Chrome extensions
    inline: false, // Disable inline mode to avoid 'unsafe-eval'
  },
  devtool: 'source-map',
  
};


// manifest.json
// "content_scripts": [
//   {
//     "matches": ["https://*/*", "http://*/*", "<all_urls>"],
//     "js": [
//       "content/content.js"
//     ]
//   }
// ],