import {givenHttpServerConfig} from '@loopback/testlab';

import {UserTenantApplication} from '../fixtures/application';

export async function setupApplication(): Promise<UserTenantApplication> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new UserTenantApplication({
    rest: restConfig,
  });

  await app.boot();
  await app.migrateSchema({existingSchema: 'drop'});
  await app.start();

  return app;
}
