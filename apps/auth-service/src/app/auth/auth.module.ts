import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MasterClientModule } from '../master-client/master-client.module';
import { ThirdPartyLoginModule } from '../third-party-login/third-party-login.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ThaidService } from './thaid.service';
import { OpenidService } from './openid.service';
import { DbdidService } from './dbdid.service';

@Module({
  imports: [MasterClientModule, ThirdPartyLoginModule],
  controllers: [AuthController],
  providers: [PrismaService, AuthService, ThaidService, OpenidService, DbdidService],
})
export class AuthModule {}
