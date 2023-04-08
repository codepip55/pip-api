import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member, MemberDocument } from './schemas/member.schema';
import { Model } from 'mongoose';
import { Permissions } from 'src/auth/permissions/permissions';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';
import { GroupsService } from 'src/groups/groups.service';
import { User } from 'src/users/schemas/users.schema';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel('member') private memberModel: Model<MemberDocument>,
    private groupsService: GroupsService,
  ) {}

  async findAll(options: any): Promise<{ count: number; data: Member[] }> {
    const queryItems: any[] = [];

    if (options.name !== undefined) {
      queryItems.push({ $text: { $search: options.name } });
    }

    const queryObj = queryItems.length > 0 ? { $and: queryItems } : {};
    const [count, data] = await Promise.all([
      this.memberModel.countDocuments(queryObj).exec(),
      this.memberModel
        .find(queryObj)
        .skip(options.offset)
        .limit(options.limit)
        .sort(options.sort)
        .select(options.canViewEmail ? '' : '-email')
        .exec(),
    ]);

    return { count, data };
  }

  async findById(id: string): Promise<Member> {
    const member = await this.memberModel.findById(id);
    if (!member) throw new NotFoundException();
    return member;
  }

  async findByEmail(email: string): Promise<Member> {
    const member = await this.memberModel.findOne({ email });
    if (!member) throw new NotFoundException();
    return member;
  }

  async updateMember(
    id: string,
    dto: UpdateMemberDto,
    user: User,
  ): Promise<Member> {
    const member = await this.memberModel.findById(id);
    if (!member) throw new NotFoundException();

    member.nameFirst = dto.nameFirst;
    member.nameLast = dto.nameLast;
    member.nameFull = dto.nameFull;
    // @ts-expect-error Groups are assigned by SKU, `member.groups` accepts an array of group objects but the dto passes in an array of strings (group skus)
    if (dto.groups) member.groups = dto.groups;
    member.isActive = dto.isActive;
    member.isBanned = dto.isBanned;
    if (
      this.memberHasPerms(user.member, Permissions.UpdateMemberEmail) &&
      dto.email
    )
      member.email = dto.email;

    const savedMember = await member.save();
    const populatedMember = (
      await savedMember.populate('groups', 'sku description name')
    ).toObject() as Member;

    populatedMember.perms = await this.getPermissions(populatedMember);

    if (!this.memberHasPerms(user.member, Permissions.ViewMemberEmail))
      populatedMember.email = null;

    return populatedMember;
  }

  memberHasPerms(member: Member, ...perms: any[]) {
    if (member === null) return false;
    return perms.every((p) => member.perms.includes(p));
  }

  async getPermissions(user: Member): Promise<string[]> {
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

  async createMember(dto: CreateMemberDto): Promise<Member> {
    const dup: Array<object> = await this.memberModel.find({
      email: dto.email,
    });

    if (dup.length > 0) throw new ForbiddenException('User already exists');

    const savedUser = await (
      await new this.memberModel(dto).save()
    ).populate('groups', 'name description sku');

    return savedUser;
  }
}
