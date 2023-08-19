import * as bcrypt from 'bcrypt';
import {BErrors} from 'berrors';

import {Getter, inject} from '@loopback/core';
import {Where} from '@loopback/filter/src/query';
import {
  BelongsToAccessor,
  DataObject,
  Filter,
  HasManyRepositoryFactory,
  HasOneRepositoryFactory,
  juggler,
  repository,
} from '@loopback/repository';
import {Options} from '@loopback/repository/src/common-types';
import {HttpErrors} from '@loopback/rest';

import {AuthenticationBindings, AuthenticationErrors} from '@bleco/authentication';

import {
  AuthErrors,
  AuthProvider,
  DefaultUserUpdatableCrudRepository,
  EntityClass,
  IAuthUserWithPermissions,
  ILogger,
  LOGGER,
  UserStatus,
} from '@loopx/core';

import {Tenant, User, UserCredentials, UserTenant, UserTypes} from '../models';
import {AuthDbSourceName} from '../types';
import {normalizePhoneNumber} from '../utils/phone';
import {OtpRepository} from './otp.repository';
import {TenantRepository} from './tenant.repository';
import {UserCredentialsRepository} from './user-credentials.repository';
import {UserTenantRepository} from './user-tenant.repository';

const saltRounds = 10;

export class UserRepository<U extends UserTypes = UserTypes> extends DefaultUserUpdatableCrudRepository<
  U['Model'],
  U['ID'],
  U['Relations']
