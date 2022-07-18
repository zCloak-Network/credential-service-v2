import { loggers } from '@midwayjs/logger';
import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import { ResultVO } from '../vo/ResultVO';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1648137149988_8980';

  // add your config here
  config.middleware = [];

  config.midwayFeature = {
    // true 代表使用 midway logger
    // false 或者为空代表使用 egg-logger
    replaceEggLogger: true,
  };

  // csrf
  config.security = {
    csrf: {
      enable: false,
    },
  };

  // cors
  config.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  // global error handler
  config.onerror = {
    all(err, ctx) {
      loggers
        .getLogger('logger')
        .warn('url: %s, error is: %s', ctx.originalUrl, err);

      const resultVO = ResultVO.error(err?.message);
      ctx.body = JSON.stringify(resultVO);
      ctx.status = 200;
    },
  };

  return config;
};
