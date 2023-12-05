/* eslint-disable @typescript-eslint/no-explicit-any */

import {OperationArgs, Request} from '@loopback/rest';
import {MarkRequired} from 'ts-essentials';

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
export type LogLevelOrString = LogLevel | (string & {});
export type LogLevelWithSilent = LogLevel | 'silent';
export type LogLevelWithSilentOrString = LogLevelWithSilent | (string & {});

export interface LogFn {
  // TODO: why is this different from `obj: object` or `obj: any`?
  <T extends object>(obj: T, msg?: string, ...args: any[]): void;
  (obj: unknown, msg?: string, ...args: any[]): void;
  (msg: string, ...args: any[]): void;
}

/**
 * A function to perform REST req/res logging action
 */
export interface RestLogFn {
  (req: Request, args: OperationArgs, result: any): Promise<void>;
}

interface InternalLogInfo {
  level: LogLevelOrString;
  meta?: unknown;
  message?: string;
  params?: unknown[];
  timestamp?: Date;
}

export type LogInfo = MarkRequired<InternalLogInfo, 'meta'> | MarkRequired<InternalLogInfo, 'message'>;
