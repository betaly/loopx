import {Aliaser} from '@bleco/aliaser';

import {AuthServiceBindings} from './keys';

export const ConfigAliaser = Aliaser.alias({
  auth: {
    autha: AuthServiceBindings.AuthaConfig,
  },
});
