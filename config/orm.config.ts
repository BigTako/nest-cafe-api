import { registerAs } from '@nestjs/config';

export default registerAs('databaseConfig', () => ({
  type: process.env.DB_TYPE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [process.env.DB_ENTITIES],
  synchronize: process.env.DB_SYNCHRONIZE,
}));
