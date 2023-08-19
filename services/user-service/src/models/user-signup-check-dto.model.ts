import {model, property} from '@loopback/repository';

import {CoreModel} from '@loopx/core';

@model()
export class UserSignupCheckDto extends CoreModel<UserSignupCheckDto> {
  @property({
    type: 'boolean',
    required: true,
  })
  isSignedUp: boolean;
}
