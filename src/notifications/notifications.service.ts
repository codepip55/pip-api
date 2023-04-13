import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class NotificationsService {
    constructor (
        private configService: ConfigService,
    ) {
        SendGrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'))
    }

    async sendEmail(
        email: {
            toAddresses: string[], 
            content: object, 
            subject: string,
            body: string
        }
    ) {
        await SendGrid.send({
            to: email.toAddresses,
            from: { name: this.configService.get<string>("SENDGRID_FROM_NAME"), email: this.configService.get<string>("SENDGRID_FROM_ADDRESS") },
            subject: email.subject,
            content: [
                {
                    type: 'text/html',
                    value: email.body
                }
            ]
        })
    }
}
