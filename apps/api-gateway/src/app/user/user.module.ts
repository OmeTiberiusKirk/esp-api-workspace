import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserController } from './user.controller';
import { MASTER_SERVICE_CLIENT } from './master-service.client';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: MASTER_SERVICE_CLIENT,
        transport: Transport.TCP,
        options: {
          host: process.env.MASTER_SERVICE_HOST || 'localhost',
          port: Number(process.env.MASTER_SERVICE_PORT) || 3001,
        },
      },
    ]),
  ],
  controllers: [UserController],
})
export class UserModule {}
