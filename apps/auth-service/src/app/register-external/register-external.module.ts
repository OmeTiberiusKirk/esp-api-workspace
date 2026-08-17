import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { FileStorageModule } from '../file-storage/file-storage.module';
import { MAILER_SERVICE_CLIENT } from '../../constants/service-clients.constants';
import { RegisterExternalController } from './register-external.controller';
import { RegisterExternalService } from './register-external.service';

@Module({
  imports: [
    FileStorageModule,
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
  controllers: [RegisterExternalController],
  providers: [PrismaService, RegisterExternalService],
})
export class RegisterExternalModule {}
