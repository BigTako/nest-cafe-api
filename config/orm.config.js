// var dbConfig = {
//   synchronize: false,
// };

// switch (process.env.NODE_ENV) {
//   case 'development':
//     Object.assign(dbConfig, {
//       type: process.env.DATABASE_TYPE,
//       database: process.env.DATABASE_NAME,
//       port: process.env.DATABASE_PORT,
//       host: process.env.DATABASE_HOST,
//       username: process.env.DATABASE_USERNAME,
//       password: process.env.DATABASE_PASSWORD,
//       entities: ['**/*.entity.js'],
//     });
//     break;
//   case 'test':
//     Object.assign(dbConfig, {
//       type: process.env.DATABASE_TYPE,
//       database: process.env.DATABASE_NAME,
//       port: process.env.DATABASE_PORT,
//       host: process.env.DATABASE_HOST,
//       username: process.env.DATABASE_USERNAME,
//       password: process.env.DATABASE_PASSWORD,
//       entities: ['**/*.entity.ts'],
//       migrationsRun: true,
//     });
//     break;
// }
// module.exports = dbConfig;
module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [process.env.DB_ENTITIES],
  synchronize: true,
};
