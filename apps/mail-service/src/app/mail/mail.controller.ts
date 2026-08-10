import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MAIL_PATTERNS } from '@esp/shared';
import { MailService } from './mail.service';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @MessagePattern(MAIL_PATTERNS.HELLO)
  hello() {
    return this.mailService.hello();
  }
}
