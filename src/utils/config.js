const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const chalk = require('chalk');
const logger = require('./logger');

/**
 * @typedef {{
 *  ap: 'NJUPT'|'NJUPT-CHINANET'|'NJUPT-CMCC',
 *  username: string,
 *  password: string,
 *  interval: number,
 *  timeout: number,
 * }} Config
 */
const defaultConfig = {
  ap: 'NJUPT-CHINANET',
  username: '',
  password: '',
  interval: 5000, // connection check interval
  timeout: 5000, // http fetch timeout
};

/**
 * check config init status
 * @param {string} url config file path
 * @returns {Promise<Config>}
 */
async function init(url) {
  logger.log('Seems first running, init configs...');
  const config = { ...defaultConfig };
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  config.ap = await new Promise((resolve) => {
    logger.log('Available APs:');
    logger.log(`  ${chalk.cyan('1')}. NJUPT`);
    logger.log(`  ${chalk.cyan('2')}. NJUPT-CHINANET (Default)`);
    logger.log(`  ${chalk.cyan('3')}. NJUPT-CMCC`);
    rl.question(`${logger.getPrefix()} Please select default ${chalk.cyan('AP')}: `, (s) => {
      switch (Math.floor(`${s}`.trim())) {
        case 1:
          resolve('NJUPT');
          break;
        case 2:
          resolve('NJUPT-CHINANET');
          break;
        case 3:
          resolve('NJUPT-CMCC');
          break;
        default:
          resolve('NJUPT-CHINANET');
      }
    });
  });
  config.username = await new Promise((resolve) => {
    rl.question(`${logger.getPrefix()} Please input your ${chalk.cyan('username')}: `, (s) =>
      resolve(`${s}`.trim())
    );
  });
  config.password = await new Promise((resolve) => {
    rl.question(`${logger.getPrefix()} Please input your ${chalk.cyan('password')}: `, (s) => {
      s = `${s}`.trim();
      // encode password
      s = Buffer.from(s, 'utf-8').toString('base64');
      resolve(s);
    });
  });

  try {
    fs.writeFileSync(url, JSON.stringify(config, null, 2));
    logger.log(`Config file ${chalk.cyan('`.nac.json`')} saved in user homedir`);
    return config;
  } catch (e) {
    logger.error('Failed to init config file');
    logger.save(e);
    return defaultConfig;
  }
}

/**
 * load or init config file
 * @returns {Promise<Config>}
 */
async function load() {
  logger.log('Checking config file...');
  const url = path.join(os.homedir(), '.nac.json');

  let config = null;
  if (!fs.existsSync(url)) {
    const inited = await init(url);
    config = { ...defaultConfig, ...inited };
  } else {
    try {
      const loaded = JSON.parse(fs.readFileSync(url));
      config = { ...defaultConfig, ...loaded };
      logger.log('Successfully loaded config file');
    } catch (e) {
      logger.error('Failed to load config file');
      logger.save(e);
      config = defaultConfig;
    }
  }

  // re-check config
  if (!/^NJUPT(-CHINANET|-CMCC)?$/.exec(config.ap)) {
    config.ap = defaultConfig.ap;
  }
  // decode password
  config.password = Buffer.from(config.password, 'base64').toString('utf-8');
  // min interval set to 5000
  config.interval = config.interval < 5000 ? 5000 : Math.floor(config.interval);
  // timeout from min 1000 to max interval
  config.timeout = config.timeout >= 1000 ? Math.floor(config.timeout) : 1000;
  if (config.timeout > config.interval) {
    config.timeout = config.interval;
  }
  logger.log('Current configs:');
  logger.log(`  AP:       ${chalk.cyan(config.ap)}`);
  logger.log(`  Username: ${chalk.cyan(config.username)}`);
  logger.log(`  Username: ${chalk.cyan(config.password.replace(/./g, '*'))}`);
  logger.log(`  Interval: ${chalk.cyan(config.interval + 'ms')}`);
  logger.log(`  Timeout:  ${chalk.cyan(config.timeout + 'ms')}`);
  return config;
}

module.exports = {
  init,
  load,
};
