import {AuthenticationErrors} from '@bleco/authentication';
import {createStubInstance, expect, StubbedInstanceWithSinonAccessor} from '@loopback/testlab';
import {AuthClient, User, UserRepository, UserWithRelations} from '@loopx/user-core';
import {BErrors} from 'berrors';
import sinon from 'sinon';

import {OtpCache} from '../../../models';
import {OtpResponse, OtpVerifyProvider} from '../../../modules/auth';
import {OtpCacheRepository} from '../../../repositories';
import {OtpService} from '../../../services';

describe('OTP Verify Provider', () => {
  let userRepo: StubbedInstanceWithSinonAccessor<UserRepository>;
  let otpRepo: StubbedInstanceWithSinonAccessor<OtpCacheRepository>;
  let otpVerifyProvider: OtpVerifyProvider;
  let otpService: OtpService;
  const client = new AuthClient({
    id: 1,
    clientId: 'clientId',
    clientSecret: 'clientSecret',
    secret: 'dummy',
    accessTokenExpiration: 1800,
    refreshTokenExpiration: 1800,
    authCodeExpiration: 1800,
  });
  const logger = {
    log,
    info,
    warn,
    error,
    debug,
  };
  const user = new User({
    id: '1',
    username: 'test_user',
    email: 'xyz@gmail.com',
    authClientIds: [1],
    dob: new Date(),
  });

  afterEach(() => sinon.restore());
  beforeEach(setUp);

  describe('otp verify provider', () => {
    it('checks if provider returns a function', async () => {
      const result = otpVerifyProvider.value();
      expect(result).to.be.Function();
    });

    it('checks if provider throws error if OTP is incorrect', async () => {
      const username = 'test_user';
      const otp = '000000';
      const findOne = userRepo.stubs.findOne;
      findOne.resolves(user as UserWithRelations);

      const otpCache = {
        otpSecret: 'i6im0gc96j0mn00c',
      };
      const otpCacheGet = otpRepo.stubs.get;
      otpCacheGet.resolves(otpCache as OtpCache);

      const func = otpVerifyProvider.value();
      try {
        await func(username, otp);
      } catch (err) {
        expect(err).to.be.instanceOf(BErrors.Error);
        expect(err.message).to.be.equal(AuthenticationErrors.OtpInvalid.message);
      }
    });

    it('checks if provider throws error if OTP secret is not found in cache', async () => {
      const username = 'test_user';
      const otp = '000000';
      const findOne = userRepo.stubs.findOne;
      findOne.resolves(user as UserWithRelations);

      const otpCacheGet = otpRepo.stubs.get;
      otpCacheGet.resolves(undefined);

      const func = otpVerifyProvider.value();
      try {
        await func(username, otp);
      } catch (err) {
        expect(err).to.be.instanceOf(BErrors.Error);
        expect(err.message).to.be.equal(AuthenticationErrors.OtpExpired.message);
      }
    });

    it('checks if provider throws error if username is incorrect', async () => {
      const username = 'test_user';
      const otp = '000000';
      const findOne = userRepo.stubs.findOne;
      findOne.resolves(null);

      const func = otpVerifyProvider.value();
      try {
        await func(username, otp);
      } catch (err) {
        expect(err).to.be.instanceOf(BErrors.Error);
        expect(err.message).to.be.equal(AuthenticationErrors.InvalidCredentials.message);
      }
    });
  });

  function log() {
    // This is intentional
  }

  function info() {
    // This is intentional
  }

  function warn() {
    // This is intentional
  }

  function error() {
    // This is intentional
  }

  function debug() {
    // This is intentional
  }

  function otpSenderFn(): Promise<OtpResponse> {
    return {} as Promise<OtpResponse>;
  }

  function setUp() {
    userRepo = createStubInstance(UserRepository);
    otpRepo = createStubInstance(OtpCacheRepository);
    otpService = new OtpService(otpRepo, userRepo, otpSenderFn, logger);
    otpVerifyProvider = new OtpVerifyProvider(userRepo, otpRepo, client, otpService, logger);
  }
});
