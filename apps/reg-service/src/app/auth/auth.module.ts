import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailerModule } from '../mailer/mailer.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [MailerModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
