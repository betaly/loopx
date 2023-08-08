import path from 'path';

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {RestExplorerBindings, RestExplorerComponent} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';

import '@bleco/boot';

import {MultiTenancyComponent} from '../../component';
import {MultiTenancyBindings} from '../../keys';

export {ApplicationConfig};

const HostTenantMapping: Record<string, string> = {
  'abc.example.com': 'abc',
  'xyz.example.com': 'xyz',
};

export class ExampleMultiTenancyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence in test-helpers.ts
    // this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    // *************************************************************************
    // Begin Mount Multi-tenancy
    // *************************************************************************
    /*
     * this.configure(MultiTenancyBindings.ACTION)
     *   .to({strategyNames: ['jwt', 'header', 'query']});
     */
    this.bind(MultiTenancyBindings.CONFIG).to({
      useMultiTenancyMiddleware: true,
    });
    this.component(MultiTenancyComponent);

    this.bind(MultiTenancyBindings.TENANT_RESOLVER).to((idOrHost: string) => {
      if (idOrHost.includes('.')) {
        return HostTenantMapping[idOrHost] ? {id: HostTenantMapping[idOrHost]} : undefined;
      }
      return {id: idOrHost};
    });
    this.bind(MultiTenancyBindings.POST_PROCESS).to((ctx, tenant) => {
      ctx.bind('datasources.db').toAlias(`datasources.db.${tenant.id}`);
    });
    // *************************************************************************
    // End Mount Multi-tenancy
    // *************************************************************************

    this.projectRoot = __dirname;
  }
}
