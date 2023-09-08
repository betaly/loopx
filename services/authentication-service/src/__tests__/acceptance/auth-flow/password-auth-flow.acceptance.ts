import {Client, createRestAppClient, expect} from '@loopback/testlab';
import {UserCredentialsRepository, UserLevelPermissionRepository} from '@loopx/user-core';

import {RefreshTokenRepository} from '../../../repositories';
import {TestingApplication} from '../../fixtures/application';
import {TestHelperKey} from '../../fixtures/keys';
import {TestHelperService} from '../../fixtures/services';
import {clearInitialData, setupApplication, setupInitialData} from '../test-helper';

const signupBasePath = '/auth/signup';

describe('Password Auth Flow', () => {
  let app: TestingApplication;
  let client: Client;
  let helper: TestHelperService;
  let userPermissionRepository: UserLevelPermissionRepository;
  let refreshTokenRepository: RefreshTokenRepository;
  let userCredentialsRepository: UserCredentialsRepository;
  const sampleEmail = 'abc@example.com';
  const useragent = 'test';
  const deviceId = 'test';
  const useragentName = 'user-agent';
  const deviceIdName = 'device_id';
  beforeAll(async () => {
    ({app, client} = await setupApplication());
  });
  afterAll(async () => app.stop());
  beforeAll(givenUserPermissionRepository);
  beforeAll(givenRefreshTokenRepository);
  beforeAll(givenUserCredentialsRepository);
  beforeAll(async () => {
    client = createRestAppClient(app);
    helper = await app.get(TestHelperKey);
  });
  beforeAll(setMockData);
  afterAll(deleteMockData);
  afterEach(() => {
    delete process.env.JWT_ISSUER;
    delete process.env.JWT_SECRET;
    helper.reset();
  });

  it('should signup and login with password', async () => {
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';

    // 1. signup with email and password
    // 1.1 submit signup request and send signup token
    const reqSignupForToken = {
      client_id: 'web',
      client_secret: 'test',
      email: sampleEmail,
    };
    await client.post(`${signupBasePath}/create-token`).send(reqSignupForToken).expect(204);

    const reqSignup = {
      clientId: 'web',
      email: sampleEmail,
      password: 'test_password',
    };

    // 1.2 signup with token
    // in real world, the use should get the token as link from email
    const token = helper.get('TOKEN');

    let response = await client
      .post(`${signupBasePath}/create-user`)
      .set('Authorization', `Bearer ${token}`)
      .send(reqSignup)
      .expect(200);
    expect(response.body).to.have.properties(['user', 'email']);
    expect(response.body.email).to.be.equal(sampleEmail);

    // 2. login with email and password
    // 2.1 get login code
    const reqLogin = {
      client_id: 'web',
      client_secret: 'test',
      username: sampleEmail,
      password: 'test_password',
    };
    const resWithCode = await client.post(`/auth/login`).send(reqLogin).expect(200);
    expect(resWithCode.body).to.have.property('code');

    // 2.2 get token with login code
    response = await client.post(`/auth/token`).set(deviceIdName, deviceId).set(useragentName, useragent).send({
      clientId: 'web',
      code: resWithCode.body.code,
    });
    expect(response.body).to.have.properties(['accessToken', 'refreshToken', 'expiresIn']);
  });

  async function givenUserPermissionRepository() {
    userPermissionRepository = await app.getRepository(UserLevelPermissionRepository);
  }

  async function givenUserCredentialsRepository() {
    userCredentialsRepository = await app.getRepository(UserCredentialsRepository);
  }

  async function givenRefreshTokenRepository() {
    refreshTokenRepository = await app.getRepository(RefreshTokenRepository);
  }

  async function deleteMockData() {
    await userCredentialsRepository.deleteAllHard();
    await userPermissionRepository.deleteAllHard();
    await refreshTokenRepository.deleteAll();
    await clearInitialData(app);
  }

  async function setMockData() {
    await setupInitialData(app);
  }
});
