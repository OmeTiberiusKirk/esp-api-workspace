import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MAIL_PATTERNS } from '@esp/shared';
import { MailerService } from './mailer.service';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailerService) {
    console.log(this.mailService);
  }

  @MessagePattern(MAIL_PATTERNS.HELLO)
  hello() {
    return 'Hello from mailer-service!';
  }
}
