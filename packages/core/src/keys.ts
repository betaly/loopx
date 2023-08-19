import {BindingKey} from '@loopback/core';
import {ExpressRequestHandler} from '@loopback/rest';

import {BINDING_PREFIX} from './constants';
import {HttpMethod} from './enums';
import {CoreConfig} from './types';

export namespace LxCoreBindings {
  export const i18n = BindingKey.create<i18nAPI>(`${BINDING_PREFIX}.i18n`);

  export const config = BindingKey.create<CoreConfig>('loopx.packages.core.config');

  export const EXPRESS_MIDDLEWARES = BindingKey.create<ExpressRequestHandler[]>(
    `loopx.packages.core.expressMiddlewares`,
  );

  export const DEFAULT_TENANT_KEY = BindingKey.create<string>('loopx.packages.core.defaultTenantKey');
}

const hiddenKey = 'loopx.oas.hiddenEndpoints';

export type OasHiddenApi = {
  path: string;
  httpMethod: HttpMethod;
};

export namespace OASBindings {
  export const HiddenEndpoint = BindingKey.create<OasHiddenApi[]>(hiddenKey);
}
