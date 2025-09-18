import * as process from "node:process";
import * as path from "node:path";
import * as fs from "node:fs";

const loadEnvFiles = () => {
  const nodeEnv = process.env.NODE_ENV || 'dev';
  const envDir = path.join(__dirname, '../../../');

  const envFiles = [
    path.join(envDir, '.env'),
    path.join(envDir, `.env.${nodeEnv}`),
  ];

  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      console.log(`Loading environment file: ${envFile}`);
      require('dotenv').config({ path: envFile });
    }
  });
};

loadEnvFiles();

const envConfig = process.env;

const config = {
  port: 8200,

  memberAuth: {
    password: {
      salt: envConfig.PASSWORD_SALT,
      hashAlgorithm: envConfig.PASSWORD_HASH_ALGORITHM,
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