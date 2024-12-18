const path = require('path');
const fs = require('fs');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = async (webpackEnv, argv) => {
  const stage = webpackEnv.stage || 'local'; // Default to 'local' if not specified
  const getEnvFromStack = require(path.join(__dirname, '../services/getEnvFromStack'));
  const envConfig = await getEnvFromStack(stage); // Fetch environment from stack

  // Write Cypress environment configuration file
  const cypressEnvPath = path.join(__dirname, 'cypress.env.json');
  const cypressEnvConfig = {
    API_URL: envConfig.API_URL,
    STAGE: envConfig.STAGE,
    DYNAMODB_ENDPOINT: envConfig.DYNAMODB_ENDPOINT,
    USER_POOL_ID: envConfig.USER_POOL_ID,
    CLIENT_ID: envConfig.CLIENT_ID,
  };
  fs.writeFileSync(cypressEnvPath, JSON.stringify(cypressEnvConfig, null, 2));

  const baseConfig = {
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'bundle.js',
      publicPath: "/",
    },
    entry: {
      index: "./src/index.tsx",
    },
    target: 'web',
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".css"],
      fallback: {
        crypto: false
      }
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: path.join(__dirname, './public/index.html'),
      }),
      new webpack.DefinePlugin({
        'process.env': {
          STAGE: JSON.stringify(envConfig.STAGE),
          DYNAMODB_ENDPOINT: JSON.stringify(envConfig.DYNAMODB_ENDPOINT),
          API_URL: JSON.stringify(envConfig.API_URL),
          USER_POOL_ID: JSON.stringify(envConfig.USER_POOL_ID),
          CLIENT_ID: JSON.stringify(envConfig.CLIENT_ID),
        }
      })
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: [/\.scss$/, /\.css$/],
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }]
        },
        {
          test: /\.(ttf|png|jpe?g|svg|gif)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'images/'
              }
            },
          ],
        },
      ],
    }
  };

  if (argv.mode === 'development') {
    return {
      ...baseConfig,
      mode: 'development',
      devtool: 'source-map',
      devServer: {
        historyApiFallback: true,
        compress: true,
        host: 'localhost',
        port: 3000,
        open: true,
      }
    };
  }

  return {
    ...baseConfig,
    mode: 'production',
  };
};
