import { ConfigService } from '@nestjs/config';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export const getMailerConfig = (
  configService: ConfigService,
): SMTPTransport.Options => ({
  host: configService.get<string>('EMAIL_HOST'),
  port: configService.get<number>('EMAIL_PORT'),
  ...(configService.get<string>('EMAIL_PROVIDER') === 'self' && {
    auth: {
      user: configService.get<string>('EMAIL_USER'),
      pass: configService.get<string>('EMAIL_PASS'),
    },
  }),
});
