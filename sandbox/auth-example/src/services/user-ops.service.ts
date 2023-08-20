import bcrypt from 'bcrypt';
import {BErrors} from 'berrors';

import {assert} from 'tily/assert';

import {inject} from '@loopback/context';
import {BindingScope, Getter, injectable} from '@loopback/core';
import {Where} from '@loopback/filter';
import {AnyObject, Options, repository} from '@loopback/repository';
import {
  AuthSecureClientRepository,
  Role,
  RoleRepository,
  Tenant,
  User,
  UserCredentials,
  UserRepository,
  UserTenantRepository,
  UserTenantServiceBindings,
} from '@loopx/user-service';
import {AuthErrors, ILogger, LOGGER, UserStatus} from '@loopx/core';
import {UserDto} from '../models/user.dto';
import {AuthExampleBindings} from '../keys';

const saltRounds = 10;

@injectable({scope: BindingScope.TRANSIENT})
export class UserOpsService {
  constructor(
    @inject(LOGGER.LOGGER_INJECT)
    readonly logger: ILogger,
    @repository(RoleRepository)
    private readonly roleRepository: RoleRepository,
    @repository(UserRepository)
    private readonly userRepository: UserRepository,
    @repository(UserTenantRepository)
    private readonly utRepository: UserTenantRepository,
    @repository(AuthSecureClientRepository)
    private readonly authClientsRepository: AuthSecureClientRepository,
    @inject.getter(UserTenantServiceBindings.DEFAULT_TENANT)
    private readonly getDefaultTenant: Getter<Tenant>,
    @inject.getter(AuthExampleBindings.DEFAULT_ROLE)
    private readonly getDefaultRole: Getter<Role>,
  ) {}

  async createUser(userData: UserDto, options?: AnyObject) {
    this.validateUserCreation(userData, options);

    if (!userData.username && !userData.phone && !userData.email) {
      throw new BErrors.BadRequest('username or phone number or email is required');
    }

    // username is optional, if not provided, use phone or email.
    // username should be specified from request
    if (!userData.username) {
      userData.username = (userData.phone ?? userData.email)!;
    }

    // guard user.username
    assert(userData.username, 'username is required');

    // set default tenant id if not provided
    if (!userData.tenantId) {
      userData.tenantId = (await this.getDefaultTenant()).id;
    }

    // set default role id if not provided
    if (!userData.roleId) {
      userData.roleId = (await this.getDefaultRole()).id;
    }
    const role: Role = await this.roleRepository.findById(userData.roleId);

    const orUserExists: Where<User>[] = [{username: userData.username}];

    if (userData.phone) {
      orUserExists.push({phone: userData.phone});
    }
    if (userData.email) {
      orUserExists.push({email: userData.email});
    }

    const foundUser = await this.userRepository.findOne({
      where: {
        or: orUserExists,
      },
    });
    if (foundUser) {
      const userTenantExists = await this.utRepository.findOne({
        where: {
          userId: foundUser.id,
          tenantId: userData.tenantId,
        },
      });
      if (userTenantExists) {
        throw new BErrors.BadRequest('User already exists');
      }
      await this.createUserTenantData(userData, UserStatus.ACTIVE, foundUser?.id, options);
      this.logger.debug(`User already exists, returning existing user. [${foundUser.email ?? foundUser.phone}]`);
      return foundUser;
    }

    const authClients = await this.authClientsRepository.find({
      where: {
        clientId: {
          inq: role.allowedClients,
        },
      },
    });
    const authClientIds = authClients.map(client => client.id!).filter(i => i !== undefined);

    const username = userData.username ?? userData.phone ?? userData.email;
    userData.username = username.toLowerCase();

    //Override default tenant id
    const userSaved = await this.userRepository.createWithoutCreds(
      {
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        defaultTenantId: userData.tenantId,
        authClientIds,
      },
      options,
    );

    await this.createUserTenantData(userData, UserStatus.ACTIVE, userSaved?.id, options);

    // password is not required for passwordless login
    const upn = userData.username ?? userData.phone ?? userData.email;
    if (userData.password) {
      await this.setPassword(upn, userData.password);
    } else {
      await this.setCredentials(upn, options);
    }

    this.logger.debug(`User created successfully. [${userSaved.username}]`);

    return userSaved;
  }

