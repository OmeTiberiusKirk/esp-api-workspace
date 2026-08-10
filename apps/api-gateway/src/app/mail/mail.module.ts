import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { OtpController } from './otp.controller';
import { OTP_SERVICE_CLIENT } from '../../assets/constants/service-clients.constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: OTP_SERVICE_CLIENT,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('OTP_SERVICE_HOST'),
            port: configService.get<number>('OTP_SERVICE_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [OtpController],
})
export class OtpModule {}
