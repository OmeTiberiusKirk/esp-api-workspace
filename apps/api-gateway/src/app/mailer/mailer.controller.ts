import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { MAIL_PATTERNS } from '@esp/shared';
import { send } from '../../utils/sendMessage';
import { MAILER_SERVICE_CLIENT } from '../../constants/service-clients.constants';

@ApiTags('Mail Service')
@Controller('mail')
export class MailController {
  constructor(
    @Inject(MAILER_SERVICE_CLIENT) private readonly client: ClientProxy,
  ) {}

  @Get()
  async hello() {
    return send(this.client, MAIL_PATTERNS.HELLO, {});
  }
}
