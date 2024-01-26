import type {Response} from '@loopback/rest';

import {ResponseInternal} from './types';

export function toResponse(source: ResponseInternal, target: Response) {
  const status = source.redirect ? 302 : source.status ?? 200;
  target.status(status);

  source.headers?.forEach((value, name) => {
    target.header(name, value);
  });

  source.cookies?.forEach(({name, value, options}) => {
    target.cookie(name, value, options);
  });

  let body = source.body;

  if (target.get('content-type') === 'application/json') {
    body = JSON.stringify(body);
  } else if (target.get('content-type') === 'application/x-www-form-urlencoded') {
    body = new URLSearchParams(body).toString();
  }

  if (source.redirect) {
    target.redirect(source.redirect);
  }

  target.send(body);

  return target;
}
