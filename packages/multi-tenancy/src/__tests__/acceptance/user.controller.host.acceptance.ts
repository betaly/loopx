import {Client, expect} from '@loopback/testlab';

import {MultiTenancyBindings} from '../../keys';
import {MultiTenancyActionOptions} from '../../types';
import {ExampleMultiTenancyApplication} from '../fixtures/application';
import {SEQUENCES} from '../fixtures/sequences';
import {setupApplication} from './test-helper';

describe('UserController with host-based multi-tenancy', () => {
  let app: ExampleMultiTenancyApplication;
  let client: Client;

  SEQUENCES.forEach(sequence => {
    describe(sequence.name, () => {
      beforeAll(async () => {
        ({app, client} = await setupApplication(sequence));
        app
          .configure<MultiTenancyActionOptions>(MultiTenancyBindings.ACTION)
          .to({strategyNames: ['jwt', 'header', 'query', 'host']});
      });

      beforeAll(async () => {
        // Tenant abc
        await client.post('/users').set('HOST', 'abc.example.com').send({name: 'John'});
        // Tenant xyz
        await client.post('/users').set('HOST', 'xyz.example.com').send({name: 'Mary'});
        // No tenant
        await client.post('/users').send({tenantId: '', name: 'Jane'});
      });

      afterAll(async () => {
        await app.stop();
      });

      it('Get users by tenantId - abc', async () => {
        const res = await client.get('/users').set('HOST', 'abc.example.com').expect(200);
        expect(res.body).to.eql([{tenantId: 'abc', id: '1', name: 'John'}]);
      });

      it('Get users by tenantId - xyz', async () => {
        const res = await client.get('/users').set('HOST', 'xyz.example.com').expect(200);
        expect(res.body).to.eql([{tenantId: 'xyz', id: '1', name: 'Mary'}]);
      });

      it('Get users by tenantId - none', async () => {
        const res = await client.get('/users').expect(200);
        expect(res.body).to.eql([{tenantId: '', id: '1', name: 'Jane'}]);
      });
    });
  });
});
