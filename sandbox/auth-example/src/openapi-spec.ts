import {ApplicationConfig} from '@loopback/core';

import {AuthExampleApplication} from './application';

const log = require('why-is-node-running');

/**
 * Export the OpenAPI spec from the application
 */
const port = 3000;

setTimeout(() => {
  log(); // 将会输出到控制台，显示哪些操作仍在运行
}, 1000); // 或者您认为合适的时间

async function exportOpenApiSpec(): Promise<void> {
  const config: ApplicationConfig = {
    rest: {
      port: +(process.env.PORT ?? port),
      host: process.env.HOST ?? 'localhost',
    },
  };
  const outFile = process.argv[2] ?? './src/openapi.json';
  const app = new AuthExampleApplication(config);
  // await app.boot();
  await app.exportOpenApiSpec(outFile);
  await app.stop();
}

exportOpenApiSpec().catch(err => {
  console.error('Fail to export OpenAPI spec from the application.', err);
  process.exit(1);
});
