import { registerAs } from '@nestjs/config';

export default registerAs('cacheConfig', () => ({
  ttl: 10 * 1000,
  isGlobal: true,
}));
