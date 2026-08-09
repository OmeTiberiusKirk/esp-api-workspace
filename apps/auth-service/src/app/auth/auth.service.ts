import { CreateUserDto } from '@esp/shared';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailer: MailerService,
  ) {}

  async register(data: CreateUserDto): Promise<string> {
    console.log(this.mailer);
    // const existingByPersonId = await this.prisma.tb_register_user.findFirst({
    //   where: { person_id: personal.person_id, record_status: RECORD_ACTIVE },
    // });
    return 'hello auth';
  }
}
