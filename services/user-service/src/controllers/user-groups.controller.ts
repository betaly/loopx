﻿import {Count, Filter, Where, repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';

import {STRATEGY, authenticate} from '@bleco/authentication';
import {authorize} from '@bleco/authorization';

import {CONTENT_TYPE, OPERATION_SECURITY_SPEC, STATUS_CODE} from '@loopx/core';

import {PermissionKey} from '../enums';
import {UserGroup} from '../models';
import {UserGroupRepository} from '../repositories';

const basePath = '/user-groups';

export class UserGroupsController {
  constructor(
    @repository(UserGroupRepository)
    public userGroupRepository: UserGroupRepository,
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
        description: 'Array of UserGroup',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {type: 'array', items: getModelSchemaRef(UserGroup)},
          },
        },
      },
    },
  })
  async find(@param.query.object('filter') filter?: Filter<UserGroup>): Promise<UserGroup[]> {
    return this.userGroupRepository.find(filter);
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
        description: 'Count of UserGroup',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {type: 'array', items: getModelSchemaRef(UserGroup)},
          },
        },
      },
    },
  })
  async getCount(@param.query.object('where') where: Where<UserGroup>): Promise<Count> {
    return this.userGroupRepository.count(where);
  }
}
