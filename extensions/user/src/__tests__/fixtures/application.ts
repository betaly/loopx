import {AuditDbSourceName} from '@bleco/audit-log';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {AclComponent} from 'loopback4-acl';
import {IntegrateMixin} from 'loopback4-plus';

import {UserComponent} from '../../component';
import {UserBindings, UserDataSourceName} from '../../keys';
import {UserComponentOptions} from '../../types';

export {ApplicationConfig};

export class UserTenantApplication extends IntegrateMixin(RestApplication) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    // Add authorization component
    this.component(AclComponent);
    this.configure<UserComponentOptions>(UserBindings.COMPONENT).to({
      //
    });
    this.component(UserComponent);

    this.bind(`datasources.${AuditDbSourceName}`).toAlias(`datasources.${UserDataSourceName}`);

    this.projectRoot = __dirname;
  }
}
