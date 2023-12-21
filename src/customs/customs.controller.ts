import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomsService } from './customs.service';
import { QueryPipe } from '../pipes/query.pipe';
import { CreateCustomDto } from './dtos/create-custom.dto';
import { UpdateCustomDto } from './dtos/update-custom.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/guards/roles.guard';

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
  @UseGuards(AuthGuard)
  getCurrentUserTopOrderedCustoms() {
    return Promise.resolve([]);
  }

  @Get('topOrdered/:id')
  @UseGuards(AuthGuard)
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  getUserTopOrderedCustoms() {
    return Promise.resolve([]);
  }

  @Post()
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  createCustom(@Body() body: CreateCustomDto) {
    return this.customsService.create(body);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  updateCustom(@Param('id') id: string, @Body() body: UpdateCustomDto) {
    return this.customsService.update(parseInt(id), body);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  async deleteCustom(@Param('id') id: string) {
    await this.customsService.remove(parseInt(id));
    return null;
  }
}
