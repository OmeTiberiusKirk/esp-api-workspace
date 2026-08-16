import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MAILER_PATTERNS } from '@esp/shared';
import { MailerService, type OtpEmailParams } from './mailer.service';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailerService) {}

  @MessagePattern(MAILER_PATTERNS.SEND_OTP_EMAIL)
  async sendOtpEmail(data: OtpEmailParams): Promise<{ success: true }> {
    await this.mailService.sendOtpEmail(data);
    return { success: true };
  }
}
