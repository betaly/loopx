import {givenHttpServerConfig} from '@loopback/testlab';

import {UserCoreApplication} from './fixtures/application';

export async function setupApplication(): Promise<UserCoreApplication> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new UserCoreApplication({
    rest: restConfig,
  });

  await app.boot();
  await app.migrateSchema({existingSchema: 'drop'});
  await app.start();

  return app;
}
