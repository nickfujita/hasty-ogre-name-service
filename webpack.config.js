'use strict'

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = (env) => {
  const DISTRIBUTION = env && env.DISTRIBUTION === 'true';

  let plugins = [
    new HtmlWebpackPlugin({
      inlineSource: '.(js)$',
      template: 'src/index.html'
    }),
    new HtmlWebpackInlineSourcePlugin(),
    new StyleLintPlugin({
      configFile: '.stylelintrc',
      context: 'src/styles',
      files: '**/*.scss',
      failOnError: false,
      quiet: false,
    }),
  ];

  if (DISTRIBUTION) {
    plugins.push(new UglifyJsPlugin());
  }

  return {
    resolve: {
      extensions: ['.ts', '.tsx', '.js' , '.scss'],
    },
    entry: ['./src/index'],
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'bundle.js',
    },
    devServer: {
      contentBase: path.join(__dirname, 'build'),
      port: 9000,
      compress: false,
      https: false,
      open: true,
      historyApiFallback: true
    },
    plugins: plugins,
    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          enforce: 'pre',
          loader: "tslint-loader",
          exclude: [/node_modules/, /styles/],
        },
        {
          test: /\.ts(x?)$/,
          exclude: [/node_modules/, /styles/],
          use: 'ts-loader',
          include: path.join(__dirname, 'src'),
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader','sass-loader'],
        },
        {
          test: /\.(jpe?g|png|woff|woff2|ttf|wav|svg)$/,
          use: 'url-loader',
        },
      ],
    },
  };
};
