import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ThirdPartyLoginService } from './third-party-login.service';

@Module({
  providers: [PrismaService, ThirdPartyLoginService],
  exports: [ThirdPartyLoginService],
})
export class ThirdPartyLoginModule {}
