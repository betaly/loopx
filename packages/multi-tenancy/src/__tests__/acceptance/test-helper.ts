import {Client, createRestAppClient, givenHttpServerConfig} from '@loopback/testlab';

import {MultiTenancyBindings} from '../../keys';
import {ExampleMultiTenancyApplication} from '../fixtures/application';

export async function setupApplication(): Promise<AppWithClient> {
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
  app.bind(MultiTenancyBindings.POST_PROCESS).to((ctx, tenant) => {
    ctx.bind('datasources.db').toAlias(`datasources.db.${tenant.id}`);
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: ExampleMultiTenancyApplication;
  client: Client;
}
