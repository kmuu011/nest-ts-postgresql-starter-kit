import * as process from "node:process";
import * as path from "node:path";
import * as fs from "node:fs";

if (!process.env.npm_lifecycle_event) {
  throw "npm_lifecycle_event 환경 변수가 설정되어 있지 않습니다.";
}

const serverType = process.env.npm_lifecycle_event?.split(':')[0];

const loadEnvFiles = () => {
  const envDir = path.join(__dirname, '../../../');

  const envFiles = [
    path.join(envDir, '.env'),
    path.join(envDir, `.env.${serverType}`),
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
  serverType,
  port: 8200,

  memberAuth: {
    password: {
      salt: envConfig.PASSWORD_SALT,
      hashAlgorithm: envConfig.PASSWORD_HASH_ALGORITHM,
    },
    session: {
      expireTime: 60 * 60 * 24 * 30,
      refreshTime: 60 * 60 * 24 * 29
    }
  },

  redis: {
    host: envConfig.REDIS_HOST,
    port: 6379,
    defaultTTL: 60 * 60 * 24
  },

  staticPath: path.join(__dirname, '../../static'),
  filePath: {
    file: '/files'
  }
};

export {
  config
};