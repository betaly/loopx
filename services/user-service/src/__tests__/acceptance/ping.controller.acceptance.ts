import {Client, expect} from '@loopback/testlab';

import {UserTenantServiceApplication} from '../fixtures/application';
import {setupApplication} from './test-helper';

describe('PingController', () => {
  let app: UserTenantServiceApplication;
  let client: Client;

  beforeAll(async () => {
    ({app, client} = await setupApplication());
  });

  afterAll(async () => {
    await app.stop();
  });

  it('invokes GET /ping', async () => {
    const res = await client.get('/ping?msg=world').expect(200);
    expect(res.body).to.containEql({greeting: 'pong'});
  });
});
