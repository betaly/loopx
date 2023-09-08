import {Client, createRestAppClient, givenHttpServerConfig} from '@loopback/testlab';
import {IAuthTenantUser} from '@loopx/core';
import * as jwt from 'jsonwebtoken';
import {nanoid} from 'nanoid';
import {MarkRequired} from 'ts-essentials';

import {UserServiceApplication} from '../fixtures/application';
import {JWT_ISSUER, JWT_SECRET} from '../fixtures/consts';

export async function setupApplication(): Promise<AppWithClient> {
  const restConfig = givenHttpServerConfig({
    // Customize the server configuration here.
    // Empty values (undefined, '') will be ignored by the helper.
    //
    // host: process.env.HOST,
    // port: +process.env.PORT,
  });

  const app = new UserServiceApplication({
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
  app: UserServiceApplication;
  client: Client;
}

export function createTenantUser(user: MarkRequired<Partial<IAuthTenantUser>, 'role' | 'tenantId'>): IAuthTenantUser {
  return {
    id: nanoid(10),
    userTenantId: nanoid(10),
    username: 'test_user',
    authClientId: 0,
    ...user,
  };
}

export function buildAccessToken(user: IAuthTenantUser) {
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: 180000,
    issuer: JWT_ISSUER,
  });
}
