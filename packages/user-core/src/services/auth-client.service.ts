import {ClientType} from '@bleco/authentication';
import {BindingScope, injectable} from '@loopback/core';
import {DataObject, Options, repository, Where} from '@loopback/repository';
import {BErrors} from 'berrors';
import {customAlphabet} from 'nanoid';

import {AuthClient} from '../models';
import {AuthClientRepository, RoleRepository} from '../repositories';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 20);

@injectable({scope: BindingScope.SINGLETON})
export class AuthClientService {
  constructor(
    @repository(AuthClientRepository)
    public authClientRepo: AuthClientRepository,
    @repository(RoleRepository)
    public roleRepo: RoleRepository,
  ) {}

  async create(data: DataObject<AuthClient>, options?: Options) {
    if (!data.name) {
      throw new Error('Name is required');
    }

    const or: Where<AuthClient>[] = [{name: data.name}];
    if (data.clientId) {
      or.push({clientId: data.clientId});
    }
    const found = await this.authClientRepo.findOne({where: {or}});
    if (found) {
      throw new BErrors.BadRequest('AuthClient already exists');
    }

    const client = await this.authClientRepo.create(
      {
        clientType: ClientType.public,
        clientId: nanoid(),
        accessTokenExpiration: 3600,
        refreshTokenExpiration: 3600 * 24 * 30,
        authCodeExpiration: 3600,
        ...data,
        clientSecret: nanoid(),
        secret: nanoid(),
      },
      options,
    );

    // update admin roles
    // const adminRoles = await this.roleRepo.find({
    //   where: {roleType: RoleTypes.Admin},
    //   fields: {id: true, allowedClients: true},
    // });
    // await Promise.all(
    //   adminRoles.map(role =>
    //     this.roleRepo.updateById(role.id, {allowedClients: [...(role.allowedClients ?? []), client.clientId]}),
    //   ),
    // );
    return client;
  }
}
