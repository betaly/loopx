﻿import {Client, createRestAppClient, givenHttpServerConfig} from '@loopback/testlab';

import {UserTenantServiceApplication} from '../fixtures/application';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new UserTenantServiceApplication({
    rest: restConfig,
  });

  await app.boot();
  setUpEnv();
  await app.migrateSchema({existingSchema: 'drop'});

  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

function setUpEnv() {
  process.env.NODE_ENV = 'test';
  process.env.ENABLE_TRACING = '0';
  process.env.ENABLE_OBF = '0';
}

export interface AppWithClient {
  app: UserTenantServiceApplication;
  client: Client;
}
