import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmailsController } from './emails.controller';
import { EmailsService } from './emails.service';
import { EmailSchema } from './schemas/email.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'emails', schema: EmailSchema }]),
  ],
  providers: [EmailsService],
  controllers: [EmailsController],
})
export class EmailsModule {}
