import { Module, CacheModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GroupsService } from './groups.service';
import { GroupSchema } from './schemas/group.schema';
import { GroupsController } from './groups.controller';

@Module({
  imports: [
    CacheModule.register(),
    MongooseModule.forFeature([{ name: 'group', schema: GroupSchema }]),
  ],
  providers: [GroupsService],
  controllers: [GroupsController],
  exports: [GroupsService],
})
export class GroupsModule {}
