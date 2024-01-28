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
  ForbiddenException,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateUserPasswordDto } from './dtos/update-user-password.dto';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from './enums/role.enum';
import { RolesGuard } from '../guards/roles.guard';
import { Serialize } from '../decorators/serialize.decorator';
import { UserDto } from './dtos/user.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { QueryPipe } from '../pipes/query.pipe';
import { ConfigService } from '@nestjs/config';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller({
  path: 'users',
  version: '1',
})
@Serialize(UserDto)
@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  @CacheTTL(0)
  @Get()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  getAllUsers(@Query(QueryPipe) query: Object) {
    return this.usersService.find(query);
  }

  @Get('me')
  @CacheKey('currentUser')
  getCurrentUser(@CurrentUser() user: UserDto) {
    return user;
  }

  @Patch('me')
  updateCurrentUserInfo(
    @CurrentUser() user: UserDto,
    @Body() body: UpdateUserDto,
  ) {
    if (body.password || body.passwordConfirm) {
      throw new ForbiddenException(
        this.configService.get('errorMessages.PASSWORD_UPDATE_FORBIDDEN'),
      );
    }
    delete body.activated;
    delete body.active;
    return this.usersService.update(user.id, body);
  }

  @Patch('me/updatePassword')
  updateCurrentUserPassword(
    @CurrentUser() user: UserDto,
    @Body() body: UpdateUserPasswordDto,
  ) {
    return this.usersService.updatePassword(user.id, body);
  }

  @Delete('me')
  deleteCurrentUser(@CurrentUser() user: UserDto) {
    return this.usersService.update(user.id, { active: false });
  }

  @CacheTTL(0)
  @Get(':id')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  getUser(@Param('id') id: string) {
    return this.usersService.findOne(parseInt(id, 10));
  }

  @Post()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(+id, body);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
