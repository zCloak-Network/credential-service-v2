import { EggPlugin } from 'egg';
export default {
  logrotator: false, // disable when use @midwayjs/logger
  static: true,
  cors: {
    enable: true,
    package: 'egg-cors',
  }
} as EggPlugin;
