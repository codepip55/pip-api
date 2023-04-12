import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist';

import { GroupsModule } from 'src/groups/groups.module';
import { UserSchema } from './schemas/users.schema';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),
    GroupsModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
