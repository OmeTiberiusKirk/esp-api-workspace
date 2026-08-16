import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { getMailerConfig } from '../../configs/mailer.configs';
import { createTransport } from 'nodemailer';

@Module({
  providers: [
    {
      provide: 'transporter',
      useFactory: (configService: ConfigService) =>
        createTransport(getMailerConfig(configService)),
      inject: [ConfigService],
    },
    MailerService,
  ],
  exports: [MailerService],
})
export class MailerModule {}
