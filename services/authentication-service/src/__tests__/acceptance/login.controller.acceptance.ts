import {Client, expect} from '@loopback/testlab';

import {AuthenticationErrors} from '@bleco/authentication';

import {AuthErrors, AuthProvider} from '@loopx/core';

import {
  RefreshTokenRepository,
  RevokedTokenRepository,
  UserCredentialsRepository,
  UserLevelPermissionRepository,
  UserRepository,
} from '../../repositories';
import {TestingApplication} from '../fixtures/application';
import {TestHelperKey} from '../fixtures/keys';
import {TestHelperService} from '../fixtures/services';
import {clearInitialData, setupApplication, setupInitialData} from './test-helper';

describe('Login Controller', () => {
  let app: TestingApplication;
  let client: Client;
  let helper: TestHelperService;
  let userRepo: UserRepository;
  let userPermissionRepo: UserLevelPermissionRepository;
  let revokedTokenRepo: RevokedTokenRepository;
  let refreshTokenRepo: RefreshTokenRepository;
  let userCredentialsRepo: UserCredentialsRepository;
  const useragent = 'test';
  const deviceId = 'test';
  const useragentName = 'user-agent';
  const deviceIdName = 'device_id';
  beforeAll(async () => {
    ({app, client} = await setupApplication());
  });
  afterAll(async () => app.stop());
  beforeAll(givenUserRepository);
  beforeAll(givenUserPermissionRepository);
  beforeAll(givenRevokedTokenRepository);
  beforeAll(givenRefreshTokenRepository);
  beforeAll(givenUserCredentialsRepository);
  beforeAll(async () => {
    helper = await app.get(TestHelperKey);
  });
  beforeAll(setMockData);
  afterAll(deleteMockData);
  afterEach(async () => {
    await revokedTokenRepo.deleteAll();
  });
  afterEach(() => {
    delete process.env.JWT_ISSUER;
    delete process.env.JWT_SECRET;
    helper.reset();
  });
  it('should give status 422 for login request with no client credentials', async () => {
    const reqData = {};
    const response = await client.post(`/auth/login`).send(reqData).expect(422);
    expect(response).to.have.property('error');
  });
  it('should give status 422 for login request with no user credentials', async () => {
    const reqData = {
      clientId: 'web',
      clientSecret: 'blah',
    };
    const response = await client.post(`/auth/login`).send(reqData).expect(422);
    expect(response).to.have.property('error');
  });
  it('should give status 401 for login request with wrong client credentials', async () => {
    const reqData = {
      client_id: 'web1',
      client_secret: 'blah1',
      username: 'someuser',
      password: 'somepassword',
    };
    const response = await client.post(`/auth/login`).send(reqData).expect(401);
    expect(response).to.have.property('error');
  });
  it('should give status 401 for login request with wrong user credentials', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'someuser',
      password: 'somepassword',
    };
    const response = await client.post(`/auth/login`).send(reqData).expect(401);
    expect(response).to.have.property('error');
  });

  // we are not using this test case as we are not checking whether the user belonging to the client or not
  // TODO: enable this test case when we are checking whether the user belongs to the client or not
  it.skip('should give status 401 for login request with user credentials not belonging to client', async () => {
    const reqData = {
      client_id: 'mobile',
      client_secret: 'test',
      username: 'test_user',
      password: 'temp123!@',
    };
    const response = await client.post(`/auth/login`).send(reqData).expect(401);
    expect(response).to.have.property('error');
    expect(response.body.error.message).to.be.equal(AuthenticationErrors.ClientInvalid.message);
  });

  it('should give status 200 for login request', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
      password: 'temp123!@',
    };
    process.env.JWT_ISSUER = 'test';
    await client.post(`/auth/login`).send(reqData).expect(200);
  });

  it('should give status 200 for login request without client secret for public client', async () => {
    const reqData = {
      client_id: 'web',
      username: 'test_user',
      password: 'temp123!@',
    };
    process.env.JWT_ISSUER = 'test';
    await client.post(`/auth/login`).send(reqData).expect(200);
  });

  it('should give status 200 for login request even with wrong client secret for public client', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'wrong_secret',
      username: 'test_user',
      password: 'temp123!@',
    };
    process.env.JWT_ISSUER = 'test';
    await client.post(`/auth/login`).send(reqData).expect(200);
  });

  it('should return code in response', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
      password: 'temp123!@',
    };
    process.env.JWT_ISSUER = 'test';
    const reqForCode = await client.post(`/auth/login`).send(reqData).expect(200);
    expect(reqForCode.body).to.have.property('code');
  });

  it('should return refresh token, access token, expiresIn in response', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
      password: 'temp123!@',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await client.post(`/auth/login`).send(reqData).expect(200);
    const response = await client.post(`/auth/token`).set(deviceIdName, deviceId).set(useragentName, useragent).send({
      clientId: 'web',
      code: reqForCode.body.code,
    });
    expect(response.body).to.have.properties(['accessToken', 'refreshToken', 'expiresIn']);
  });

  it('should return refresh token and access token for token refresh request with Authorization header', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
      password: 'temp123!@',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await client.post(`/auth/login`).send(reqData).expect(200);
    const reqForToken = await client
      .post(`/auth/token`)
      .set(deviceIdName, deviceId)
      .set(useragentName, useragent)
      .send({
        clientId: 'web',
        code: reqForCode.body.code,
      });
    const response = await client
      .post(`/auth/token-refresh`)
      .send({
        refreshToken: reqForToken.body.refreshToken,
      })
      .set('Authorization', `Bearer ${reqForToken.body.accessToken}`);
    expect(response.body).to.have.properties(['accessToken', 'refreshToken']);
  });

  it('should return refresh token and access token for token refresh request with clientId', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
      password: 'temp123!@',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await client.post(`/auth/login`).send(reqData).expect(200);
    const reqForToken = await client
      .post(`/auth/token`)
      .set(deviceIdName, deviceId)
      .set(useragentName, useragent)
      .send({
        clientId: reqData.client_id,
        code: reqForCode.body.code,
      });
    expect(reqForToken.body).to.not.have.property('error');
    expect(reqForToken.body).to.have.properties(['accessToken', 'refreshToken']);
    const response = await client.post(`/auth/token-refresh`).send({refreshToken: reqForToken.body.refreshToken});
    expect(response.body).to.have.properties(['accessToken', 'refreshToken']);
  });

  it('should throw error when login for external user', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_teacher',
      password: 'temp123!@',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await client.post(`/auth/login`).send(reqData).expect(401);

    expect(reqForCode.body.error.message).to.equal(AuthenticationErrors.InvalidCredentials.message);
  });

  it('should change password successfully for internal user', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
      password: 'temp123!@',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await client.post(`/auth/login`).send(reqData).expect(200);
    const reqForToken = await client.post(`/auth/token`).send({
      clientId: 'web',
      code: reqForCode.body.code,
    });
    await client
      .patch(`/auth/change-password`)
      .set('Authorization', `Bearer ${reqForToken.body.accessToken}`)
      .send({
        username: 'test_user',
        password: 'new_test_password',
        refreshToken: reqForToken.body.refreshToken,
      })
      .expect(200);
  });

  it('should return refresh token and access token for token refresh request with new password', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
      password: 'new_test_password',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await client.post(`/auth/login`).send(reqData).expect(200);
    const reqForToken = await client
      .post(`/auth/token`)
      .set(deviceIdName, deviceId)
      .set(useragentName, useragent)
      .send({
        clientId: reqData.client_id,
        code: reqForCode.body.code,
      });
    const response = await client.post(`/auth/token-refresh`).send({refreshToken: reqForToken.body.refreshToken});
    expect(response.body).to.have.properties(['accessToken', 'refreshToken']);
  });

  it('should revert to previous password successfully for internal user', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
      password: 'new_test_password',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await client.post(`/auth/login`).send(reqData).expect(200);
    const reqForToken = await client.post(`/auth/token`).send({
      clientId: 'web',
      code: reqForCode.body.code,
    });
    await client
      .patch(`/auth/change-password`)
      .set('Authorization', `Bearer ${reqForToken.body.accessToken}`)
      .send({
        username: 'test_user',
        password: 'temp123!@',
        refreshToken: reqForToken.body.refreshToken,
      })
      .expect(200);
  });
  //
  // it('should return 401 for token refresh request when Authentication token invalid', async () => {
  //   const reqData = {
  //     client_id: 'web',
  //     client_secret: 'test',
  //     username: 'test_user',
  //     password: 'temp123!@',
  //   };
  //   process.env.JWT_ISSUER = 'test';
  //   process.env.JWT_SECRET = 'test';
  //   const reqForCode = await client.post(`/auth/login`).send(reqData).expect(200);
  //   const reqForToken = await client
  //     .post(`/auth/token`)
  //     .set(deviceIdName, deviceId)
  //     .set(useragentName, useragent)
  //     .send({
  //       clientId: 'web',
  //       code: reqForCode.body.code,
  //     });
  //   await client
  //     .post(`/auth/token-refresh`)
  //     .send({refreshToken: reqForToken.body.refreshToken})
  //     .set('Authorization', 'Bearer abc')
  //     .expect(401);
  // });

  // it('should return 400 for token refresh request when missing authentication token', async () => {
  //   const reqData = {
  //     client_id: 'web',
  //     client_secret: 'test',
  //     username: 'test_user',
  //     password: 'temp123!@',
  //   };
  //   process.env.JWT_ISSUER = 'test';
  //   process.env.JWT_SECRET = 'test';
  //   const reqForCode = await client.post(`/auth/login`).send(reqData).expect(200);
  //   const reqForToken = await client
  //     .post(`/auth/token`)
  //     .set(deviceIdName, deviceId)
  //     .set(useragentName, useragent)
  //     .send({
  //       clientId: 'web',
  //       code: reqForCode.body.code,
  //     });
  //   await client.post(`/auth/token-refresh`).send({refreshToken: reqForToken.body.refreshToken}).expect(400);
  // });

  it('should throw error if user does not belong to client id in forgot password request', async () => {
    const reqData = {
      client_id: 'web1',
      client_secret: 'test',
      username: 'test_user',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    const response = await client.post(`/auth/forget-password`).send(reqData).expect(401);
    expect(response.body.error.message).to.be.equal(AuthenticationErrors.ClientVerificationFailed.message);
  });

  it('should send forgot password request successfully', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    await client.post(`/auth/forget-password`).send(reqData).expect(204);
    const token = helper.get('TOKEN');
    expect(token).to.be.String();
    expect(token).to.not.be.equal('');
  });

  it('should throw error on forgot password request for external user', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_teacher',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    const response = await client.post(`/auth/forget-password`).send(reqData).expect(400);
    expect(response.body.error.message).to.be.equal(AuthErrors.PasswordCannotBeChanged.message);
  });

  it('should return empty response even if the user does not exist', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'testuser',
    };
    const response = await client.post(`/auth/forget-password`).send(reqData).expect(204);
    expect(response.body).to.be.empty();
  });
  it('should verify reset password token successfully', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    await client.post(`/auth/forget-password`).send(reqData).expect(204);
    const token = helper.get('TOKEN');
    expect(token).to.be.String();
    expect(token).to.not.be.equal('');
    await client.get(`/auth/verify-reset-password-link?token=${token}`).send().expect(200);
  });
  it('should give token missing error when no token passed in verify reset password', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    await client.post(`/auth/forget-password`).send(reqData).expect(204);
    const responseToken = await client.get(`/auth/verify-reset-password-link`).send().expect(400);
    expect(responseToken.body).to.have.properties('error');
  });
  it('should return error for token missing when no token passed in reset password', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    await client.post(`/auth/forget-password`).send(reqData).expect(204);
    const request = {
      client_id: 'web',
      client_secret: 'test',
      password: 'test123',
    };
    await client.patch(`/auth/reset-password`).send(request).expect(422);
  });
  it('should return error for password missing when new password not sent in reset password', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    await client.post(`/auth/forget-password`).send(reqData).expect(204);
    const token = helper.get('TOKEN');
    const request = {
      client_id: 'web',
      client_secret: 'test',
      token,
    };
    await client.patch(`/auth/reset-password`).send(request).expect(422);
  });
  it('should throw error when reset password to previous password', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    await client.post(`/auth/forget-password`).send(reqData).expect(204);
    const token = helper.get('TOKEN');
    const request = {
      client_id: 'web',
      client_secret: 'test',
      token,
      password: 'temp123!@',
    };
    await client.patch(`/auth/reset-password`).send(request).expect(401);
  });

  it('should reset password successfully', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    await client.post(`/auth/forget-password`).send(reqData).expect(204);
    const token = helper.get('TOKEN');
    const request = {
      client_id: 'web',
      client_secret: 'test',
      token,
      password: 'test123#@',
    };
    await client.patch(`/auth/reset-password`).send(request).expect(204);
  });

  it('should return true on logout', async () => {
    try {
      // ensure password is reset
      await userRepo.changePassword('test_user', 'test123#@');
    } catch (e) {
      // do nothing
    }

    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
      password: 'test123#@',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await client.post(`/auth/login`).send(reqData).expect(200);
    const reqForToken = await client
      .post(`/auth/token`)
      .set(deviceIdName, deviceId)
      .set(useragentName, useragent)
      .send({
        clientId: 'web',
        code: reqForCode.body.code,
      })
      .expect(200);
    await client
      .post(`/logout`)
      .set('Authorization', `Bearer ${reqForToken.body.accessToken}`)
      .send({
        refreshToken: reqForToken.body.refreshToken,
      })
      .expect(200);
  });
  it('should return error for wrong token on logout', async () => {
    const reqData = {
      client_id: 'web',
      client_secret: 'test',
      username: 'test_user',
      password: 'test123#@',
    };
    process.env.JWT_ISSUER = 'test';
    process.env.JWT_SECRET = 'test';
    const reqForCode = await client.post(`/auth/login`).send(reqData).expect(200);
    const reqForToken = await client
      .post(`/auth/token`)
      .set(deviceIdName, deviceId)
      .set(useragentName, useragent)
      .send({
        clientId: 'web',
        code: reqForCode.body.code,
      })
      .expect(200);
    await client
      .post(`/logout`)
      .set('Authorization', `Bearer ${reqForToken.body.accessToken}`)
      .send({
        refreshToken: 'aaaa',
      })
      .expect(401);
  });

  async function givenUserRepository() {
    userRepo = await app.getRepository(UserRepository);
  }

  async function givenUserPermissionRepository() {
    userPermissionRepo = await app.getRepository(UserLevelPermissionRepository);
  }

  async function givenUserCredentialsRepository() {
    userCredentialsRepo = await app.getRepository(UserCredentialsRepository);
  }

  async function givenRevokedTokenRepository() {
    revokedTokenRepo = await app.getRepository(RevokedTokenRepository);
  }

  async function givenRefreshTokenRepository() {
    refreshTokenRepo = await app.getRepository(RefreshTokenRepository);
  }

  async function deleteMockData() {
    await userCredentialsRepo.deleteAllHard();
    await userPermissionRepo.deleteAllHard();
    await refreshTokenRepo.deleteAll();
    await revokedTokenRepo.deleteAll();
    await clearInitialData(app);
  }

  async function setMockData() {
    const {testUser2} = await setupInitialData(app);

    await userRepo.credentials(testUser2.id).patch({
      authProvider: AuthProvider.KEYCLOAK,
      password: '',
    });
  }
});
