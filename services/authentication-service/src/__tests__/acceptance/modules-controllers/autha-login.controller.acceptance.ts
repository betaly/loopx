import {AuthaCallbackParameters, UserClaims} from '@authajs/passport-autha';
import {Client, createRestAppClient} from '@loopback/testlab';
import {AuthClient} from '@loopx/user-core';
import nock from 'nock';

import {isJWTToken} from '../../../utils/tokens';
import {TestingApplication} from '../../fixtures/application';
import {TestHelperKey} from '../../fixtures/keys';
import {TestHelperService} from '../../fixtures/services';
import {mockToken, mockUserInfo} from '../../mocks';
import {clearInitialData, setupApplication, setupInitialData} from '../test-helper';

const AUTHA_ENDPOINT = 'http://localhost:3001';

describe('Autha Login Controller', () => {
  let app: TestingApplication;
  let client: Client;
  let helper: TestHelperService;
  let testAuthClient: AuthClient;
  beforeAll(async () => {
    ({app, client} = await setupApplication({
      autha: {
        endpoint: AUTHA_ENDPOINT,
        redirectUri: 'http://localhost:3000/auth/autha-redirect',
        clientID: 'autha_client_spa',
        clientSecret: 'autha_client_secret',
      },
    }));
  });
  afterAll(async () => app.stop());
  beforeAll(async () => {
    client = createRestAppClient(app);
    helper = await app.get(TestHelperKey);
  });

  beforeEach(setupMockData);
  afterEach(cleanupMockData);
  afterEach(() => {
    delete process.env.JWT_ISSUER;
    delete process.env.JWT_SECRET;
    helper.reset();
  });

  it('should return redirect', async () => {
    const res = await client
      .post('/auth/autha?interaction_mode=signUp')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        client_id: 'web',
        client_secret: 'test',
      })
      .expect(302);
    expect(res.header.location).toBeDefined();
    const url = new URL(res.header.location);
    expect(url.origin).toBe('http://localhost:3001');
    expect(url.searchParams.get('client_id')).toBe('autha_client_spa');
    expect(url.searchParams.get('client_secret')).toBe(null);
    expect(url.searchParams.get('redirect_uri')).toBe('http://localhost:3000/auth/autha-redirect');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('scope')).toBe('openid offline_access profile email phone custom_data identities');
    expect(url.searchParams.get('state')).toBeDefined();
    expect(url.searchParams.get('interaction_mode')).toBe('signUp');
  });

  it('should return authorization code when response mode is query', async () => {
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    const resStep1 = await client
      .post('/auth/autha')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        client_id: 'web',
        client_secret: 'test',
      })
      .expect(302);
    const urlStep1 = new URL(resStep1.header.location);

    // for client sessions
    const cookie = resStep1.header['set-cookie'];

    nockOidcUserInfo(mockUserInfo());
    nockOidcToken(mockToken());
    const resStep2 = await client
      .get('/auth/autha-redirect')
      .set('Cookie', cookie)
      .query({
        code: 'test_code',
        state: urlStep1.searchParams.get('state'),
        iss: `${AUTHA_ENDPOINT}/oidc`,
      })
      .expect(302);
    expect(resStep2.header.location).toBeDefined();

    const urlStep2 = new URL(resStep2.header.location);

    const redirectUrl = `${urlStep2.origin}${urlStep2.pathname}`;
    expect(redirectUrl).toBe(testAuthClient.redirectUrl);
    expect(isJWTToken(urlStep2.searchParams.get('code')!)).toBe(true);
  });

  it('should return authorization code when response mode is web_message', async () => {
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    const resStep1 = await client
      .post('/auth/autha')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send({
        client_id: 'web',
        client_secret: 'test',
      })
      .expect(302);
    const urlStep1 = new URL(resStep1.header.location);

    // for client sessions
    const cookie = resStep1.header['set-cookie'];

    nockOidcUserInfo(mockUserInfo());
    nockOidcToken(mockToken());
    const resStep2 = await client
      .get('/auth/autha-redirect')
      .set('Cookie', cookie)
      .query({
        code: 'test_code',
        state: urlStep1.searchParams.get('state'),
        iss: `${AUTHA_ENDPOINT}/oidc`,
        response_mode: 'web_message',
      })
      .expect(200);

    expect(resStep2.text).toContain('postMessage');
  });

  async function cleanupMockData() {
    await clearInitialData(app);
  }

  async function setupMockData() {
    const models = await setupInitialData(app);
    testAuthClient = models.testAuthClient;
  }
});

export function nockOidcUserInfo(userInfo: UserClaims) {
  return nock(AUTHA_ENDPOINT).get('/oidc/me').reply(200, userInfo);
}

export function nockOidcToken(token: AuthaCallbackParameters) {
  return nock(AUTHA_ENDPOINT).post('/oidc/token').reply(200, token);
}
