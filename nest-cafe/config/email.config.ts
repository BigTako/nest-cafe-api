import { registerAs } from '@nestjs/config';

export default registerAs('emailConfig', () => ({
  service: process.env.EMAIL_SERVICE,
  username: process.env.EMAIL_USERNAME,
  password: process.env.EMAIL_PASSWORD,
}));
