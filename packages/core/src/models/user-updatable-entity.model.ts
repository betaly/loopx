import {UserUpdatableModel, UserUpdatableModelMixin} from '@bleco/ds-user-updatable';
import {mixin} from '@bleco/mixin';

import {BaseEntity} from './base-entity.model';

@mixin(UserUpdatableModelMixin)
export class UserUpdatableEntity extends BaseEntity {}

export interface UserUpdatableEntity extends UserUpdatableModel {}
