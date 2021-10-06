import path from 'path';
import os from 'os';
import fs from 'fs';
import chalk from 'chalk';
import dayjs from 'dayjs';

export const LOG_PATH = path.join(os.homedir(), '.nac.log');

/**
 * get log prefix
 */
export function getPrefix(raw = false) {
  const prefix = `[NAC | ${dayjs().format('YYYY-MM-DD HH:mm:ss')}]`;
  if (raw) {
    return prefix;
  } else {
    return chalk.magenta(prefix);
  }
}

/**
 * log info to stdout
 */
export function log(...args: any[]) {
  console.log(getPrefix(), ...args);
}

/**
 * save info to file
 */
export function save(...args: any[]) {
  let data = getPrefix(true) + ' ';
  for (let i = 0; i < args.length; i++) {
    data += `${args[i]}`;
  }
  data += '\n';
  fs.writeFileSync(LOG_PATH, data, {
    encoding: 'utf-8',
    flag: 'a',
  });
}

/**
 * log error to stdout and file
 */
export function error(...args: any[]) {
  console.error(getPrefix(), chalk.red(...args));
  save(...args);
}
