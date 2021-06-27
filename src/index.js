const logger = require('./utils/logger');
const config = require('./utils/config');
const Online = require('./utils/Online');
const login = require('./utils/login');

async function main() {
  const cfg = await config.load();
  const online = new Online(cfg.interval, cfg.timeout);

  let timeout = null;

  online.addEventListener('disconnect', () => {
    logger.log('Internet disconnected, trying to reconnect...');

    const peformLogin = async () => {
      const ret = await login(cfg.ap, cfg.username, cfg.password);
      if (!ret.status) {
        logger.error(`Login failed retry after 10s, reason: ${ret.message}`);
        timeout = setTimeout(() => peformLogin(), 10000);
      }
    };
    peformLogin();
  });

  online.addEventListener('connect', () => {
    logger.log('Internet connected, starting listener...');

    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  });
}

try {
  main();
} catch (e) {
  logger.error(e);
}
