import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MasterClientModule } from '../master-client/master-client.module';
import { ManageUserController } from './manage-user.controller';
import { ManageUserService } from './manage-user.service';

@Module({
  imports: [MasterClientModule],
  controllers: [ManageUserController],
  providers: [PrismaService, ManageUserService],
})
export class ManageUserModule {}
