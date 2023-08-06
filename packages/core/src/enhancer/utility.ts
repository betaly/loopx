import {PathsObject} from '@loopback/openapi-v3';

import {HttpMethod, OasKeyMap} from '../enums';
import {OasHiddenApi} from '../keys';

function apiSearchFunction(apiSearch: [string, OasHiddenApi], path: PathsObject) {
  Object.values(HttpMethod).forEach(method => {
    if (path[OasKeyMap[method]] && apiSearch[1]['httpMethod'] === method) {
      delete path[OasKeyMap[method]];
    }
  });
}
export function apiHide(arrayApiSearch: [string, OasHiddenApi][], paths: PathsObject) {
  arrayApiSearch.forEach(apiSearch => {
    for (const path in paths) {
      if (path === apiSearch[1]['path']) {
        apiSearchFunction(apiSearch, paths[path]);
      }
    }
  });
}
