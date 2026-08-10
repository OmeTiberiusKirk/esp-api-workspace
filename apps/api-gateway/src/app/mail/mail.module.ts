import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { MailController } from './mail.controller';
import { MAIL_SERVICE_CLIENT } from '../../assets/constants/service-clients.constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MAIL_SERVICE_CLIENT,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('MAIL_SERVICE_HOST'),
            port: configService.get<number>('MAIL_SERVICE_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [MailController],
})
export class MailModule {}
