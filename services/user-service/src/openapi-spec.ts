﻿import {ApplicationConfig} from '@loopback/core';

import {UserServiceApplication} from './application';

/**
 * Export the OpenAPI spec from the application
 */
const PORT = 3000;
const FILEARGVI = 2;

async function exportOpenApiSpec(): Promise<void> {
  const config: ApplicationConfig = {
    rest: {
      port: +(process.env.PORT ?? PORT),
      host: process.env.HOST ?? 'localhost',
    },
  };
  const outFile = process.argv[FILEARGVI] ?? 'openapi.json';
  const app = new UserServiceApplication(config);
  await app.boot();
  await app.exportOpenApiSpec(outFile);
}

exportOpenApiSpec().catch(err => {
  throw err;
});
