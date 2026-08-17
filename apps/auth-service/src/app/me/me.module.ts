import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { ChangePasswordService } from './change-password.service';
import { UpdateProfileService } from './update-profile.service';
import { UpdateAddressService } from './update-address.service';

@Module({
  controllers: [MeController],
  providers: [
    PrismaService,
    MeService,
    ChangePasswordService,
    UpdateProfileService,
    UpdateAddressService,
  ],
})
export class MeModule {}
