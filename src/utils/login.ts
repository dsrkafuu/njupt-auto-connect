import axios, { AxiosResponse } from 'axios';
import qs from 'qs';
import { Config } from './config';
import * as logger from './logger';
import promiseAny from './promiseAny';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
const HOSTS = ['p.njupt.edu.cn', '10.10.244.11'];

interface LoginData {
  ip: string;
  wlanuserip: string;
  wlanacname: string;
  wlanacip: string;
}

/**
 * perform login
 */
async function login(cfg: Config): Promise<{
  status: boolean;
  message?: string;
}> {
  let { ap, username, password, timeout } = cfg;
  const ret = {
    status: false,
    message: '',
  };
  let res = null;
  let data: LoginData = {
    ip: '',
    wlanuserip: '',
    wlanacname: '',
    wlanacip: '',
  };

  // check inputs
  if (!username || !password) {
    ret.message = 'empty ap, username or password';
    return ret;
  }

  // format username
  switch (ap) {
    case 'NJUPT':
      username = `,0,${username}`;
      break;
    case 'NJUPT-CHINANET':
      username = `,0,${username}@njxy`;
      break;
    case 'NJUPT-CMCC':
      username = `,0,${username}@cmcc`;
      break;
    default:
      ret.message = 'error parsing ap';
      return ret;
  }

  // init login params
  try {
    res = await axios.get('http://6.6.6.6', { timeout });
    const href = (/location\.href="([^"]+)"/.exec(res.data) || [])[1] || '';

    const url = new URL(href);
    data = {
      ...data,
      ...{
        wlanuserip: url.searchParams.get('wlanuserip') || '',
        ip: url.searchParams.get('wlanuserip') || '',
        wlanacname: url.searchParams.get('wlanacname') || '',
        wlanacip: url.searchParams.get('wlanacip') || '',
      },
    };
    if (!data.wlanuserip || !data.wlanacip) {
      ret.message = 'failed to init login params';
      return ret;
    }
  } catch (e) {
    logger.save(e);
    ret.message = 'failed to init login params';
    return ret;
  }

  data = {
    ...data,
    ...{
      c: 'ACSetting',
      a: 'Login',
      protocol: 'http:',
      iTermType: '1',
      mac: '00-00-00-00-00-00',
      enAdvert: '0',
      queryACIP: '0',
      loginMethod: '1',
    },
  };

  // proceed login
  const workers: Promise<AxiosResponse>[] = [];
  const body = qs.stringify({
    DDDDD: username,
    upass: password,
    R1: '0',
    R2: '0',
    R3: '0',
    R6: '0',
    para: '00',
    '0MKKey': '123456',
    buttonClicked: '',
    redirect_url: '',
    err_flag: '',
    username: '',
    password: '',
    user: '',
    cmd: '',
    Login: '',
    v6ip: '',
  });

  HOSTS.forEach((hostname) => {
    const url = new URL(`http://${hostname}:801/eportal/`);
    for (let key of Object.keys(data)) {
      url.searchParams.set(key, data[key as keyof LoginData]);
    }
    url.searchParams.set('hostname', hostname);
    workers.push(
      axios.post(url.toString(), body, {
        timeout,
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate',
          'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
          Connection: 'keep-alive',
          'Content-Type': 'application/x-www-form-urlencoded',
          Origin: `http://${hostname}`,
          Referer: `http://${hostname}/`,
          'Upgrade-Insecure-Requests': '1',
          'User-Agent': UA,
        },
      })
    );
  });

  try {
    await promiseAny(workers);
    ret.status = true;
    return ret;
  } catch (e) {
    if (Array.isArray(e)) {
      logger.save(...e);
    } else {
      logger.save(e);
    }
    ret.message = 'failed to login';
    return ret;
  }
}

export default login;
