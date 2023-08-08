import {Constructor} from '@loopback/core';
import {SequenceHandler} from '@loopback/rest';
import {Client, createRestAppClient, givenHttpServerConfig} from '@loopback/testlab';

import {ExampleMultiTenancyApplication} from '../fixtures/application';

export async function setupApplication(sequence: Constructor<SequenceHandler>): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new ExampleMultiTenancyApplication({
    rest: restConfig,
  });

  app.sequence(sequence);

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: ExampleMultiTenancyApplication;
  client: Client;
}
