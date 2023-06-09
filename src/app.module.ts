import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LoggingFilter } from './utils/logging.filter';
import { GroupsModule } from './groups/groups.module';
import { EmailsModule } from './emails/emails.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URI'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    GroupsModule,
    EmailsModule,
    ScheduleModule.forRoot(),
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: LoggingFilter,
    },
  ],
})
export class AppModule {}
