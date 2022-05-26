/**
 * 这里加入这段是因为 egg 默认的安全策略，在 post 请求的时候如果不传递 token 会返回 403
 * 由于大部分新手用户不太了解这个机制，所以在本地和单测环境做了默认处理
 * 请注意，线上环境依旧会有该错误，需要手动开启
 * 如果想了解更多细节，请访问 https://eggjs.org/zh-cn/core/security.html#安全威胁-csrf-的防范
 */
export const security = {
  csrf: false,
};

/**
 * mongodb setting.
 */
export const mongoose = {
  client: {
    uri: 'mongodb://localhost:27017/zCloak',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      user: '',
      pass: '',
    },
  },
};

// attester configuration
export const adminAttester = {
  mnemonic: '',
  address: '',
  didUri: '',
  wssAddress: '',
};

export const zCloak = {
  moonbase: {
    // default token number
    tokenNumber: '0.2',
    gas: 21000,
    url: 'https://rpc.api.moonbase.moonbeam.network',
    address: '',
    privateKey: '',
  },
};

export const logger = {
  consoleLevel: 'debug',
};

/**
 * orm config
 */
export const orm = {
  type: 'mysql',
  host: '',
  port: 3306,
  username: 'root',
  password: '',
  database: '',
  synchronize: false,
  logging: true, // print sql
};
