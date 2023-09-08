import * as AuthaStrategy from '@authajs/passport-autha';
import {IAuthUser} from '@bleco/authentication';
import {createStubInstance, expect, StubbedInstanceWithSinonAccessor} from '@loopback/testlab';
import {AuthProvider} from '@loopx/core';
import {
  User,
  UserCredentials,
  UserCredentialsRepository,
  UserCredentialsWithRelations,
  UserRepository,
  UserWithRelations,
} from '@loopx/user-core';
import sinon from 'sinon';

import {AuthaVerifyProvider} from '../../../modules/auth/';
import {AuthaSignUpFn} from '../../../providers';

describe('Autha Verify Provider', () => {
  let userRepo: StubbedInstanceWithSinonAccessor<UserRepository>;
  let userCredentialRepo: StubbedInstanceWithSinonAccessor<UserCredentialsRepository>;
  let authaVerifyProvider: AuthaVerifyProvider;

  const signupProvider: AuthaSignUpFn = async (prof: AuthaStrategy.Profile) => null;
  const preVerifyProvider = async (
    accToken: string,
    refToken: string,
    prof: AuthaStrategy.Profile,
    usr: IAuthUser | null,
  ) => usr;
  const postVerifyProvider = async (prof: AuthaStrategy.Profile, usr: IAuthUser | null) => usr;

  const accessToken = 'test_access_token';
  const refreshToken = 'test_refresh_token';
  const profile = {
    id: '1',
    email: 'xyz@gmail.com',
    _json: {
      email: 'xyz@gmail.com',
    },
  };

  const user = new User({
    id: '1',
    firstName: 'test',
    lastName: 'test',
    username: 'test_user',
    email: 'xyz@gmail.com',
    authClientIds: [1],
    dob: new Date(),
  });

  afterEach(() => sinon.restore());
  beforeEach(setUp);

  describe('autha oauth2 verify provider', () => {
    it('checks if provider returns a function', async () => {
      const result = authaVerifyProvider.value();
      expect(result).to.be.Function();
    });

    it('return error promise with bad profile', async () => {
      const func = authaVerifyProvider.value();
      const result = await func(accessToken, refreshToken, {}).catch(err => err.errorCode);
      expect(result).to.be.eql('invalid_credentials');
    });

    it('return error promise if there is no user cred', async () => {
      const findOne = userRepo.stubs.findOne;
      findOne.resolves(user as UserWithRelations);
      const func = authaVerifyProvider.value();
      const result = await func(accessToken, refreshToken, profile).catch(err => err.errorCode);
      expect(result).to.be.eql('invalid_credentials');
      sinon.assert.calledOnce(findOne);
    });

    it('return user after post verification', async () => {
      const userCred = new UserCredentials({
        id: '1',
        userId: '1',
        authProvider: AuthProvider.AUTHA,
        authId: '1',
      });
      const findOne = userRepo.stubs.findOne;
      findOne.resolves(user as UserWithRelations);
      const findTwo = userCredentialRepo.stubs.findOne;
      findTwo.resolves(userCred as UserCredentialsWithRelations);
      const func = authaVerifyProvider.value();
      const result = await func(accessToken, refreshToken, profile);
      expect(result).to.have.properties('id', 'firstName', 'lastName', 'username', 'email');
      expect(result?.username).to.be.eql('test_user');
      sinon.assert.calledOnce(findOne);
    });

    it('should support autha profile for internal creds', async () => {
      const userCred = new UserCredentials({
        id: '1',
        userId: '1',
        authProvider: AuthProvider.INTERNAL,
        authId: '__any_auth_id__',
      });
      const findOne = userRepo.stubs.findOne;
      findOne.resolves(user as UserWithRelations);
      const findTwo = userCredentialRepo.stubs.findOne;
      findTwo.resolves(userCred as UserCredentialsWithRelations);
      const func = authaVerifyProvider.value();
      const result = await func(accessToken, refreshToken, profile);
      expect(result).to.have.properties('id', 'firstName', 'lastName', 'username', 'email');
      expect(result?.username).to.be.eql('test_user');
      sinon.assert.calledOnce(findOne);
    });

    it('return reject autha profile if authId not matched', async () => {
      const userCred = new UserCredentials({
        id: '1',
        userId: '1',
        authProvider: AuthProvider.AUTHA,
        authId: '__any_auth_id__',
      });
      const findOne = userRepo.stubs.findOne;
      findOne.resolves(user as UserWithRelations);
      const findTwo = userCredentialRepo.stubs.findOne;
      findTwo.resolves(userCred as UserCredentialsWithRelations);
      const func = authaVerifyProvider.value();
      await expect(func(accessToken, refreshToken, profile)).rejectedWith('Invalid Credentials');
    });

    it('should reject autha profile except autha and internal auth provider', async () => {
      const userCred = new UserCredentials({
        id: '1',
        userId: '1',
        authProvider: AuthProvider.APPLE,
        authId: '__any_auth_id__',
      });
      const findOne = userRepo.stubs.findOne;
      findOne.resolves(user as UserWithRelations);
      const findTwo = userCredentialRepo.stubs.findOne;
      findTwo.resolves(userCred as UserCredentialsWithRelations);
      const func = authaVerifyProvider.value();
      await expect(func(accessToken, refreshToken, profile)).rejectedWith('Invalid Credentials');
    });
  });

  function setUp() {
    userRepo = createStubInstance(UserRepository);
    userCredentialRepo = createStubInstance(UserCredentialsRepository);
    authaVerifyProvider = new AuthaVerifyProvider(
      userRepo,
      userCredentialRepo,
      signupProvider,
      preVerifyProvider,
      postVerifyProvider,
    );
  }
});
