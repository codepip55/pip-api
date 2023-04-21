import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose/dist';

import { GroupsModule } from 'src/groups/groups.module';
import { UserSchema } from './schemas/users.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Oauth2Module } from 'src/oauth2/oauth2.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),
    GroupsModule,
    Oauth2Module
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
