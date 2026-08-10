import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { OTP_PATTERNS } from '@esp/shared';
import { OtpService } from './otp.service';

@Controller()
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @MessagePattern(OTP_PATTERNS.HELLO)
  hello() {
    return this.otpService.hello();
  }
}
