import { Module } from '@nestjs/common';
import { MailerModule } from '../mailer/mailer.module';
import { PrismaService } from '../prisma/prisma.service';
import { RegService } from './reg.service';
import { RegController } from './reg.controller';

@Module({
  imports: [MailerModule],
  controllers: [RegController],
  providers: [RegService, PrismaService],
})
export class RegModule {}
