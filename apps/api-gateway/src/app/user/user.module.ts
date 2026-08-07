import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserController } from './user.controller';
import { MASTER_SERVICE_CLIENT } from '../../assets/constants/service-clients.constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MASTER_SERVICE_CLIENT,
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('MASTER_SERVICE_HOST'),
            port: configService.get<number>('MASTER_SERVICE_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [UserController],
})
export class UserModule {}
