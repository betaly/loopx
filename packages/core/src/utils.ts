import {isString} from 'lodash';
import moment from 'moment';
import multimatch from 'multimatch';

import {Request} from '@loopback/rest';

// sonarignore:start
/* eslint-disable @typescript-eslint/no-explicit-any */
export const getErrorString = (error: any) => {
  // sonarignore:end
  if (isString(error)) {
    return error;
  } else if (JSON.stringify(error) !== '{}') {
    return JSON.stringify(error);
  } else {
    return error;
  }
};

export const getAge = (dob: Date): number => {
  const currentMoment = moment();
  const dobMoment = moment(dob);
  return currentMoment.diff(dobMoment, 'years');
};

export const getDOBFromAge = (age: number): Date => {
  const dobMoment = moment().subtract(age, 'years');
  return dobMoment.toDate();
};

export const rateLimitKeyGen = (req: Request) => {
  const key = req.headers?.authorization?.replace(/bearer /i, '') ?? req.ip;
  return `${process.env.RATE_LIMIT_KEY_PREFIX}_${key}`;
};

export const rateLimitKeyGenPublic = (req: Request) =>
  `${process.env.RATE_LIMIT_KEY_PREFIX}_${req.ip}_${req.method}_${req.url}`;

export const matchResources = <R extends string | {name: string}>(resources: R[], patterns?: string[]): R[] => {
  if (!patterns) {
    return resources;
  }
  const names = resources.map(r => (typeof r === 'string' ? r : r.name));
  const matchedNames = multimatch(names, patterns);
  return resources.filter(r => matchedNames.includes(typeof r === 'string' ? r : r.name));
};
