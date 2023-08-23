import {Client, expect} from '@loopback/testlab';
import {AuthProvider} from '@loopx/core';

import {UserRepository} from '../../../repositories';
import {TestingApplication} from '../../fixtures/application';
import {OtpCodeCache} from '../../fixtures/providers/otp-sender.provider';
import {clearInitialData, setupApplication, setupInitialData} from '../test-helper';

const basePath = '/auth/passwordless';

describe('Passwordless Auth Flow', () => {
  let app: TestingApplication;
  let client: Client;
  let userRepo: UserRepository;

  const useragent = 'test';
  const deviceId = 'test';
  const useragentName = 'user-agent';
  const deviceIdName = 'device_id';

  beforeAll(async () => {
    ({app, client} = await setupApplication());
  });
  afterAll(async () => app.stop());
  beforeAll(givenUserRepository);
  beforeAll(setMockData);
  afterAll(deleteMockData);
  afterEach(() => {
    delete process.env.JWT_ISSUER;
    delete process.env.JWT_SECRET;
    OtpCodeCache.clear();
  });

  it('should signup and login with passwordless', async () => {
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';

    // 1. request otp
    const reqDataForSendOtp = {
      client_id: 'web',
      client_secret: 'test',
      key: 'sms:12673800457',
    };
    await client.post(`${basePath}/start`).send(reqDataForSendOtp);

    // 2. verify otp
    const otp = OtpCodeCache.get(reqDataForSendOtp.key);

    const reqDataForVerifyOtp = {
      key: reqDataForSendOtp.key,
      otp,
    };
    const resWithCode = await client.post(`${basePath}/verify`).send(reqDataForVerifyOtp).expect(200);
    expect(resWithCode.body).to.have.property('code');

    // 3. get token with code
    const response = await client.post(`/auth/token`).set(deviceIdName, deviceId).set(useragentName, useragent).send({
      clientId: 'web',
      code: resWithCode.body.code,
    });
    expect(response.body).to.have.properties(['accessToken', 'refreshToken', 'expiresIn']);
  });

  async function givenUserRepository() {
    userRepo = await app.getRepository(UserRepository);
  }

  async function deleteMockData() {
    await clearInitialData(app);
  }

  async function setMockData() {
    const {testUser2} = await setupInitialData(app);

    await userRepo.credentials(testUser2.id).patch({
      authProvider: AuthProvider.KEYCLOAK,
      password: 'qwerty',
    });
  }
});
