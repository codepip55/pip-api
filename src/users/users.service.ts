import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist/common';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/users.schema';
import { GroupsService } from 'src/groups/groups.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('user') private userModel: Model<UserDocument>,
    private groupsService: GroupsService,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .populate('member', 'nameFull email')
      .exec();
    if (!user) throw new NotFoundException();
    return user;
  }

  async findByGhIdAndUpdate(pUser: any): Promise<User> {
    const u = pUser.data;
    const ghId = u.id;

    const user = await this.userModel
      .findOneAndUpdate(
        { ghId },
        {
          ghName: u.name,
          ghUsername: u.login,
        },
        { new: true },
      )
      .populate('member.groups', 'sku')
      .populate('member', 'nameFull groups')
      .exec();

    if (user.member) user.member.perms = await this.getPermissions(user);

    return user;
  }

  async findByGhId(id: string | number): Promise<User> {
    id = Number(id);
    const user = await this.userModel
      .findOne({ ghId: id })
      .populate('member.groups', 'name description sku')
      .populate('member', 'nameFull groups')
      .exec();

    if (!user) throw new NotFoundException();

    if (user.member) user.member.perms = await this.getPermissions(user);

    return user;
  }

  async createUser(pUser: any): Promise<User> {
    const u = pUser.data;
    const ghId = Number(u.id);

    const user = new this.userModel({
      ghId,
      ghName: u.name,
      ghUsername: u.login,
    });

    const savedUser = await (
      await user.save()
    ).populate('member.groups', 'sku');
    if (savedUser.member)
      savedUser.member.perms = await this.getPermissions(savedUser);

    return savedUser;
  }

  async getPermissions(user: User): Promise<string[]> {
    if (!user.member)
      throw new ForbiddenException('No member linked with this user!');
    if (!user.member.groups || user.member.groups.length == 0) return [];

    const { data: allGroups } = await this.groupsService.findAll();
    const userPerms = new Set<string>();

    // Add permissions from each of user's groups
    user.member.groups.forEach((userGroup) => {
      const groupRecord = allGroups.find((g) => g.sku === userGroup.sku);
      groupRecord.perms.forEach((p) => userPerms.add(p));
    });

    return Array.from(userPerms);
  }

  hasPerms(user: User, ...perms: any[]) {
    if (!user.member) return false;
    if (user === null) return false;
    return perms.every((p) => user.member.perms.includes(p));
  }
}
