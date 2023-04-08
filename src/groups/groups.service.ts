import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';

import { Group, GroupDocument } from './schemas/group.schema';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel('group') private groupModel: Model<GroupDocument>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async findBySku(sku: string): Promise<Group> {
    const group = await this.groupModel.findOne({ sku }).exec();
    if (!group) throw new NotFoundException();
    return group;
  }

  async findAll(): Promise<{ count: number; data: Group[] }> {
    const cachedGroups = (await this.cache.get('auth-groups')) as string;

    if (cachedGroups == null) {
      const [count, data] = await Promise.all([
        this.groupModel.countDocuments().exec(),
        this.groupModel.find().exec(),
      ]);

      await this.cache.set(
        'auth-groups',
        JSON.stringify({ count, data }),
        24 * 60 * 60,
      );

      return { count, data };
    }

    const { count, data } = JSON.parse(cachedGroups);
    return { count, data };
  }

  async createGroup(group: CreateGroupDto): Promise<Group> {
    // Flush group cache
    await this.cache.del('auth-groups');

    const newGroup = new this.groupModel(group);
    return newGroup.save();
  }

  async updateGroup(sku: string, group: UpdateGroupDto): Promise<Group> {
    // Flush group cache
    await this.cache.del('auth-groups');

    const targetGroup = await this.groupModel.findOne({ sku }).exec();
    if (!targetGroup) throw new NotFoundException();

    targetGroup.name = group.name;
    targetGroup.description = group.description;
    targetGroup.perms = group.perms;

    return targetGroup.save();
  }

  async deleteGroup(id: string): Promise<Group> {
    // Flush group cache
    await this.cache.del('auth-groups');

    const targetGroup = await this.groupModel.findByIdAndDelete(id).exec();
    return targetGroup;
  }
}
