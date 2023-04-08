import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailSchema } from './schemas/email.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'emails', schema: EmailSchema }]),
  ],
  providers: [EmailsService],
  controllers: [EmailsController],
})
export class EmailsModule {}
