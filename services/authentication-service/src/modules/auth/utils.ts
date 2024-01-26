import identity from 'tily/function/identity';
import filter from 'tily/object/filter';
import {AnyObj} from 'tily/typings/types';

export function toQueryString(params: AnyObj) {
  return new URLSearchParams(filter<AnyObj>(identity, params)).toString();
}
