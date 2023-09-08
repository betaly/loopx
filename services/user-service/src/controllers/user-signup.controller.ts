import {authenticate, STRATEGY} from '@bleco/authentication';
import {repository} from '@loopback/repository';
import {get, getModelSchemaRef, param} from '@loopback/rest';
import {AuthProvider, CONTENT_TYPE, ErrorCodes, STATUS_CODE} from '@loopx/core';
import {
  buildWhereClauseFromIdentifier,
  User,
  UserAuthSubjects,
  UserCredentialsRepository,
  UserRepository,
} from '@loopx/user-core';
import {acl, Actions, authorise} from 'loopback4-acl';

import {UserSignupCheckDto} from '../models/user-signup-check-dto.model';

export const USER_SIGN_UP_RESPONSE_DESCRIPTION = 'Success Response.';

export class UserSignupController {
  constructor(
    @repository(UserCredentialsRepository)
    public userCredsRepository: UserCredentialsRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  // @authorize({
  //   permissions: [
  //     PermissionKey.ViewAnyUser,
  //     PermissionKey.ViewTenantUser,
  //     PermissionKey.ViewAnyUserNum,
  //     PermissionKey.ViewTenantUserNum,
  //   ],
  // })
  @authorise(Actions.read, UserAuthSubjects.User, [
    UserRepository,
    async (repo: UserRepository, {params}) => {
      return repo.findOne({where: buildWhereClauseFromIdentifier(params.loginId)});
    },
  ])
  @get('/check-signup/{loginId}', {
    responses: {
      [STATUS_CODE.OK]: {
        description: USER_SIGN_UP_RESPONSE_DESCRIPTION,
        content: {
          [CONTENT_TYPE.JSON]: {
            schema: getModelSchemaRef(UserSignupCheckDto),
          },
        },
      },
      ...ErrorCodes,
    },
  })
  async checkUserSignup(
    @param.path.string('loginId')
    loginId: string,
    @acl.subject({optional: true})
    user?: User,
  ): Promise<UserSignupCheckDto> {
    let isSignedUp = false;
    // const user = await this.userRepository.findOne({
    //   where: {email},
    // });
    if (user) {
      const userCreds = await this.userCredsRepository.findOne({
        where: {
          userId: user.id,
        },
      });
      if (userCreds?.authProvider === AuthProvider.INTERNAL) {
        isSignedUp = !!userCreds?.password?.length;
      } else {
        isSignedUp = true;
      }
    }
    return new UserSignupCheckDto({
      isSignedUp,
    });
  }
}
