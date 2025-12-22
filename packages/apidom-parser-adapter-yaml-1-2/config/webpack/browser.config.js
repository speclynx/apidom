import path from 'node:path';
import { nonMinimizeTrait, minimizeTrait } from './traits.config.js';

const browser = {
  mode: 'production',
  entry: ['./src/adapter.ts'],
  target: 'web',
  performance: {
    maxEntrypointSize: 2_400_000,
    maxAssetSize: 2_400_000,
  },
  output: {
    path: path.resolve('./dist'),
    filename: 'apidom-parser-adapter-yaml-1-2.browser.js',
    libraryTarget: 'umd',
    library: 'apidomParserAdapterYaml1_2',
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
    maxEntrypointSize: 1_300_000,
    maxAssetSize: 1_300_000,
  },
  output: {
    path: path.resolve('./dist'),
    filename: 'apidom-parser-adapter-yaml-1-2.browser.min.js',
    libraryTarget: 'umd',
    library: 'apidomParserAdapterYaml1_2',
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
