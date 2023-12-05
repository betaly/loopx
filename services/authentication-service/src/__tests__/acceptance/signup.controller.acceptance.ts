import {Client, expect} from '@loopback/testlab';
import {randomBytes} from 'crypto';

import {TestingApplication} from '../fixtures/application';
import {TestHelperKey} from '../fixtures/keys';
import {TestHelperService} from '../fixtures/services';
import {clearInitialData, setupApplication, setupInitialData} from './test-helper';

describe('SignUp Request Controller', () => {
  let app: TestingApplication;
  let client: Client;
  let helper: TestHelperService;
  const basePath = '/auth/signup';
  const sampleEmail = 'xyz-signup@gmail.com';
  const reqData = {
    client_id: 'web',
    client_secret: 'test',
    email: sampleEmail,
  };

  beforeAll(async () => {
    ({app, client} = await setupApplication());
    helper = await app.get(TestHelperKey);
    await setupInitialData(app);
  });
  afterAll(async () => {
    await clearInitialData(app);
    helper.reset();
    return app.stop();
  });

  afterEach(() => {
    delete process.env.JWT_ISSUER;
    delete process.env.JWT_SECRET;
  });

  describe('signup fast', function () {
    it('gives UsernameTooShort error for signup', async () => {
      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';
      const signupReqData = {
        client_id: 'web',
        client_secret: 'test',
        username: 'abc',
        email: 'john@example.com',
        password: 'test_password',
      };
      const response = await client.post(`${basePath}/fast`).send(signupReqData).expect(400);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.have.property('data');
      expect(response.body.error.name).to.be.equal('UsernameTooShortError');
      expect(response.body.error.errorCode).to.be.equal('username_too_short');
      expect(response.body.error.meta).to.have.property('minLength');
    });

    it('gives UsernameTooLong error for signup', async () => {
      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';
      const signupReqData = {
        client_id: 'web',
        client_secret: 'test',
        username: randomBytes(32).toString('hex'),
        email: 'john@example.com',
        password: 'test_password',
      };
      const response = await client.post(`${basePath}/fast`).send(signupReqData).expect(400);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.have.property('data');
      expect(response.body.error.name).to.be.equal('UsernameTooLongError');
      expect(response.body.error.errorCode).to.be.equal('username_too_long');
      expect(response.body.error.meta).to.have.property('maxLength');
    });

    it('gives UsernameExists error for signup', async () => {
      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';
      const signupReqData = {
        client_id: 'web',
        client_secret: 'test',
        username: 'test_user',
        email: 'john@example.com',
        password: 'test_password',
      };
      const response = await client.post(`${basePath}/fast`).send(signupReqData).expect(400);
      expect(response.body).to.have.property('error');
      expect(response.body.error).not.to.have.property('data');
      expect(response.body.error.name).to.be.equal('UsernameExistsError');
      expect(response.body.error.errorCode).to.be.equal('username_exists');
    });

    it('gives PasswordStrengthError error for signup', async () => {
      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';
      const signupReqData = {
        client_id: 'web',
        client_secret: 'test',
        username: 'john',
        email: 'john@example.com',
        password: '1234567',
      };
      const response = await client.post(`${basePath}/fast`).send(signupReqData).expect(400);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.have.property('data');
      expect(response.body.error.name).to.be.equal('PasswordStrengthError');
      expect(response.body.error.errorCode).to.be.equal('password_strength_error');
      expect(response.body.error.meta).to.deepEqual([
        {
          message: 'At least %d characters in length',
          format: [8],
          code: 'lengthAtLeast',
          verified: false,
        },
      ]);
    });

    it('gives InvalidEmail error for signup', async () => {
      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';
      const signupReqData = {
        client_id: 'web',
        client_secret: 'test',
        username: 'john',
        email: 'john@example',
        password: 'test_password',
      };
      const response = await client.post(`${basePath}/fast`).send(signupReqData).expect(400);
      expect(response.body).to.have.property('error');
      expect(response.body.error.name).to.be.equal('InvalidEmailError');
      expect(response.body.error.errorCode).to.be.equal('invalid_email');
    });

    it('gives EmailExists error for signup', async () => {
      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';
      const signupReqData = {
        client_id: 'web',
        client_secret: 'test',
        username: 'john',
        email: 'xyz@gmail.com',
        password: 'test_password',
      };
      const response = await client.post(`${basePath}/fast`).send(signupReqData).expect(400);
      expect(response.body).to.have.property('error');
      expect(response.body.error.name).to.be.equal('EmailExistsError');
      expect(response.body.error.errorCode).to.be.equal('email_exists');
    });

    it('gives InvalidPhone error for signup', async () => {
      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';
      const signupReqData = {
        client_id: 'web',
        client_secret: 'test',
        username: 'john',
        email: 'john@gmail.com',
        phone: '123',
        password: 'test_password',
      };
      const response = await client.post(`${basePath}/fast`).send(signupReqData).expect(400);
      expect(response.body).to.have.property('error');
      expect(response.body.error.name).to.be.equal('InvalidPhoneError');
      expect(response.body.error.errorCode).to.be.equal('invalid_phone');
    });

    it('gives PhoneExists error for signup', async () => {
      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';
      const signupReqData = {
        client_id: 'web',
        client_secret: 'test',
        username: 'john',
        email: 'john@gmail.com',
        phone: '+8613012345678',
        password: 'test_password',
      };
      const response = await client.post(`${basePath}/fast`).send(signupReqData).expect(400);
      expect(response.body).to.have.property('error');
      expect(response.body.error.name).to.be.equal('PhoneExistsError');
      expect(response.body.error.errorCode).to.be.equal('phone_exists');
    });

    it('gives status 200 and tokens for /signup/fast', async () => {
      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';
      const signupReqData = {
        client_id: 'web',
        client_secret: 'test',
        username: 'john',
        email: 'john@example.com',
        password: 'test_password',
      };
      const response = await client.post(`${basePath}/fast`).send(signupReqData).expect(200);
      expect(response.body).to.have.properties(['code']);
    });
  });

  describe('signup with two steps', function () {
    it('gives status 200 when token is created', async () => {
      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';
      await client.post(`${basePath}/create-token`).send(reqData).expect(204);
    });

    it('gives status 204 when token is created', async () => {
      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';
      await client.post(`${basePath}/create-token`).send(reqData).expect(204);
      const token = helper.get('TOKEN');
      const email = helper.get('EMAIL');
      expect(token).to.be.String();
      expect(token).to.not.be.equal('');
      expect(email).to.be.equal(reqData.email);
    });

    it('gives status 204 and user details for creating user', async () => {
      process.env.JWT_ISSUER = 'test';
      process.env.JWT_SECRET = 'test';
      await client.post(`${basePath}/create-token`).send(reqData).expect(204);
      const reqDta = {
        email: sampleEmail,
        password: 'test_password',
      };
      const token = helper.get('TOKEN');
      const response = await client
        .post(`${basePath}/create-user`)
        .set('Authorization', `Bearer ${token}`)
        .send(reqDta)
        .expect(200);
      expect(response.body).to.have.properties(['user', 'email']);
      expect(response.body.email).to.be.equal(sampleEmail);
    });
  });
});
