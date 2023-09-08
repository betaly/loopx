import {AuthenticationErrors} from '@bleco/authentication';
import {Client, expect} from '@loopback/testlab';
import {AuthProvider} from '@loopx/core';
import {UserRepository} from '@loopx/user-core';

import {TestingApplication} from '../fixtures/application';
import {OtpCodeCache} from '../fixtures/providers/otp-sender.provider';
import {clearInitialData, setupApplication, setupInitialData} from './test-helper';

describe('OTP Controller', () => {
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

  describe('qrCode', function () {
    it('should give status 401 for get qrCode request without client_id', async () => {
      const response = await client.get(`/auth/check-qr-code`).set('code', 'test_code').expect(401);
      expect(response).to.have.property('error');
      expect(response.body.error.message).to.be.equal(AuthenticationErrors.ClientInvalid.message);
    });
    it('should give status 401 for get qrCode request without code', async () => {
      const response = await client.get(`/auth/check-qr-code`).set('clientId', 'web').expect(401);
      expect(response).to.have.property('error');
      expect(response.body.error.message).to.be.equal(AuthenticationErrors.TokenInvalid.message);
    });
    it('should give status 401 for get qrCode request with wrong client_id', async () => {
      const response = await client
        .get(`/auth/check-qr-code`)
        .set('code', 'test_code')
        .set('clientId', 'wrong_id')
        .expect(401);
      expect(response).to.have.property('error');
      expect(response.body.error.message).to.be.equal(AuthenticationErrors.ClientInvalid.message);
    });
    it('should have property isGenerated', async () => {
      const reqData = {
        client_id: 'web',
        client_secret: 'test',
        username: 'test_user',
        password: 'temp123!@',
      };
      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';
      const reqForCode = await client.post(`/auth/login`).send(reqData).expect(200);
      const response = await client.get(`/auth/check-qr-code`).set('code', reqForCode.body.code).set('clientId', 'web');
      expect(response.body).to.have.property('isGenerated');
    });

    it('should give status 401 for post qrCode request with wrong clientId', async () => {
      const response = await client
        .post(`/auth/create-qr-code`)
        .send({
          clientId: 'wrong client id',
          code: 'test_code',
        })
        .expect(401);
      expect(response).to.have.property('error');
      expect(response.body.error.message).to.be.equal(AuthenticationErrors.ClientInvalid.message);
    });
    it('should give status 401 for post qrCode request with incorrect code', async () => {
      const response = await client
        .post(`/auth/create-qr-code`)
        .send({
          clientId: 'web',
          code: 'incorrect_code',
        })
        .expect(401);
      expect(response).to.have.property('error');
      expect(response.body.error.message).to.be.equal(AuthenticationErrors.InvalidCredentials.message);
    });
    it('should have property qrCode', async () => {
      const reqData = {
        client_id: 'web',
        client_secret: 'test',
        username: 'test_user',
        password: 'temp123!@',
      };
      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';
      const reqForCode = await client.post(`/auth/login`).send(reqData).expect(200);
      const response = await client.post(`/auth/create-qr-code`).send({
        clientId: 'web',
        code: reqForCode.body.code,
      });
      expect(response.body).to.have.property('qrCode');
    });
  });

  describe('otp', function () {
    it('should give status 204 for send-otp request', async () => {
      const reqData = {
        client_id: 'web',
        client_secret: 'test',
        key: 'test_user',
      };
      await client.post(`/auth/send-otp`).send(reqData).expect(204);
    });

    it('should give status 401 when otp is incorrect', async () => {
      const reqSendOtpData = {
        client_id: 'web',
        client_secret: 'test',
        key: 'test_user',
      };
      await client.post(`/auth/send-otp`).send(reqSendOtpData).expect(204);

      const reqVerifyOtpData = {
        key: 'test_user',
        otp: '000000',
      };
      const response = await client.post(`/auth/verify-otp`).send(reqVerifyOtpData).expect(401);
      expect(response).to.have.property('error');
      expect(response.body.error.message).to.be.equal(AuthenticationErrors.OtpInvalid.message);
    });

    it('should give status 200 when otp is correct', async () => {
      const reqSendOtpData = {
        client_id: 'web',
        client_secret: 'test',
        key: 'test_user',
      };
      await client.post(`/auth/send-otp`).send(reqSendOtpData).expect(204);

      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';

      const reqVerifyOtpData = {
        key: reqSendOtpData.key,
        otp: OtpCodeCache.get(reqSendOtpData.key),
      };
      const response = await client.post(`/auth/verify-otp`).send(reqVerifyOtpData).expect(200);
      expect(response.body).to.have.property('code');
    });

    it('should give status 401 for send-otp request with email that not registered', async () => {
      const reqData = {
        client_id: 'web',
        client_secret: 'test',
        key: 'new_user@example.com',
      };
      await client.post(`/auth/send-otp`).send(reqData).expect(401);
    });

    it('should give status 401 for send-otp request with phone number that not registered', async () => {
      const reqData = {
        client_id: 'web',
        client_secret: 'test',
        key: '12673800457',
      };
      await client.post(`/auth/send-otp`).send(reqData).expect(401);
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
