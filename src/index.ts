import isOnline from 'is-online';
import chalk from 'chalk';
import * as logger from './utils/logger';
import * as config from './utils/config';
import login from './utils/login';

async function main() {
  const cfg = await config.load();
  const online = await isOnline({ timeout: cfg.timeout });

  if (online) {
    logger.log(`Internet access ${chalk.green('online')}`);
  } else {
    logger.log(`Internet access ${chalk.yellow('offline')}, trying to reconnect...`);
    const ret = await login(cfg);
    if (!ret.status) {
      logger.log(`Login failed, reason: ${ret.message}`);
    }
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  });
