import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MasterClientModule } from '../master-client/master-client.module';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';

@Module({
  imports: [MasterClientModule],
  controllers: [LoginController],
  providers: [PrismaService, LoginService],
})
export class LoginModule {}
