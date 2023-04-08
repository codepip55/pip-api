import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MemberSchema } from './schemas/member.schema';
import { GroupsModule } from 'src/groups/groups.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'member', schema: MemberSchema }]),
    GroupsModule,
    UsersModule,
  ],
  providers: [MembersService],
  controllers: [MembersController],
})
export class MembersModule {}
