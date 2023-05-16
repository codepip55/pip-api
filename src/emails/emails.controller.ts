import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { CreateEmailDto, UpdateEmailDto } from './dto/email.dto';
import { EmailsService } from './emails.service';
import { Email } from './schemas/email.schema';
import { User } from '../users/schemas/users.schema';
import { RequirePerms } from 'src/auth/permissions/permissions.decorator';

@Controller('emails')
@ApiBearerAuth()
@ApiTags('Emails')
export class EmailsController {
  constructor(private emailService: EmailsService) {}

  @Get()
  @RequirePerms()
  getAllEmails(
    @Query() qs: Record<string, any>,
    @Req() req: Request,
  ): Promise<{ count: number; data: Email[] }> {
    const user = req.user as User;

    const sort = qs.sort || 'sendDate';
    const offset = qs.offset ? parseInt(qs.offset) : 0;
    const limit = qs.limit ? parseInt(qs.limit) : 25;
    const query = qs.query ? qs.query : undefined;

    return this.emailService.findAllEmails(
      { sort, offset, limit, query },
      user.email,
    );
  }

  @Get('id/:id')
  @RequirePerms()
  getEmailById(@Param('id') id: string, @Req() req: Request): Promise<Email> {
    const user = req.user as User;

    return this.emailService.findEmailById(id, user.email);
  }

  @Get('sent')
  @RequirePerms()
  getSentEmails(
    @Req() req: Request,
  ): Promise<{ count: number; data: Email[] }> {
    const user = req.user as User;

    return this.emailService.findSentEmails(user.email);
  }

  /**
   * GET emails that come from email or name passed into the params
   * @param q Sender's email or name
   * @returns Emails matching above query
   */
  @Get('sender/:query')
  @RequirePerms()
  getEmailsFromSender(
    @Param('query') q: string,
    @Req() req: Request,
  ): Promise<{ count: number; data: Email[] }> {
    const user = req.user as User;

    return this.emailService.findEmailBySender(q, user.email);
  }

  @Get('tags')
  @RequirePerms()
  getEmailsByTags(
    @Query() q: string,
    @Req() req: Request,
  ): Promise<{ count: number; data: Email[] }> {
    const tags = q.split(' ');
    const user = req.user as User;

    return this.emailService.findEmailsByTags(tags, user.email);
  }

  @Put('id/:id')
  @RequirePerms()
  updateEmail(
    @Param('id') id: string,
    @Body() body: UpdateEmailDto,
    @Req() req: Request,
  ): Promise<Email> {
    const user = req.user as User;

    return this.emailService.updateEmail(id, body, user.email);
  }

  @Post()
  @RequirePerms()
  createEmail(
    @Body() body: CreateEmailDto,
    @Req() req: Request,
  ): Promise<Email> {
    const user = req.user as User;

    return this.emailService.createEmail(body, user);
  }

  @Delete(':id')
  @RequirePerms()
  deleteEmail(@Param('id') id: string, @Req() req: Request): Promise<Email> {
    const user = req.user as User;

    return this.emailService.markEmailForDelete(id, user.email);
  }

  @Post('receive')
  receiveEmail(@Req() req: Request) {
    return this.emailService.notifyReceive(req);
  }
}
