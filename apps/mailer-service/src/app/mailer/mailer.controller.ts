import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MAILER_PATTERNS } from '@esp/shared';
import {
  MailerService,
  type AccountVerifiedEmailParams,
  type OtpEmailParams,
} from './mailer.service';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailerService) {}

  @MessagePattern(MAILER_PATTERNS.SEND_OTP_EMAIL)
  async sendOtpEmail(data: OtpEmailParams): Promise<{ success: true }> {
    await this.mailService.sendOtpEmail(data);
    return { success: true };
  }

  @MessagePattern(MAILER_PATTERNS.SEND_ACCOUNT_VERIFIED_EMAIL)
  async sendAccountVerifiedEmail(
    data: AccountVerifiedEmailParams,
  ): Promise<{ success: true }> {
    await this.mailService.sendAccountVerifiedEmail(data);
    return { success: true };
  }
}
