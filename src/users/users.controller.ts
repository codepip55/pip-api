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

  /**
   * Find user by ID
   * @param id User's ID
   * @returns User Document
   */
  @Get('id/:id')
  findUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  /**
   * Find user by email
   * @param email User's Email
   * @returns User Document
   */
  @Get('email/:email')
  findUserByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  /**
   * Find users by name
   * @param name User's Name
   * @returns User Documents
   */
  @Get('name/:name')
  findUsersByName(@Param('name') name: string) {
    return this.usersService.findByName(name);
  }

  /**
   * Create a new user
   * @param body User DTO
   * @returns User Document
   */
  @Post()
  createUser(@Body() body: UserDto) {
    return this.usersService.createUser(body);
  }

  /**
   * Self-create a new user - sends confirmation email as well
   * @param body User DTO
   * @returns User Document
   */
  @Post('signup')
  createAccount(@Body() body: UserDto) {
    return this.usersService.createUser(body)
  }

  /**
   * Update a user document
   * @param id User ID
   * @param body User DTO
   * @returns Updated User Document
   */
  @Put(':id')
  updateUser(@Param('id') id: string, @Body() body: UserDto) {
    return this.usersService.updateUser(id, body);
  }

  /**
   * Delete a user
   * @param id User's ID
   * @returns Deleted user's document
   */
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  /**
   * Update a user's group
   * @param id User's ID
   * @param body Group SKUs
   * @returns User Document
   */
  @Put('groups/:id')
  updateUserGroups(
    @Param('id') id: string,
    @Body() body: { groups: string[] },
  ) {
    return this.usersService.updateUserGroups(id, body.groups);
  }
}
