import logServerUrls from 'log-server-urls';

import {ApplicationConfig, AuthExampleApplication} from './application';

export * from './application';

export async function main(options: ApplicationConfig = {}): Promise<AuthExampleApplication> {
  const app = new AuthExampleApplication(options);
  // await app.boot();
  await app.start();

  logServerUrls(options.rest.port, options.rest.host);

  return app;
}
