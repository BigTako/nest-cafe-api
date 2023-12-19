import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { CustomsService } from './customs.service';
import { QueryPipe } from '../pipes/query.pipe';
import { CreateCustomDto } from './dtos/create-custom.dto';
import { UpdateCustomDto } from './dtos/update-custom.dto';

@Controller('customs')
export class CustomsController {
  constructor(private customsService: CustomsService) {}

  @Get()
  getCustoms(@Query(QueryPipe) query: Object) {
    return this.customsService.find(query);
  }

  @Get(':id')
  getCustom(@Param('id') id: string) {
    return this.customsService.findOne(parseInt(id));
  }

  @Get('topOrdered')
  getTopOrderedCustoms() {
    return Promise.resolve([]);
  }

  @Get('topOrdered/me')
  getCurrentUserTopOrderedCustoms() {
    return Promise.resolve([]);
  }

  @Get('topOrdered/:id')
  getUserTopOrderedCustoms() {
    return Promise.resolve([]);
  }

  @Post()
  createCustom(@Body() body: CreateCustomDto) {
    return this.customsService.create(body);
  }

  @Patch(':id')
  updateCustom(@Param('id') id: string, @Body() body: UpdateCustomDto) {
    return this.customsService.update(parseInt(id), body);
  }

  @Delete(':id')
  async deleteCustom(@Param('id') id: string) {
    await this.customsService.remove(parseInt(id));
    return null;
  }
}
