import {DataObject, Model} from '@loopback/repository';

import {UserUpdatableModel, UserUpdatableModelMixin} from '@bleco/ds-user-updatable';
import {mixin} from '@bleco/mixin';

import {BaseEntity} from './base-entity.model';

@mixin(UserUpdatableModelMixin)
export class UserUpdatableEntity<T = DataObject<Model>> extends BaseEntity<T> {}

export interface UserUpdatableEntity extends UserUpdatableModel {}
