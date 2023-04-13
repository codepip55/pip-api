import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [NotificationsService]
})
export class NotificationsModule {}
