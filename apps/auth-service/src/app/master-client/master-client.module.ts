import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { MASTER_SERVICE_CLIENT } from '../../constants/service-clients.constants';
import { MasterClientService } from './master-client.service';

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
  providers: [MasterClientService],
  exports: [MasterClientService],
})
export class MasterClientModule {}
