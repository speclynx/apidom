import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';

export const nonMinimizeTrait = {
  optimization: {
    minimize: false,
    usedExports: false,
    concatenateModules: false,
  },
};

export const minimizeTrait = {
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            warnings: false,
          },
          output: {
            comments: false,
          },
        },
      }),
    ],
  },
};
