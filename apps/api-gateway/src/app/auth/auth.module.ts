import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { AUTH_SERVICE_CLIENT } from '../../constants/service-clients.constants';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE_CLIENT,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('AUTH_SERVICE_HOST'),
            port: configService.get<number>('AUTH_SERVICE_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
