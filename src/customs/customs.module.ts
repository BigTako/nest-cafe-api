import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Custom } from './custom.entity';
import { CustomsController } from './customs.controller';
import { CustomsService } from './customs.service';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    AuthModule,
    JwtModule,
    UsersModule,
    TypeOrmModule.forFeature([Custom]),
  ],
  controllers: [CustomsController],
  providers: [CustomsService],
  exports: [CustomsService],
})
export class CustomsModule {}
