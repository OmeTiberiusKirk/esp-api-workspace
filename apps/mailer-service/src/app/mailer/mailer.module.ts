import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { MailController } from './mailer.controller';
import { createTransport } from 'nodemailer';

@Module({
  controllers: [MailController],
  providers: [
    {
      provide: 'transporter',
      useFactory: (configService: ConfigService) =>
        createTransport(configService.get('mailer')),
      inject: [ConfigService],
    },
    MailerService,
  ],
  exports: [MailerService],
})
export class MailerModule {}
