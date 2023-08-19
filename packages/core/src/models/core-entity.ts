import {DataObject, Entity, Model} from '@loopback/repository';

export abstract class CoreEntity<EntityType = DataObject<Model>> extends Entity {
  constructor(data?: Partial<EntityType>) {
    super(data);
  }
}
