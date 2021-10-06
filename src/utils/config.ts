import fs from 'fs';
import path from 'path';
import os from 'os';
import readline from 'readline';
import chalk from 'chalk';
import * as logger from './logger';

export type APName = 'NJUPT' | 'NJUPT-CHINANET' | 'NJUPT-CMCC';

export interface Config {
  ap: APName;
  username: string;
  password: string;
  timeout: number;
}

export const CONFIG_DEFAULT: Config = {
  ap: 'NJUPT-CHINANET',
  username: '',
  password: '',
  timeout: 3000, // http fetch timeout
};

export const CONFIG_PATH = path.join(os.homedir(), '.nac.json');

/**
 * check config init status
 */
export async function init(): Promise<Config> {
  logger.log('Seems first running, init configs...');
  const config: Config = { ...CONFIG_DEFAULT };
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
      switch (Math.floor(Number(`${s}`.trim()))) {
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
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    logger.log(`Config file ${chalk.cyan('`.nac.json`')} saved in user homedir`);
    return config;
  } catch (e) {
    logger.error('Failed to init config file');
    logger.save(e);
    return CONFIG_DEFAULT;
  }
}

/**
 * load or init config file
 */
export async function load(): Promise<Config> {
  logger.log('Checking config file...');

  let config = null;
  if (!fs.existsSync(CONFIG_PATH)) {
    const inited = await init();
    config = { ...CONFIG_DEFAULT, ...inited };
  } else {
    try {
      const loaded = JSON.parse(fs.readFileSync(CONFIG_PATH, { encoding: 'utf-8' }));
      config = { ...CONFIG_DEFAULT, ...loaded };
      logger.log('Successfully loaded config file');
    } catch (e) {
      logger.error('Failed to load config file');
      logger.save(e);
      config = CONFIG_DEFAULT;
    }
  }

  // re-check config
  if (!/^NJUPT(-CHINANET|-CMCC)?$/.exec(config.ap)) {
    config.ap = CONFIG_DEFAULT.ap;
  }
  // decode password
  config.password = Buffer.from(config.password, 'base64').toString('utf-8');
  // timeout from min 1000 to max interval
  config.timeout = config.timeout >= 1000 ? Math.floor(config.timeout) : 1000;
  if (config.timeout > config.interval) {
    config.timeout = config.interval;
  }
  logger.log('Current configs:');
  logger.log(`  AP:       ${chalk.cyan(config.ap)}`);
  logger.log(`  Username: ${chalk.cyan(config.username)}`);
  logger.log(`  Username: ${chalk.cyan(config.password.replace(/./g, '*'))}`);
  logger.log(`  Timeout:  ${chalk.cyan(config.timeout + 'ms')}`);
  return config;
}