> {
  public readonly credentials: HasOneRepositoryFactory<UserCredentials, U['ID']>;
  public readonly tenant: BelongsToAccessor<Tenant, U['ID']>;
  public readonly userTenants: HasManyRepositoryFactory<UserTenant, U['ID']>;

  constructor(
    @inject(`datasources.${AuthDbSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter(UserCredentialsRepository)
    getUserCredsRepository: Getter<UserCredentialsRepository>,
    @repository.getter(OtpRepository)
    public getOtpRepository: Getter<OtpRepository>,
    @repository.getter('TenantRepository')
    protected tenantRepositoryGetter: Getter<TenantRepository>,
    @repository.getter('UserTenantRepository')
    protected userTenantRepositoryGetter: Getter<UserTenantRepository>,
    @inject(LOGGER.LOGGER_INJECT)
    private readonly logger: ILogger,
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthUserWithPermissions | undefined>,
    entityClass: EntityClass<U['Model']> = User,
  ) {
    super(entityClass, dataSource, getCurrentUser);
    this.userTenants = this.createHasManyRepositoryFactoryFor('userTenants', userTenantRepositoryGetter);
    this.registerInclusionResolver('userTenants', this.userTenants.inclusionResolver);
    this.tenant = this.createBelongsToAccessorFor('defaultTenant', tenantRepositoryGetter);
    this.registerInclusionResolver('defaultTenant', this.tenant.inclusionResolver);
    this.credentials = this.createHasOneRepositoryFactoryFor('credentials', getUserCredsRepository);
    this.registerInclusionResolver('credentials', this.credentials.inclusionResolver);
  }

  async create(entity: DataObject<U['Model']>, options?: Options): Promise<U['Model']> {
    options = options ?? {};
    if (!entity.username && !entity.email && !entity.phone) {
      throw new HttpErrors.BadRequest('Username or email or phone is required');
    }
    // Here "User" just for type
    const or: Where<User>[] = [];
    if (entity.username) {
      or.push({username: entity.username as string});
    }
    if (entity.email) {
      or.push({email: entity.email});
    }
    if (entity.phone) {
      or.push({phone: normalizePhoneNumber(entity.phone as string)});
    }
    const userExists = await super.findOne({
      where: {or},
    });
    if (userExists) {
      throw new HttpErrors.BadRequest('User already exists');
    }
    const user = await super.create(entity, options);
    try {
      let creds: UserCredentials | undefined;
      const authProvider = options.authProvider ?? (options.authId ? 'keycloak' : 'internal');
      const authId = options.authId;

      switch (authProvider) {
        case 'internal': {
          const password = options.password ?? process.env.USER_TEMP_PASSWORD;
          if (!password) {
            throw new HttpErrors.UnprocessableEntity('Password is required');
          }
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          creds = new UserCredentials({
            authProvider: 'internal',
            password: hashedPassword,
          });
          break;
        }
        default: {
          creds = new UserCredentials({
            authProvider,
            authId,
          });
          break;
        }
      }

      await this.credentials(user.id).create(creds, options);
    } catch (err) {
      await super.deleteByIdHard(user.id);
      throw new HttpErrors.UnprocessableEntity('Error while hashing password');
    }
    return user;
  }

  async createWithoutCreds(entity: DataObject<U['Model']>, options?: Options): Promise<U['Model']> {
    return super.create(entity, options);
  }

  async verifyPassword(username: string, password: string): Promise<U['Model']> {
    const user = await super.findOne({
      where: {username: username.toLowerCase()},
    } as Filter<U['Model']>);
    const creds = user && (await this.credentials(user.id).get());
    if (!user || user.deleted) {
      throw new AuthErrors.UserDoesNotExist();
    } else if (
      !creds?.password ||
      creds.authProvider !== AuthProvider.INTERNAL ||
      !(await bcrypt.compare(password, creds.password))
    ) {
      this.logger.error('User creds not found in DB or is invalid');
      throw new AuthenticationErrors.InvalidCredentials();
    } else {
      return user;
    }
  }

  async updatePassword(username: string, password: string, newPassword: string): Promise<U['Model']> {
    const user = await super.findOne({where: {username}} as Filter<U['Model']>);
    const creds = user && (await this.credentials(user.id).get());
    if (!user || user.deleted || !creds || !creds.password) {
      throw new AuthErrors.UserDoesNotExist();
    } else if (creds.authProvider !== AuthProvider.INTERNAL) {
      throw new AuthErrors.PasswordCannotBeChanged();
    } else if (!(await bcrypt.compare(password, creds.password))) {
      throw new AuthenticationErrors.WrongPassword();
    } else if (await bcrypt.compare(newPassword, creds.password)) {
      throw new BErrors.Unauthorized('Password cannot be same as previous password!');
    } else {
      // Do nothing
    }
    await this.credentials(user.id).patch({
      password: await bcrypt.hash(newPassword, saltRounds),
    });
    return user;
  }

  async changePassword(username: string, newPassword: string, oldPassword?: string): Promise<U['Model']> {
    const user = await super.findOne({where: {username}} as Filter<U['Model']>);
    const creds = user && (await this.credentials(user.id).get());

    if (oldPassword) {
      // This method considers old password as OTP
      const otp = await (await this.getOtpRepository()).get(username);
      if (!otp || otp.otp !== oldPassword) {
        throw new AuthenticationErrors.WrongPassword();
      }
    }

    if (creds?.authProvider !== AuthProvider.INTERNAL) {
      throw new AuthErrors.PasswordCannotBeChanged();
    }

    if (!user || user.deleted || !creds || !creds.password) {
      throw new AuthErrors.UserDoesNotExist();
    } else if (await bcrypt.compare(newPassword, creds.password)) {
      throw new BErrors.Unauthorized('Password cannot be same as previous password!');
    } else {
      // DO nothing
    }
    await this.credentials(user.id).patch({
      password: await bcrypt.hash(newPassword, saltRounds),
    });
    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await super.updateById(
      userId,
      {
        lastLogin: Date.now(),
      },
      {
        currentUser: {id: userId},
      },
    );
  }

  async firstTimeUser(userId: string): Promise<boolean> {
    const user = await super.findOne({
      where: {
        id: userId,
      },
    } as Filter<U['Model']>);

    if (!user) {
      throw new AuthErrors.UserDoesNotExist();
    }

    const userTenant = await (
      await this.userTenantRepositoryGetter()
    ).findOne({
      where: {
        userId,
        tenantId: user.defaultTenantId,
        status: {
          inq: [UserStatus.REGISTERED, UserStatus.PASSWORD_CHANGE_NEEDED],
        },
      },
    });
    return !!userTenant;
  }
}
