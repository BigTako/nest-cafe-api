import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Custom } from './custom.entity';
import { CustomsController } from './customs.controller';
import { CustomsService } from './customs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Custom])],
  controllers: [CustomsController],
  providers: [CustomsService],
  exports: [CustomsService],
})
export class CustomsModule {}
