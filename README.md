# credential-service

## QuickStart

The app is developed by [Midway](https://midwayjs.org ). For more configuration, please refer to [Midway](https://midwayjs.org ).

### Database init

script location `sql/init.sql`

### other component config

The configuration file is  located in `src/config/config.{current env}.ts`

For example, the configuration file name is `config.local.ts` in development and `config.prod.ts` in deploy.

#### ~~mongodb~~

```typescript
export const mongoose = {
  client: {
    uri: 'mongodb uri',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      user: 'mongodb user',
      pass: 'mongodb password',
    },
  },
};
```

#### mysql

```typescript
export const orm = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'mysql user',
  password: 'mysql password',
  database: 'mysql database',
  synchronize: false,
  logging: true, // print sql
};
```

#### application internal config

```typescript
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
```



### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm run build
$ npm start
$ curl https://credential-service.zcloak.network/ctypes/all
```

```
$ tailf ~/logs/my-midway-project/*.log
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.

[midway]: https://midwayjs.org
