import {model, property} from '@loopback/repository';

import {UserUpdatableEntity} from '@loopx/core';

@model({
  name: 'todos',
})
export class ToDo extends UserUpdatableEntity {
  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'array',
    itemType: 'string',
  })
  items?: string[];

  constructor(data?: Partial<ToDo>) {
    super(data);
  }
}

export type ToDoWithRelations = ToDo;
