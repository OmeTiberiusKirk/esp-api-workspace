import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegService } from './reg.service';
import { RegController } from './reg.controller';
import { OtpService } from './otp.service';

@Module({
  controllers: [RegController],
  providers: [PrismaService, RegService, OtpService],
})
export class RegModule {}
