import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Permissions as Perms } from 'src/auth/permissions/permissions';
import { RequirePerms } from 'src/auth/permissions/permissions.decorator';
import { User } from 'src/users/schemas/users.schema';
import { UsersService } from 'src/users/users.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';
import { MembersService } from './members.service';
import { Member } from './schemas/member.schema';

@Controller('members')
@ApiBearerAuth()
@ApiTags('Members')
export class MembersController {
  constructor(
    private memberService: MembersService,
    private userService: UsersService,
  ) {}

  @Get()
  @RequirePerms(Perms.ViewMember)
  listAllMembers(
    @Query() qs: Record<string, string>,
    @Req() req: Request,
  ): Promise<{ count: number; data: Member[] }> {
    const user = req.user as User;
    const canViewEmail = this.userService.hasPerms(user, Perms.ViewMemberEmail);

    const sort = qs.sort || 'ghId';
    const offset = qs.offset ? parseInt(qs.offset) : 0;
    const limit = qs.limit ? parseInt(qs.limit) : 25;

    return this.memberService.findAll({
      sort,
      offset,
      limit,
      name: qs['user-name'],
      canViewEmail,
    });
  }

  // GET member by ID
  @Get('id/:id')
  @RequirePerms(Perms.ViewMember)
  findMemberById(@Param('id') id: string): Promise<Member> {
    return this.memberService.findById(id);
  }

  // GET member by email
  @Get('email/:email')
  @RequirePerms(Perms.ViewMember, Perms.ViewMemberEmail)
  findMemberByEmail(@Param('email') email: string): Promise<Member> {
    return this.memberService.findByEmail(email);
  }

  // PUT member
  @Put('id/:id')
  @RequirePerms(Perms.UpdateMember)
  updateMember(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
    @Req() req: Request,
  ): Promise<Member> {
    const user = req.user as User;

    return this.memberService.updateMember(id, dto, user);
  }

  // POST member
  @Post()
  @RequirePerms(Perms.CreateMember, Perms.ViewMemberEmail)
  createMember(@Body() dto: CreateMemberDto): Promise<Member> {
    return this.memberService.createMember(dto);
  }
}
