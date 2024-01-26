import path from 'node:path';

import {inject, Provider} from '@loopback/core';
import ejs from 'ejs';
import * as fs from 'fs';

import {AuthServiceBindings} from '../keys';
import {toResponse} from '../responses';
import {AuthPages, IAuthServiceConfig} from '../types';

interface PageTemplate {
  path?: string;
  template?: ejs.TemplateFunction;
}

interface PagesTemplates {
  webMessage: PageTemplate;
}

const pagesTemplates: Partial<PagesTemplates> = {};

export class AuthPagesProvider implements Provider<AuthPages> {
  constructor(
    @inject(AuthServiceBindings.Config, {optional: true})
    private readonly config: IAuthServiceConfig = {},
  ) {}

  value(): AuthPages {
    const pages = this.config.pages ?? {};

    const webMessage: AuthPages['webMessage'] = (data, response) => {
      const webMessagePagePath = pages.webMessage ?? resolvePagePath('auth-web-message.ejs');
      const cache = (pagesTemplates.webMessage ??= {});

      if (cache?.path !== webMessagePagePath) {
        cache.template = ejs.compile(fs.readFileSync(webMessagePagePath, 'utf-8'));
        cache.path = webMessagePagePath;
      }
      const page = cache.template!(data);
      const headers = new Headers({
        'Content-Type': 'text/html',
      });
      const rawResponse = {
        status: 200,
        headers,
        body: page,
      };
      toResponse(rawResponse, response);
    };

    return {
      webMessage,
    };
  }
}

function resolvePagePath(page: string) {
  return path.resolve(__dirname, '../../pages', page);
}
