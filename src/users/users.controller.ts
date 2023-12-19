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
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdateUserPasswordDto } from './dtos/update-user-password.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  getAllUsers(@Query() query: Object) {
    return this.usersService.find(query);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get('me')
  getCurrentUser() {
    return 'This action returns current user';
  }

  @Patch('me')
  updateCurrentUserInfo(@Param('id') id: string, @Body() body: UpdateUserDto) {
    delete body.activated;
    delete body.active;
    return `This action updates current user`;
  }

  @Patch('me/updatePassword')
  updateCurrentUserPassword(
    @Param('id') id: string,
    @Body() body: UpdateUserPasswordDto,
  ) {
    return `This action updates current user password`;
  }

  @Patch('me')
  deleteCurrentUser(@Param('id') id: string) {
    return `This action deletes current user`;
  }
}
