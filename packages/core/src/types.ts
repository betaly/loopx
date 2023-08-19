import {IncomingMessage} from 'http';
import {SWStats} from 'swagger-stats';

import {Entity} from '@loopback/repository';

export interface JwtConfig {
  secret: string;
  issuer: string;
}

export interface IServiceConfig {
  useCustomSequence: boolean;
}

export interface CoreConfig {
  name?: string;
  configObject?: i18n.ConfigurationOptions;
  enableObf?: boolean;
  obfPath?: string;
  openapiSpec?: Record<string, unknown>;

  defaultTenantKey?: string;

  authentication?: boolean;

  swaggerUsername?: string;
  swaggerPassword?: string;
  authenticateSwaggerUI?: boolean;
  swaggerStatsConfig?: Omit<SWStats, 'name' | 'uriPath' | 'swaggerSpec' | 'authentication' | 'onAuthenticate'>;
  swaggerAuthenticate?: (req?: IncomingMessage, username?: string, password?: string) => boolean;
}

export type EntityClass<T extends Entity> = typeof Entity & {prototype: T};

/**
 * Define entity types for repository.
 *
 * @example
 *      type UserTypes = ExtendableModelTypes<User, User, typeof User.prototype.id, {}>;
 *      class UserRepository<T extends UserTypes = UserTypes> extends DefaultCrudRepository<T['Model'], T['ID'], T['Relations']> {
 *        ...
 *      }
 */
export type ExtendableModelTypes<
  BaseModelType,
  ModelType extends BaseModelType,
  IDType,
  RelationsType extends object = {},
> = {
  Model: ModelType;
  ID: IDType;
  Relations: RelationsType;
};

/**
 * Define entity types with `Model extends Model` style
 *
 * @example
 *
 *      type UserTypes = ModelTypes<User, typeof User.prototype.id, {}>;
 *      class UserRepository<T extends UserTypes = UserTypes> extends DefaultCrudRepository<T['Model'], T['ID'], T['Relations']> {
 *        ...
 *      }
 */
export type ModelTypes<Model, ID, Relations extends object = {}> = ExtendableModelTypes<Model, Model, ID, Relations>;
