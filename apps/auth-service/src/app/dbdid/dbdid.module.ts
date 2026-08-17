import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DbdidController } from './dbdid.controller';
import { DbdidService } from './dbdid.service';

@Module({
  controllers: [DbdidController],
  providers: [PrismaService, DbdidService],
})
export class DbdidModule {}
