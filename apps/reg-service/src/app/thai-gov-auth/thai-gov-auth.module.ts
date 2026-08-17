import { Module } from '@nestjs/common';
import { ThaiGovAuthController } from './thai-gov-auth.controller';
import { ThaidService } from './thaid.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ThaiGovAuthController],
  providers: [PrismaService, ThaidService],
})
export class ThaiGovAuthModule {}
