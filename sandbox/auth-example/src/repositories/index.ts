import {ToDoRepository} from './to-do.repository';
import {UserLevelResourceRepository} from './user-level-resource.repository';

export * from './to-do.repository';
export * from './user-level-resource.repository';

export const repositories = [ToDoRepository, UserLevelResourceRepository];
