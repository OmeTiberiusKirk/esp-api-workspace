import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OtpService } from '../otp/otp.service';
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
  controllers: [AuthController],
  providers: [PrismaService, AuthService, OtpService],
})
export class AuthModule {}
