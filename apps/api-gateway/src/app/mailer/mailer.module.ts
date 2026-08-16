import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { MailController } from './mailer.controller';
import { MAILER_SERVICE_CLIENT } from '../../constants/service-clients.constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MAILER_SERVICE_CLIENT,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('MAILER_SERVICE_HOST'),
            port: configService.get<number>('MAILER_SERVICE_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [MailController],
})
export class MailModule {}
