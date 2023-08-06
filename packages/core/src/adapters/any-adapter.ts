// sonarignore:file

/* eslint-disable @typescript-eslint/no-explicit-any */
import {Adapter} from './adapter';

export class AnyAdapter implements Adapter<any, any> {
  adaptToModel(resp: any): any {
    return resp;
  }
  adaptFromModel(data: any): any {
    return data;
  }
}
