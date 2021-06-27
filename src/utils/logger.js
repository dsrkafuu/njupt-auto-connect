const path = require('path');
const os = require('os');
const fs = require('fs');
const chalk = require('chalk');
const dayjs = require('dayjs');

/**
 * get log prefix
 * @param {boolean} raw no chalk
 * @returns {string}
 */
function getPrefix(raw = false) {
  const prefix = `[NAC | ${dayjs().format('YYYY-MM-DD HH:mm:ss')}]`;
  if (raw) {
    return prefix;
  } else {
    return chalk.magenta(prefix);
  }
}

/**
 * log info to stdout
 * @param  {...any} args
 */
function log(...args) {
  console.log(getPrefix(), ...args);
}

/**
 * log to log file
 * @param  {...any} args
 */
function save(...args) {
  const url = path.join(os.homedir(), '.nac.log');
  let data = getPrefix(true) + ' ';
  for (let i = 0; i < args.length; i++) {
    data += `${args[i]}`;
  }
  data += '\n';
  fs.writeFileSync(url, data, {
    encoding: 'utf-8',
    flag: 'a',
  });
}

/**
 * log error to stdout and file
 * @param  {...any} args
 */
function error(...args) {
  console.error(getPrefix(), chalk.red(...args));
  save(...args);
}

module.exports = {
  getPrefix,
  log,
  save,
  error,
};
