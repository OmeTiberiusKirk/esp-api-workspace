const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  // Optional transports @nestjs/microservices supports but this service doesn't use (TCP only).
  externals: [
    {
      'class-transformer/storage': 'commonjs class-transformer/storage',
      '@grpc/grpc-js': 'commonjs @grpc/grpc-js',
      '@grpc/proto-loader': 'commonjs @grpc/proto-loader',
      kafkajs: 'commonjs kafkajs',
      mqtt: 'commonjs mqtt',
      nats: 'commonjs nats',
      ioredis: 'commonjs ioredis',
      amqplib: 'commonjs amqplib',
      'amqp-connection-manager': 'commonjs amqp-connection-manager',
      '@nestjs/websockets/socket-module': 'commonjs @nestjs/websockets/socket-module',
    },
  ],
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false,
      sourceMap: true,
      mergeExternals: true,
    }),
  ],
};
