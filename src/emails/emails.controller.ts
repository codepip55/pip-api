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

  /**
   * Get all emails
   * @param qs Query
   * @param req Request
   * @returns Emails matching query
   */
  @Get()
  @RequirePerms()
  async getAllEmails(
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

  /**
   * Find email by ID
   * @param id Email ID
   * @param req Request
   * @returns Email Document
   */
  @Get('id/:id')
  @RequirePerms()
  async getEmailById(@Param('id') id: string, @Req() req: Request): Promise<Email> {
    const user = req.user as User;

    return this.emailService.findEmailById(id, user.email);
  }

  /**
   * Get sent emails
   * @param req Request
   * @returns Email Documents
   */
  @Get('sent')
  @RequirePerms()
  async getSentEmails(
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
  async getEmailsFromSender(
    @Param('query') q: string,
    @Req() req: Request,
  ): Promise<{ count: number; data: Email[] }> {
    const user = req.user as User;

    return this.emailService.findEmailBySender(q, user.email);
  }

  /**
   * Get emails by tags
   * @param q tags
   * @param req Request
   * @returns Email Documents
   */
  @Get('tags')
  @RequirePerms()
  async getEmailsByTags(
    @Query() q: string,
    @Req() req: Request,
  ): Promise<{ count: number; data: Email[] }> {
    const tags = q.split(' ');
    const user = req.user as User;

    return this.emailService.findEmailsByTags(tags, user.email);
  }

  /**
   * Update Email
   * @param id Email ID
   * @param body Email DTO
   * @param req Request
   * @returns Updated Email
   */
  @Put('id/:id')
  @RequirePerms()
  async updateEmail(
    @Param('id') id: string,
    @Body() body: UpdateEmailDto,
    @Req() req: Request,
  ): Promise<Email> {
    const user = req.user as User;

    return this.emailService.updateEmail(id, body, user.email);
  }

  /**
   * Create Email
   * @param body Email DTO
   * @param req Request
   * @returns New Email
   */
  @Post()
  @RequirePerms()
  async createEmail(
    @Body() body: CreateEmailDto,
    @Req() req: Request,
  ): Promise<Email> {
    const user = req.user as User;

    return this.emailService.createEmail(body, user);
  }

  /**
   * Delete Email
   * @param id Email ID
   * @param req Request
   * @returns Deleted Email
   */
  @Delete(':id')
  @RequirePerms()
  async deleteEmail(@Param('id') id: string, @Req() req: Request): Promise<Email> {
    const user = req.user as User;

    return this.emailService.markEmailForDelete(id, user.email);
  }

  @Post('receive')
  receiveEmail(@Body() body: any) {
    try {
      console.log('received email', body)
    } catch (error) {
      console.error(error)
    }
  }
}
