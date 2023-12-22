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
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateUserPasswordDto } from './dtos/update-user-password.dto';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { RolesGuard } from '../guards/roles.guard';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { QueryPipe } from '../pipes/query.pipe';

@Controller('users')
@Serialize(UserDto)
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  getAllUsers(@Query(QueryPipe) query: Object) {
    return this.usersService.find(query);
  }

  @Get('me')
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
        'Password cannot be changed here. User /me/updatePassword instead.',
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
