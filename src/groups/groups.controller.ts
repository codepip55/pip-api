import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Group } from './schemas/group.schema';
import { GroupsService } from './groups.service';
import { RequirePerms } from '../auth/permissions/permissions.decorator';
import {
  PermissionDetail,
  permissionDetails,
  Permissions as Perms,
} from '../auth/permissions/permissions';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';

@ApiBearerAuth()
@ApiTags('Groups')
@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Get()
  @RequirePerms(Perms.ViewGroups)
  async list(): Promise<{ count: number; data: Group[] }> {
    return this.groupsService.findAll();
  }

  @Get('permissions')
  @RequirePerms(Perms.ViewGroups)
  listPerms(): PermissionDetail[] {
    return permissionDetails;
  }

  @Get(':sku')
  @RequirePerms(Perms.ViewGroups)
  async findFromSku(@Param('sku') sku: string): Promise<Group> {
    return this.groupsService.findBySku(sku);
  }

  @Post()
  @RequirePerms(Perms.CreateGroups)
  async createGroup(@Body() group: CreateGroupDto): Promise<Group> {
    return this.groupsService.createGroup(group);
  }

  @Put(':sku')
  @RequirePerms(Perms.UpdateGroups)
  async updateGroup(
    @Param('sku') sku: string,
    @Body() group: UpdateGroupDto,
  ): Promise<Group> {
    return this.groupsService.updateGroup(sku, group);
  }

  @Delete(':id')
  @RequirePerms(Perms.DeleteGroups)
  async deleteGroup(@Param('id') id: string): Promise<Group> {
    return this.groupsService.deleteGroup(id);
  }
}
