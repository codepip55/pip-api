import { Email } from '../schemas/email.schema';

export class UpdateEmailDto {
  deletedTimestamp: number | null;
  tags: string[];
  isStarred: boolean;
  isRead: boolean;
  replies: Email[];
}

export class CreateEmailDto {
  sender: {
    name: string;
    email: string;
  };
  receiver: string;
  subject: {
    content: string;
    html: string;
  };
  body: {
    content: string;
    html: string;
  };
}
