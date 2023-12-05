import {PingController} from './ping.controller';
import {HomePageController} from './home-page.controller';
import {TodoController} from './todo.controller';

export * from './home-page.controller';
export * from './ping.controller';
export * from './todo.controller';

export const controllers = [HomePageController, PingController, TodoController];
