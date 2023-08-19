import {DataObject, Model} from '@loopback/repository';

export abstract class CoreModel<ModelType = DataObject<Model>> extends Model {
  constructor(data?: Partial<ModelType>) {
    super(data);
  }
}
