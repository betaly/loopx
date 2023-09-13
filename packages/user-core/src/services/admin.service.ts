import {BindingScope, injectable, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {DEFAULT_TENANT_CODE} from '@loopx/user-common';
import defaultsDeep from 'tily/object/defaultsDeep';

import {DEFAULT_SUPERADMIN_CREDENTIALS} from '../defaults';
import {AuthProvider, DefaultRole} from '../enums';
import {TenantUserData} from '../models';
import {UserRepository} from '../repositories';
import {SuperadminCredentials} from '../types';
import {buildWhereClauseFromIdentifier} from '../utils';
import {UserOperationsService} from './user-operations.service';

@injectable({scope: BindingScope.SINGLETON})
export class AdminService {
  constructor(
    @repository(UserRepository)
    private readonly userRepository: UserRepository,
    @service(UserOperationsService)
    private readonly userOperationsService: UserOperationsService,
  ) {}

  async initAdministrators(credentials?: SuperadminCredentials) {
    credentials = defaultsDeep(credentials, DEFAULT_SUPERADMIN_CREDENTIALS);
    await this.ensureSuperAdminUser(credentials);
  }

  async ensureSuperAdminUser(credentials: SuperadminCredentials) {
    const superAdminUser = await this.userRepository.findOne({
      where: buildWhereClauseFromIdentifier(credentials.identifier),
    });
    if (!superAdminUser) {
      await this.userOperationsService.create(
        new TenantUserData({
          roleId: DefaultRole.SuperAdmin,
          tenantId: DEFAULT_TENANT_CODE,
          userDetails: {
            username: credentials.identifier,
            name: 'Super Admin',
          },
        }),
        null,
        {activate: true, authProvider: AuthProvider.Internal},
      );
      await this.userRepository.setPassword(credentials.identifier, credentials.password);
    }
  }
}
