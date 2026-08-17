import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MasterClientModule } from '../master-client/master-client.module';
import { RegisterDataController } from './register-data.controller';
import { RegisterDataService } from './register-data.service';

@Module({
  imports: [MasterClientModule],
  controllers: [RegisterDataController],
  providers: [PrismaService, RegisterDataService],
})
export class RegisterDataModule {}
