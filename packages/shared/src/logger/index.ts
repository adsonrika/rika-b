import { serializeError } from '../utils/error.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogPayload {
    time: string;
    level: LogLevel;
    message: string;
    source: string;
    data?: unknown;
}

export function logger(source: string) {
  function log(
    level: LogLevel,
    message: string,
    data?: unknown
  ) {
    const payload: LogPayload = {
      time: new Date().toISOString(),
      level,
      message,
      source,
      data,
    };

    output(payload);
  }

  return {
    debug: (msg: string, data?: unknown) =>
      log('debug', msg, data),
    info: (msg: string, data?: unknown) =>
      log('info', msg, data),
    warn: (msg: string, data?: unknown) =>
      log('warn', msg, data),
    error: (msg: string | Error, data?: unknown) => {
      if (msg instanceof Error) {
        log('error', serializeError(msg), data);
      } else {
        log('error', msg, data);
      }
    },
  };
}

function output(payload: LogPayload) {
  devOutput(payload);
}
//
// function prodOutput(p: LogPayload) {
//     // 可以直接 JSON.stringify
//     console.log(JSON.stringify(p));
// }

function devOutput(p: LogPayload) {
  const prefix = `[${p.level.toUpperCase()}] ${p.source}`;

  switch (p.level) {
    case 'debug':
      console.debug(prefix, p.message, p.data);
      break;
    case 'info':
      console.info(prefix, p.message, p.data);
      break;
    case 'warn':
      console.warn(prefix, p.message, p.data);
      break;
    case 'error':
      console.error(prefix, p.message, p.data);
      break;
  }
}

