import {Application} from '@loopback/core';
import {Entity, model, property} from '@loopback/repository';
import {get, param, RestApplication, RestServer} from '@loopback/rest';

import {ApiSpecOptimizerBindings} from '../../keys';
import {ApiSpecOptimizerComponent} from '../../optimizer.component';
import {ApiSpecOptimizerOptions} from '../../optimizer.spec-enhancer';

describe('Extension for API spec optimizer - OASEnhancer', () => {
  let app: Application;
  let server: RestServer;
  beforeEach(givenAServer);

  @model()
  class Todo extends Entity {
    @property({
      type: 'number',
      id: true,
      generated: false,
    })
    id: number;
  }

  class TodoController {
    @get('/todos/{id}')
    async findById(@param.path.number('id') id: number): Promise<Todo> {
      return new Todo();
    }

    @get('/todos')
    async find(): Promise<Todo[]> {
      return [new Todo()];
    }

    @get('/todos/count')
    async count(): Promise<number> {
      return 1;
    }
  }

  class PingController {
    @get('/ping')
    async ping(): Promise<string> {
      return 'pong';
    }
  }

  class ThisIsMyWorldWordController {
    @get('/my-world')
    async find(): Promise<string> {
      return 'hello world';
    }
  }

  it('optimize api spec', async () => {
    const spec = await server.getApiSpec();
    expect(spec).toMatchSnapshot();
  });

  async function givenAServer() {
    app = new RestApplication();
    app.component(ApiSpecOptimizerComponent);
    const apiSpecOptimizerOptions: ApiSpecOptimizerOptions = {
      // customizeControllerName: name => name,
      // customizeOperationId: (name: string, op: OperationObject, spec: OpenApiSpec) => name,
    };
    app.configure(ApiSpecOptimizerBindings.API_SPEC_OPTIMIZER).to(apiSpecOptimizerOptions);
    app.controller(TodoController);
    app.controller(PingController);
    app.controller(ThisIsMyWorldWordController);
    server = await app.getServer(RestServer);
  }
});
