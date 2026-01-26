import path from 'node:path';
import { nonMinimizeTrait, minimizeTrait } from './traits.config.js';

const browser = {
  mode: 'production',
  entry: ['./src/adapter.ts'],
  target: 'web',
  performance: {
    maxEntrypointSize: 1400000,
    maxAssetSize: 1400000,
  },
  output: {
    path: path.resolve('./dist'),
    filename: 'apidom-parser-adapter-json.browser.js',
    libraryTarget: 'umd',
    library: 'apidomParserAdapterJson',
  },
  resolve: {
    extensions: ['.ts', '.mjs', '.js', '.json'],
    fallback: {
      fs: false,
      path: false,
      module: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'asset/inline',
        generator: {
          dataUrl: () => '',
        },
      },
      {
        test: /\.(ts|js)?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true,
            rootMode: 'upward',
          },
        },
      },
    ],
  },
  ...nonMinimizeTrait,
};

const browserMin = {
  mode: 'production',
  entry: ['./src/adapter.ts'],
  target: 'web',
  performance: {
    maxEntrypointSize: 800000,
    maxAssetSize: 800000,
  },
  output: {
    path: path.resolve('./dist'),
    filename: 'apidom-parser-adapter-json.browser.min.js',
    libraryTarget: 'umd',
    library: 'apidomParserAdapterJson',
  },
  resolve: {
    extensions: ['.ts', '.mjs', '.js', '.json'],
    fallback: {
      fs: false,
      path: false,
      module: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'asset/inline',
        generator: {
          dataUrl: () => '',
        },
      },
      {
        test: /\.(ts|js)?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true,
            rootMode: 'upward',
          },
        },
      },
    ],
  },
  ...minimizeTrait,
};

export default [browser, browserMin];
