import {AuditDbSourceName} from '@bleco/audit-log';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {AclComponent, createBindingFromPermissions} from 'loopback4-acl';
import {IntegrateMixin} from 'loopback4-plus';

import {UserCoreComponent} from '../../component';
import {UserCoreBindings, UserDataSourceName} from '../../keys';
import {UserCoreComponentOptions} from '../../types';
import {permissions} from './permissions';

export {ApplicationConfig};

export class UserTenantApplication extends IntegrateMixin(RestApplication) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    // Add authorization component
    this.component(AclComponent);
    this.configure<UserCoreComponentOptions>(UserCoreBindings.COMPONENT).to({
      //
    });
    this.component(UserCoreComponent);

    this.add(createBindingFromPermissions(permissions, 'user-core'));

    this.bind(`datasources.${AuditDbSourceName}`).toAlias(`datasources.${UserDataSourceName}`);

    this.projectRoot = __dirname;
  }
}
