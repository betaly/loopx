import {inject} from '@loopback/core';
import {DefaultCrudRepository, JugglerDataSource} from '@loopback/repository';

import {AuthDbSourceName} from '@loopx/authentication-service';

import {ToDo} from '../models';

export class ToDoRepository extends DefaultCrudRepository<ToDo, typeof ToDo.prototype.id> {
  constructor(@inject(`datasources.${AuthDbSourceName}`) dataSource: JugglerDataSource) {
    super(ToDo, dataSource);
  }
}
