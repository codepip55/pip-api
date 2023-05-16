import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from '@nestjs/schedule/dist';
import * as SendGrid from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { Email, EmailDocument } from './schemas/email.schema';
import { CreateEmailDto, UpdateEmailDto } from './dto/email.dto';
import { User } from 'src/users/schemas/users.schema';

@Injectable()
export class EmailsService {
  constructor(
    @InjectModel('emails') private emailModel: Model<EmailDocument>,
    private configService: ConfigService,
  ) {
    SendGrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  async findAllEmails(
    options: any,
    userEmail: string,
  ): Promise<{ count: number; data: Email[] }> {
    const queryItems: any[] = [];

    if (options.query !== undefined) {
      queryItems.push({ $text: { $search: options.query } });
    }

    queryItems.push({
      $or: [{ 'sender.email': userEmail }, { 'receiver.email': userEmail }],
    });

    const queryObj = queryItems.length > 0 ? { $and: queryItems } : {};
    const [count, data] = await Promise.all([
      this.emailModel.countDocuments(queryObj).exec(),
      this.emailModel
        .find(queryObj)
        .skip(options.offset)
        .limit(options.limit)
        .sort(options.sort)
        .exec(),
    ]);

    return { count, data };
  }

  async findEmailById(id: string, userEmail: string): Promise<Email> {
    const email = await this.emailModel.findById(id);
    if (!email) throw new NotFoundException();

    if (email.sender.email === userEmail || email.receiver.email === userEmail)
      throw new ForbiddenException();

    return email;
  }

  async findEmailBySender(
    querySender: string,
    userEmail: string,
  ): Promise<{ count: number; data: Email[] }> {
    const [count, data] = await Promise.all([
      this.emailModel
        .countDocuments({
          $or: [
            { 'sender.email': querySender },
            { 'sender.name': querySender },
          ],
          'receiver.email': userEmail,
        })
        .exec(),
      this.emailModel
        .find({
          $or: [
            { 'sender.email': querySender },
            { 'sender.name': querySender },
          ],
          'receiver.email': userEmail,
        })
        .exec(),
    ]);

    return { count, data };
  }

  async findSentEmails(
    email: string,
  ): Promise<{ count: number; data: Email[] }> {
    const [count, data] = await Promise.all([
      this.emailModel.countDocuments({ 'sender.email': email }).exec(),
      this.emailModel.find({ 'sender.email': email }).exec(),
    ]);

    return { count, data };
  }

  async findEmailsByTags(
    tags: string[],
    userEmail: string,
  ): Promise<{ count: number; data: Email[] }> {
    const [count, data] = await Promise.all([
      this.emailModel
        .countDocuments({ tags: { $in: tags }, 'receiver.email': userEmail })
        .exec(),
      this.emailModel
        .find({ tags: { $in: tags }, 'receiver.email': userEmail })
        .exec(),
    ]);

    return { count, data };
  }

  async updateEmail(
    id: string,
    dto: UpdateEmailDto,
    userEmail: string,
  ): Promise<Email> {
    const targetEmail = await this.emailModel.findById(id);
    if (!targetEmail) throw new NotFoundException();

    if (
      targetEmail.sender.email === userEmail ||
      targetEmail.receiver.email === userEmail
    )
      throw new ForbiddenException();

    targetEmail.deletedTimestamp = dto.deletedTimestamp;
    targetEmail.tags = dto.tags;
    targetEmail.isStarred = dto.isStarred;
    targetEmail.isRead = dto.isRead;
    targetEmail.replies = dto.replies;

    return await targetEmail.save();
  }

  async markEmailForDelete(id: string, userEmail: string): Promise<Email> {
    const targetEmail = await this.emailModel.findById(id);
    if (!targetEmail) throw new NotFoundException();

    if (
      targetEmail.sender.email === userEmail ||
      targetEmail.receiver.email === userEmail
    )
      throw new ForbiddenException();

    targetEmail.tags = [];
    targetEmail.deletedTimestamp = new Date().getTime();

    return await targetEmail.save();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'Delete Emails',
    timeZone: 'Europe/London',
  })
  private async deleteEmails() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const timeStamp = thirtyDaysAgo.getTime();

    this.emailModel.deleteMany({ deletedTimestamp: { $lt: timeStamp } }).exec();
  }

  async createEmail(dto: CreateEmailDto, member: User): Promise<Email> {
    const email = new this.emailModel({
      sender: {
        name: dto.sender.name,
        email: dto.sender.email,
      },
      receiver: {
        email: dto.receiver,
      },
      subject: {
        content: dto.subject.content,
        html: dto.subject.html,
      },
      body: {
        content: dto.subject.content,
        html: dto.subject.html,
      },
      deletedTimestamp: null,
      tags: [],
      sendDate: new Date(),
      isStarred: false,
      isRead: false,
    });

    const savedEmail = await email.save();

    if (dto.sender.email === member[0].email) this.sendEmail(savedEmail.id);

    return savedEmail;
  }

  async sendEmail(id: string) {
    const email = await this.emailModel.findById(id);

    SendGrid.send({
      to: {
        name: email.receiver.name,
        email: email.receiver.email,
      },
      from: {
        name: email.sender.name,
        email: email.sender.email,
      },
      replyTo: {
        name: email.sender.name,
        email: email.sender.email,
      },
      subject: email.subject.content,
      content: [
        {
          type: 'text/html',
          value: email.subject.html,
        },
      ],
    });
  }

  async notifyReceive(req: any) {
    console.log(req);

    SendGrid.send({
      to: {
        email: 'pepcplace@gmail.com',
      },
      from: {
        email: 'noreply@pepijncolenbrander.com',
      },
      subject: 'Received Email',
      content: [
        {
          type: 'text/html',
          value: '<h1>Received Email</h1><p>' + req + '</p>',
        },
      ],
    });

    console.log('Notified');
  }
}