  validateUserCreation(userData: UserDto, options?: AnyObject) {
    if (!userData.email && !userData.phone && !userData.username) {
      throw new BErrors.BadRequest('Username, email or phone number is required');
    }

    if (userData.email) {
      // Check for valid email
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
      if (!emailRegex.test(userData.email)) {
        throw new BErrors.BadRequest('Email invalid.');
      }

      // Check for allowed domains
      const allowedDomains = (process.env.AUTO_SIGNUP_DOMAINS ?? '').split(',');
      const emailDomain = userData.email.split('@')[1];
      if (!(emailDomain && allowedDomains.length > 0)) {
        throw new BErrors.BadRequest('Domain not supported, please enter a valid email');
      }

      if (allowedDomains && allowedDomains.length === 1 && allowedDomains[0] === '*' && options) {
        options.authProvider = options.authProvider || 'keycloak';
      } else if (!allowedDomains.includes(emailDomain) && options) {
        options.authProvider = options.authProvider || 'internal';
      } else {
        // Do nothing
      }
    }

    if (userData.phone) {
      const e164RegEx = /^\+?[1-9]\d{1,14}$/;

      if (!e164RegEx.test(userData.phone)) {
        throw new BErrors.BadRequest('Phone number invalid.');
      }
    }
  }

  async createUserTenantData(userData: UserDto, userStatus: UserStatus, userId?: string, options?: AnyObject) {
    return this.utRepository.create(
      {
        roleId: userData.roleId,
        status: userStatus,
        tenantId: userData.tenantId,
        userId,
      },
      options,
    );
  }

  async setPassword(upnOrUser: string | User, newPassword: string): Promise<boolean> {
    if (!upnOrUser) {
      throw new BErrors.Unauthorized('UPN or user  is required');
    }
    if (!newPassword) {
      throw new BErrors.Unauthorized('Password is required');
    }

    const user =
      typeof upnOrUser === 'string'
        ? await this.userRepository.findOne({
            where: {
              or: [{username: upnOrUser}, {email: upnOrUser}, {phone: upnOrUser}],
            },
          })
        : upnOrUser;

    let creds;
    try {
      creds = user && (await this.userRepository.credentials(user.id).get());
    } catch (e) {
      //do nothing
    }
    if (!user || user.deleted) {
      throw new AuthErrors.UserDoesNotExist();
    } else if (creds) {
      throw new BErrors.Unauthorized('User already signed up.');
    } else {
      // Do nothing
    }
    const password = await bcrypt.hash(newPassword, saltRounds);
    creds = new UserCredentials({
      authProvider: 'internal',
      password,
    });
    await this.userRepository.credentials(user.id).create(creds);
    return true;
  }

  async setCredentials(upnOrUser: string | User, options?: Options): Promise<boolean> {
    if (!options?.authProvider || !options?.authId) {
      // skip if authProvider or authId is not provided
      return false;
    }
    if (options.authProvider === 'internal') {
      throw new BErrors.Unauthorized('Cannot set internal creds');
    }

    const user =
      typeof upnOrUser === 'string'
        ? await this.userRepository.findOne({
            where: {
              or: [{username: upnOrUser}, {email: upnOrUser}, {phone: upnOrUser}],
            },
          })
        : upnOrUser;

    let creds;
    try {
      creds = user && (await this.userRepository.credentials(user.id).get());
    } catch (e) {
      //do nothing
    }
    if (!user || user.deleted) {
      throw new AuthErrors.UserDoesNotExist();
    } else if (creds) {
      throw new BErrors.Unauthorized('User already signed up.');
    } else {
      // Do nothing
    }

    await this.userRepository.credentials(user.id).create({
      authProvider: options.authProvider,
      authId: options.authId,
    });
    return true;
  }
}
