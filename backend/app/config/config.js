const dotenv = require('dotenv');
dotenv.config();

const env = process.env.NODE_ENV || 'development';

let database = null;
switch (env) 
{
  case 'test':
      database = process.env.TEST_DB_NAME;
      break;
  case 'development':
      database = process.env.DB_NAME;
      break;
  case 'production':
      database = process.env.DB_NAME;
      break;
  default:
      database = process.env.DB_NAME;
}

module.exports = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PORT: process.env.DB_PORT,
  PASSWORD: process.env.DB_PWD,
  DB: database,
  JWT_SECRET: process.env.JWT_SECRET,
  EMAIL: process.env.EMAIL,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  S3_BUCKET: process.env.S3_BUCKET
};

