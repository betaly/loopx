import {ConditionalAuditRepositoryMixin, IAuditMixinOptions} from '@bleco/audit-log';
import {AuthenticationBindings, AuthenticationErrors} from '@bleco/authentication';
import {BindingScope, Getter, inject, injectable} from '@loopback/core';
import {Where} from '@loopback/filter/src/query';
import {
  BelongsToAccessor,
  DataObject,
  Entity,
  HasManyRepositoryFactory,
  HasOneRepositoryFactory,
  juggler,
  Options,
  repository,
} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {AuthErrors, DefaultUserUpdatableCrudRepository, IAuthTenantUser, UserStatus} from '@loopx/core';
import * as bcrypt from 'bcrypt';
import {BErrors} from 'berrors';

import {AuthProvider} from '../enums';
import {UserDataSourceName} from '../keys';
import {Tenant, User, UserCredentials, UserRelations, UserTenant} from '../models';
import {buildWhereClauseFromIdentifier} from '../utils';
import {AuditLogRepository} from './audit.repository';
import {TenantRepository} from './tenant.repository';
import {UserCredentialsRepository} from './user-credentials.repository';
import {UserTenantRepository} from './user-tenant.repository';

const saltRounds = 10;

export interface UserCreationOptions extends Options {
  authProvider?: string;
  authId?: string;
}

const UserAuditOpts: IAuditMixinOptions = {
  actionKey: 'User_Logs',
};

@injectable({scope: BindingScope.SINGLETON})
export class UserRepository extends ConditionalAuditRepositoryMixin(
  DefaultUserUpdatableCrudRepository<User, typeof User.prototype.id, UserRelations>,
  UserAuditOpts,
) {
  public readonly tenant: BelongsToAccessor<Tenant, typeof User.prototype.id>;

  public readonly credentials: HasOneRepositoryFactory<UserCredentials, typeof User.prototype.id>;

  public readonly userTenants: HasManyRepositoryFactory<UserTenant, typeof User.prototype.id>;

  constructor(
    @inject(`datasources.${UserDataSourceName}`)
    dataSource: juggler.DataSource,
    @repository.getter('AuditLogRepository')
    public getAuditLogRepository: Getter<AuditLogRepository>,
    @repository.getter('TenantRepository')
    protected tenantRepositoryGetter: Getter<TenantRepository>,
    @repository.getter('UserCredentialsRepository')
    protected userCredentialsRepositoryGetter: Getter<UserCredentialsRepository>,
    @repository.getter('UserTenantRepository')
    protected userTenantRepositoryGetter: Getter<UserTenantRepository>,
    @inject('models.User')
    private readonly user: typeof Entity & {prototype: User},
    @inject.getter(AuthenticationBindings.CURRENT_USER, {optional: true})
    getCurrentUser?: Getter<IAuthTenantUser | undefined>,
  ) {
    super(user, dataSource, getCurrentUser);
    this.userTenants = this.createHasManyRepositoryFactoryFor('userTenants', userTenantRepositoryGetter);
    this.registerInclusionResolver('userTenants', this.userTenants.inclusionResolver);
    this.credentials = this.createHasOneRepositoryFactoryFor('credentials', userCredentialsRepositoryGetter);
    this.registerInclusionResolver('credentials', this.credentials.inclusionResolver);
    this.tenant = this.createBelongsToAccessorFor('defaultTenant', tenantRepositoryGetter);
    this.registerInclusionResolver('defaultTenant', this.tenant.inclusionResolver);
  }

  async create(entity: DataObject<User>, options?: UserCreationOptions): Promise<User> {
    const user = await this.createWithoutCreds(entity, options);
    try {
      let creds: UserCredentials | undefined;
      const authProvider = options?.authProvider ?? AuthProvider.Internal;
      switch (authProvider) {
        case AuthProvider.Internal: {
          const password = process.env.USER_TEMP_PASSWORD
            ? await bcrypt.hash(process.env.USER_TEMP_PASSWORD as string, saltRounds)
            : undefined;
          creds = new UserCredentials({
            authProvider,
            password,
          });
          break;
        }
        default: {
          creds = new UserCredentials({
            authProvider,
            authId: options?.authId,
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

  async createWithoutCreds(entity: DataObject<User>, options?: UserCreationOptions): Promise<User> {
    if (!entity.username && !entity.email && !entity.phone) {
      throw new HttpErrors.BadRequest('Username or email or phone is required');
    }
    const or: Where<User>[] = [];
    if (entity.username) {
      or.push({username: entity.username});
    }
    if (entity.email) {
      or.push({email: entity.email});
    }
    if (entity.phone) {
      or.push({phone: entity.phone});
    }
    const userExists = await super.findOne({
      where: {or},
    });
    if (userExists) {
      throw new HttpErrors.BadRequest('User already exists');
    }
    return super.create(entity, options);
  }

  async verifyPassword(identifier: string, password: string): Promise<User> {
    // TODO - Check loginId is username or email or phone
    const user = await super.findOne({
      where: buildWhereClauseFromIdentifier(identifier),
    });
    const creds = user && (await this.credentials(user.id).get());
    if (!user || user.deleted || !creds?.password) {
      throw new AuthErrors.UserDoesNotExist();
    } else if (!(await bcrypt.compare(password, creds.password))) {
      throw new AuthenticationErrors.InvalidCredentials();
    } else if (process.env.USER_TEMP_PASSWORD && (await bcrypt.compare(password, process.env.USER_TEMP_PASSWORD))) {
      throw new AuthErrors.TempPasswordLoginDisallowed();
    } else {
      return user;
    }
  }

  async updatePassword(identifier: string, password: string, newPassword: string): Promise<User> {
    // TODO - Check loginId is username or email or phone
    const user = await super.findOne({
      where: buildWhereClauseFromIdentifier(identifier),
    });
    const creds = user && (await this.credentials(user.id).get());
    if (!user || user.deleted || !creds?.password) {
      throw new AuthErrors.UserDoesNotExist();
    } else if (creds.authProvider !== AuthProvider.Internal) {
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

  // used for initiation only
  async setPassword(identifier: string, newPassword: string): Promise<boolean> {
    const user = await super.findOne({
      where: buildWhereClauseFromIdentifier(identifier),
    });
    let creds;
    try {
      creds = user && (await this.credentials(user.id).get());
    } catch (e) {
      //do nothing
    }
    if (!user || user.deleted) {
      throw new BErrors.Unauthorized('User does not exist.');
    } else if (creds?.authProvider !== AuthProvider.Internal) {
      throw new BErrors.Unauthorized('User already signed up.');
    } else {
      // Do nothing
    }

    const password = await bcrypt.hash(newPassword, saltRounds);
    if (creds) {
      await this.credentials(user.id).patch({password});
    } else {
      await this.credentials(user.id).create({
        authProvider: AuthProvider.Internal,
        password,
      });
    }

    return true;
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
    });

    if (!user) {
      throw new BErrors.NotFound('User not found');
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
