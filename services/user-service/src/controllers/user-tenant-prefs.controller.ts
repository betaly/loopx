﻿import {authenticate, AuthenticationBindings, STRATEGY} from '@bleco/authentication';
import {inject} from '@loopback/context';
import {Filter, repository} from '@loopback/repository';
import {get, getFilterSchemaFor, getModelSchemaRef, param, post, requestBody} from '@loopback/rest';
import {CONTENT_TYPE, IAuthTenantUser, STATUS_CODE} from '@loopx/core';
import {UserAuthSubjects, UserTenantPrefs, UserTenantPrefsRepository} from '@loopx/user-core';
import {Actions, authorise} from 'loopback4-acl';

const basePath = '/ut-prefs';

export class UserTenantPrefsController {
  constructor(
    @repository(UserTenantPrefsRepository)
    public userTenantPrefsRepository: UserTenantPrefsRepository,
    @inject(AuthenticationBindings.CURRENT_USER)
    private readonly currentUser: IAuthTenantUser,
  ) {}

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [PermissionKey.UpdateUserTenantPreference, PermissionKey.UpdateUserTenantPreferenceNum],
  // })
  @authorise(Actions.update, UserAuthSubjects.UserTenantPrefs, async ({body}) => body)
  @post(basePath, {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'UserTenantPrefs model instance',
        content: {
          [CONTENT_TYPE.JSON]: {schema: getModelSchemaRef(UserTenantPrefs)},
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(UserTenantPrefs, {
            title: 'NewUserTenantPrefs',
            exclude: ['id'],
          }),
        },
      },
    })
    userTenantPrefs: Omit<UserTenantPrefs, 'id'>,
  ): Promise<void> {
    if (this.currentUser.userTenantId) {
      userTenantPrefs.userTenantId = this.currentUser.userTenantId;
    }
    const prefExists = await this.userTenantPrefsRepository.findOne({
      where: {
        userTenantId: userTenantPrefs.userTenantId,
        configKey: userTenantPrefs.configKey,
      },
    });
    if (!prefExists) {
      await this.userTenantPrefsRepository.create(userTenantPrefs);
    } else {
      await this.userTenantPrefsRepository.updateById(prefExists.id, {
        configValue: userTenantPrefs.configValue,
      });
    }
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [PermissionKey.ViewUserTenantPreference, PermissionKey.ViewUserTenantPreferenceNum],
  // })
  @authorise(Actions.read, UserAuthSubjects.UserTenantPrefs)
  @get(basePath, {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Array of UserTenantPrefs model instances',
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: {
              type: 'array',
              items: getModelSchemaRef(UserTenantPrefs, {
                includeRelations: true,
              }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(UserTenantPrefs))
    filter?: Filter<UserTenantPrefs>,
  ): Promise<UserTenantPrefs[]> {
    if (!filter) {
      filter = {where: {}};
    }
    filter.where = {
      and: [filter.where ?? {}, {userTenantId: this.currentUser.userTenantId}],
    };
    return this.userTenantPrefsRepository.find(filter);
  }
}
