﻿import {BindingScope, bind, service} from '@loopback/core';
import {Where, WhereBuilder, repository} from '@loopback/repository';

import {IAuthUserWithPermissions} from '@loopx/core';

import {Group, UserGroup} from '../models';
import {UserGroupView} from '../models/group-user-view.model';
import {GroupRepository, UserGroupRepository, UserGroupViewRepository} from '../repositories';
import {UserGroupHelperService} from './user-group-helper.service';

@bind({scope: BindingScope.REQUEST})
export class UserGroupService {
  constructor(
    @repository(GroupRepository)
    public groupRepository: GroupRepository,
    @repository(UserGroupRepository)
    public userGroupRepository: UserGroupRepository,
    @service(UserGroupHelperService)
    private readonly userGroupHelperService: UserGroupHelperService,
    @repository(UserGroupViewRepository)
    public userGroupViewRepository: UserGroupViewRepository,
  ) {}

  async create(userGroupToCreate: Partial<UserGroup>) {
    return this.userGroupRepository.create(userGroupToCreate);
  }

  async updateById(userGroupId: string, userGroupToUpdate: Partial<UserGroup>) {
    await this.userGroupHelperService.updateById(userGroupId, userGroupToUpdate);
  }

  async deleteById(userGroupId: string) {
    await this.userGroupRepository.findById(userGroupId);
    await this.userGroupRepository.deleteById(userGroupId);
  }

  async deleteAllBygroupIds(groupIds: string[]) {
    await this.userGroupRepository.deleteAll({
      groupId: {inq: groupIds},
    });
  }

  getAccessCountFilter(currentUser: IAuthUserWithPermissions, where?: Where<Group>) {
    const whereBuilder = new WhereBuilder<UserGroupView>(where);
    whereBuilder.eq('userTenantId', `${currentUser.userTenantId}`);
    return whereBuilder.build();
  }
}
