import {AuthenticationErrors} from '@bleco/authentication';
import {Client, expect} from '@loopback/testlab';
import {AuthProvider} from '@loopx/core';
import {UserRepository} from '@loopx/user-core';

import {TestingApplication} from '../fixtures/application';
import {OtpCodeCache} from '../fixtures/providers/otp-sender.provider';
import {clearInitialData, setupApplication, setupInitialData} from './test-helper';

const basePath = '/auth/passwordless';

describe('Passwordless Controller', () => {
  let app: TestingApplication;
  let client: Client;
  let userRepo: UserRepository;
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

  describe('otp', function () {
    it('should give status 204 for start passwordless', async () => {
      const reqData = {
        client_id: 'web',
        client_secret: 'test',
        key: 'test_user',
      };
      await client.post(`${basePath}/start`).send(reqData).expect(204);
    });

    it('should give status 401 when otp is incorrect', async () => {
      const reqSendOtpData = {
        client_id: 'web',
        client_secret: 'test',
        key: 'test_user',
      };
      await client.post(`${basePath}/start`).send(reqSendOtpData).expect(204);

      const reqVerifyOtpData = {
        key: 'test_user',
        otp: '000000',
      };
      const response = await client.post(`${basePath}/verify`).send(reqVerifyOtpData).expect(401);
      expect(response).to.have.property('error');
      expect(response.body.error.message).to.be.equal(AuthenticationErrors.OtpInvalid.message);
    });

    it('should give status 204 for start passwordless with new email', async () => {
      const reqData = {
        client_id: 'web',
        client_secret: 'test',
        key: 'new_user@example.com',
      };
      await client.post(`${basePath}/start`).send(reqData).expect(204);
    });

    it('should give status 200 for verify new email request if otp is correct', async () => {
      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';

      const reqDataForSendOtp = {
        client_id: 'web',
        client_secret: 'test',
        key: 'new_user@example.com',
      };
      await client.post(`${basePath}/start`).send(reqDataForSendOtp);

      const reqDataForVerifyOtp = {
        key: reqDataForSendOtp.key,
        otp: OtpCodeCache.get(reqDataForSendOtp.key),
      };
      const response = await client.post(`${basePath}/verify`).send(reqDataForVerifyOtp).expect(200);
      expect(response.body).to.have.property('code');
    });

    it('should give status 204 for start passwordless with new phone', async () => {
      const reqData = {
        client_id: 'web',
        client_secret: 'test',
        key: '+12673800457',
      };
      await client.post(`${basePath}/start`).send(reqData).expect(204);
    });

    it('should give status 200 for verify new phone request if otp is correct', async () => {
      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';

      const reqDataForSendOtp = {
        client_id: 'web',
        client_secret: 'test',
        key: '+12673800457',
      };
      await client.post(`${basePath}/start`).send(reqDataForSendOtp);

      const reqDataForVerifyOtp = {
        key: reqDataForSendOtp.key,
        otp: OtpCodeCache.get(reqDataForSendOtp.key),
      };
      const response = await client.post(`${basePath}/verify`).send(reqDataForVerifyOtp).expect(200);
      expect(response.body).to.have.property('code');
    });
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
