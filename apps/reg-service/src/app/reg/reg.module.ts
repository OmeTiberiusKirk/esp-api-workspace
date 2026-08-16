import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegService } from './reg.service';
import { RegController } from './reg.controller';
import { OtpService } from './otp.service';
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
  controllers: [RegController],
  providers: [PrismaService, RegService, OtpService],
})
export class RegModule {}
