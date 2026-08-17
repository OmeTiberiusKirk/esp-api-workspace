import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { REG_SERVICE_CLIENT } from '../../constants/service-clients.constants';
import { ThaiGovAuthController } from './thai-gov-auth.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: REG_SERVICE_CLIENT,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('REG_SERVICE_HOST'),
            port: configService.get<number>('REG_SERVICE_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ThaiGovAuthController],
})
export class ThaiGovAuthModule {}
