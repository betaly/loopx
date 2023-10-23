import {Aliaser} from '@bleco/aliaser';

import {AuthServiceBindings} from './keys';

export const ConfigAliaser = Aliaser.create({
  auth: {
    autha: AuthServiceBindings.AuthaConfig,
  },
});
