import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { UserDto } from './dto/users.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('id/:id')
  findUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('email/:email')
  findUserByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get('name/:name')
  findUsersByName(@Param('name') name: string) {
    return this.usersService.findByName(name);
  }

  @Post()
  createUser(@Body() body: UserDto) {
    return this.usersService.createUser(body);
  }

  @Put(':id')
  updateUser(@Param('id') id: string, @Body() body: UserDto) {
    return this.usersService.updateUser(id, body);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Put('groups/:id')
  updateUserGroups(
    @Param('id') id: string,
    @Body() body: { groups: string[] },
  ) {
    return this.usersService.updateUserGroups(id, body.groups);
  }
}
