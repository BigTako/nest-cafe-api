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
  UseInterceptors,
} from '@nestjs/common';
import { CustomsService } from './customs.service';
import { QueryPipe } from '../pipes/query.pipe';
import { CreateCustomDto } from './dtos/create-custom.dto';
import { UpdateCustomDto } from './dtos/update-custom.dto';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { RolesGuard } from '../guards/roles.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller({
  path: 'customs',
  version: '1',
})
@UseInterceptors(CacheInterceptor)
export class CustomsController {
  constructor(private customsService: CustomsService) {}

  // 10 seconds
  @Get('topOrdered')
  getTopOrderedCustoms(@Query('limit') limit: number = 5) {
    return this.customsService.findTopOrdered(limit);
  }

  // 10 seconds
  @Get('topOrdered/me')
  @UseGuards(AuthGuard)
  getCurrentUserTopOrderedCustoms(
    @CurrentUser() user: User,
    @Query('limit') limit: number = 5,
  ) {
    return this.customsService.findUserTopOrdered(user.id, limit);
  }

  // 10 seconds
  @Get('topOrdered/:id')
  @UseGuards(AuthGuard)
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  getUserTopOrderedCustoms(
    @Param('id') id: string,
    @Query('limit') limit: number = 5,
  ) {
    return this.customsService.findUserTopOrdered(parseInt(id), limit);
  }

  @CacheTTL(0)
  @Get()
  getCustoms(@Query(QueryPipe) query: Object) {
    return this.customsService.find(query);
  }

  @Post()
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  createCustom(@Body() body: CreateCustomDto) {
    return this.customsService.create(body);
  }

  @CacheTTL(0)
  @Get(':id')
  getCustom(@Param('id') id: string) {
    return this.customsService.findOne(parseInt(id));
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
