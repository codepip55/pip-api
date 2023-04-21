import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose/dist/common';
import { Model } from 'mongoose';
import * as argon from 'argon2';

import { User, UserDocument } from './schemas/users.schema';
import { GroupsService } from 'src/groups/groups.service';
import { UserDto } from './dto/users.dto';
import { Oauth2Service } from 'src/oauth2/oauth2.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('user') private userModel: Model<UserDocument>,
    private groupsService: GroupsService,
    private oauth2Service: Oauth2Service
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException();
    delete user.password;
    return user;
  }

  async findByName(name: string): Promise<User[]> {
    const users = await this.userModel
      .find({ $text: { $search: name } })
      .exec();
    users.forEach((u) => delete u.password);
    return users;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException();
    delete user.password;
    return user;
  }

  async createUser(body: UserDto, signup: boolean = false): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: body.email })
    if (existingUser) throw new ForbiddenException('User with this email already exists.');

    if (!signup) {
      const newUser = new this.userModel({
        nameFirst: body.nameFirst,
        nameLast: body.nameLast,
        groups: body.groups,
        isActive: body.isActive,
        isBanned: body.isBanned,
        email: body.email,
        customDomainEmail: body.customDomainEmail ? body.customDomainEmail : null,
        nameFull: `${body.nameFirst} ${body.nameLast}`,
        password: await argon.hash(body.password),
      });
      const savedUser = await newUser.save();
      delete savedUser.password;
      return savedUser;
    } else {
      const newUser = new this.userModel({
        nameFirst: body.nameFirst,
        nameLast: body.nameLast,
        groups: body.groups,
        isActive: false,
        isBanned: body.isBanned,
        email: body.email,
        customDomainEmail: body.customDomainEmail ? body.customDomainEmail : null,
        nameFull: `${body.nameFirst} ${body.nameLast}`,
        password: await argon.hash(body.password),
      });
      const savedUser = await newUser.save();
      delete savedUser.password;

      this.oauth2Service.verifyEmail(savedUser.nameFirst, savedUser.email);

      return savedUser;
    }
  }

  async updateUser(id: string, dto: UserDto): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException();

    if (dto.nameFirst) user.nameFirst = dto.nameFirst;
    if (dto.nameLast) user.nameLast = dto.nameLast;
    if (dto.nameFirst || dto.nameLast)
      user.nameFull = `${dto.nameFirst} ${dto.nameLast}`;
    // @ts-expect-error DTO passes group SKUs, while schema accepts the full group object
    if (dto.groups) user.groups = dto.groups;
    if (dto.isActive) user.isActive = dto.isActive;
    if (dto.isBanned) user.isBanned = dto.isBanned;
    if (dto.email) user.email = dto.email;
    if (dto.password) user.password = await argon.hash(dto.password);
    if (dto.customDomainEmail) user.customDomainEmail = dto.customDomainEmail;

    return user.save();
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException();
    delete user.password;
    return user;
  }

  async updateUserGroups(id: string, groups: string[]): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException();

    // @ts-expect-error DTO passes group SKUs, while schema accepts the full group object
    user.groups = groups;

    const savedUser = await user.save();
    delete savedUser.password;
    return savedUser;
  }

  async getPermissions(user: User): Promise<string[]> {
    if (!user.groups || user.groups.length == 0) return [];

    const { data: allGroups } = await this.groupsService.findAll();
    const userPerms = new Set<string>();

    // Add permissions from each of user's groups
    user.groups.forEach((userGroup) => {
      const groupRecord = allGroups.find((g) => g.sku === userGroup.sku);
      groupRecord.perms.forEach((p) => userPerms.add(p));
    });

    return Array.from(userPerms);
  }

  hasPerms(user: User, ...perms: any[]) {
    if (user === null) return false;
    return perms.every((p) => user.perms.includes(p));
  }
}
