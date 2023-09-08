import * as fs from 'fs';
import * as path from 'path';

import {inject} from '@loopback/context';
import {get} from '@loopback/openapi-v3';
import {Response, RestBindings} from '@loopback/rest';

import {STATUS_CODE} from '@loopx/core';

export class HomePageController {
  private readonly html: string;
  constructor(
    @inject(RestBindings.Http.RESPONSE)
    private readonly response: Response,
  ) {
    this.html = fs.readFileSync(path.join(__dirname, '../../public/index.html'), 'utf-8');
  }

  @get('/', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Home Page',
        content: {'text/html': {schema: {type: 'string'}}},
      },
    },
  })
  homePage(): Response {
    this.response.status(STATUS_CODE.OK).contentType('html').send(this.html);
    return this.response;
  }
}
