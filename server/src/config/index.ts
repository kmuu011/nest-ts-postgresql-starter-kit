import * as process from "node:process";

const envConfig = process.env;

const config = {
  port: 8200,

  memberAuth: {
    password: {
      salt: 'thisIsSalt',
      hashAlgorithm: 'sha512',
    },
    session: {
      expireTime: 60 * 60 * 24 * 30,
      refreshTime: 60 * 60 * 24 * 30 - 10
    }
  },

  redis: {
    host: envConfig.REDIS_HOST,
    port: 6379,
    defaultTTL: 60 * 60 * 24
  }
};

export {
  config
};