﻿import {inject} from '@loopback/context';
import {service} from '@loopback/core';
import {Count, CountSchema, Filter, Where, WhereBuilder, repository} from '@loopback/repository';
import {
  HttpErrors,
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';

import {AuthenticationBindings, STRATEGY, authenticate} from '@bleco/authentication';
import {authorize} from '@bleco/authorization';

import {CONTENT_TYPE, IAuthUserWithPermissions, OPERATION_SECURITY_SPEC, STATUS_CODE} from '@loopx/core';

import {PermissionKey, RoleKey} from '../enums';
import {Group, UserGroup} from '../models';
import {GroupRepository, UserGroupRepository} from '../repositories';
import {UserGroupService} from '../services';

const basePath = '/groups/{id}/user-groups';

export class UserGroupController {
  constructor(
    @repository(GroupRepository) protected groupRepository: GroupRepository,
    @repository(UserGroupRepository)
    public userGroupRepository: UserGroupRepository,
    @inject(AuthenticationBindings.CURRENT_USER)
    private readonly currentUser: IAuthUserWithPermissions,
    @service(UserGroupService)
    private readonly userGroupService: UserGroupService,
  ) {}

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [PermissionKey.ViewUserGroupList, PermissionKey.ViewUserGroupListNum],
  })
  @get(basePath, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Array of Group has many UserGroup',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {type: 'array', items: getModelSchemaRef(UserGroup)},
          },
        },
      },
    },
  })
  async findUserGroupsForGroup(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<UserGroup>,
  ): Promise<UserGroup[]> {
    return this.groupRepository.userGroups(id).find(filter);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [PermissionKey.ViewUserGroupList, PermissionKey.ViewUserGroupListNum],
  })
  @get(`${basePath}/count`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'User Group model count',
        content: {[CONTENT_TYPE.JSON]: {schema: CountSchema}},
      },
    },
  })
  async countUserGroupsForGroup(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(UserGroup))
    where?: Where<UserGroup>,
  ): Promise<Count> {
    return this.getUserGroupCount(id, where);
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [PermissionKey.AddMemberToUserGroup, PermissionKey.AddMemberToUserGroupNum],
  })
  @post(basePath, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Group model instance',
        content: {[CONTENT_TYPE.JSON]: {schema: getModelSchemaRef(UserGroup)}},
      },
    },
  })
  async createUserGroupForGroup(
    @param.path.string('id') id: typeof Group.prototype.id,
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(UserGroup, {
            title: 'NewUserGroupInGroup',
            exclude: ['id'],
            optional: ['groupId'],
          }),
        },
      },
    })
    userGroup: Omit<UserGroup, 'id'>,
  ): Promise<UserGroup> {
    let [userGroupRecord] = await this.groupRepository.userGroups(id).find({
      where: {
        groupId: id,
        userTenantId: userGroup.userTenantId,
      },
      limit: 1,
    });
    if (!userGroupRecord) {
      userGroupRecord = await this.userGroupService.create(userGroup);
      await this.groupRepository.updateById(id, {
        updatedAt: userGroupRecord.updatedAt,
      });
    }

    return userGroupRecord;
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [PermissionKey.UpdateMemberInUserGroup, PermissionKey.UpdateMemberInUserGroupNum],
  })
  @patch(`${basePath}/{userGroupId}`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Group.UserGroup PATCH success count',
      },
    },
  })
  async patchUserGroupsForGroup(
    @param.path.string('userGroupId') userGroupId: string,
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(UserGroup, {partial: true}),
        },
      },
    })
    userGroup: Partial<UserGroup>,
  ): Promise<void> {
    const numberOfOwners = await this.getUserGroupCount(id, {isOwner: true});
    if (numberOfOwners.count === 1) {
      const [userGroupRecord] = await this.groupRepository.userGroups(id).find({
        where: {
          groupId: id,
          id: userGroupId,
          isOwner: true,
        },
        limit: 1,
      });
      if (userGroupRecord && !userGroup?.isOwner) {
        throw new HttpErrors.Forbidden('The team needs at least one owner');
      }
    }
    await this.userGroupService.updateById(userGroupId, userGroup);
    await this.groupRepository.updateById(id, {
      updatedAt: new Date(),
    });
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({
    permissions: [
      PermissionKey.RemoveMemberFromUserGroup,
      PermissionKey.LeaveUserGroup,
      PermissionKey.RemoveMemberFromUserGroupNum,
      PermissionKey.LeaveUserGroupNum,
    ],
  })
  @del(`${basePath}/{userGroupId}`, {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Group.UserGroup DELETE success count',
      },
    },
  })
  async deleteUserGroupByIdForGroup(
    @param.path.string('id') id: string,
    @param.path.string('userGroupId') userGroupId: string,
  ): Promise<void> {
    const isAdmin = +this.currentUser.role === RoleKey.Admin;

    const userGroups = await this.groupRepository.userGroups(id).find({
      where: {
        groupId: id,
        or: [{id: userGroupId}, {userTenantId: this.currentUser.userTenantId}],
      },
      limit: 2,
    });
    const userGroupRecord = userGroups.find(userGroup => userGroup.id === userGroupId);
    const currentUserGroup = userGroups.find(userGroup => userGroup.userTenantId === this.currentUser.userTenantId);
    if (!userGroupRecord) {
      throw new HttpErrors.Forbidden('Unable to find user group records');
    }

    if (!(isAdmin || currentUserGroup?.isOwner || userGroupRecord?.userTenantId === this.currentUser.userTenantId)) {
      throw new HttpErrors.Forbidden('Only group owners can access');
    }

    if (userGroupRecord.userTenantId === this.currentUser.userTenantId && currentUserGroup?.isOwner) {
      throw new HttpErrors.Forbidden('An owner cannot remove himself as the owner');
    }
    const numberOfmembers = await this.getUserGroupCount(id, {});
    if (numberOfmembers.count === 1) {
      if (userGroupRecord?.isOwner) {
        throw new HttpErrors.Forbidden('The team needs at least one owner');
      } else {
        throw new HttpErrors.Forbidden('The team needs at least one member');
      }
    }
    await this.userGroupService.deleteById(userGroupId);
    await this.groupRepository.updateById(id, {
      updatedAt: new Date(),
    });
  }

  private async getUserGroupCount(id: string, where?: Where<UserGroup>) {
    const whereBuilder = new WhereBuilder<UserGroup>(where);
    whereBuilder.eq('groupId', id);
    return this.userGroupRepository.count(whereBuilder.build());
  }
}
