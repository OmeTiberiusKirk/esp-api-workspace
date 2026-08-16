import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { REG_PATTERNS, CreateUserDto, VerifyOtpDto } from '@esp/shared';
import { RegService } from './reg.service';

@Controller()
export class RegController {
  constructor(private readonly regService: RegService) {}

  @MessagePattern(REG_PATTERNS.REG001)
  async register(@Payload() data: CreateUserDto) {
    return await this.regService.createUser(data);
  }

  @MessagePattern(REG_PATTERNS.REG001_VERIFY_OTP)
  async verifyOtp(@Payload() data: VerifyOtpDto) {
    return await this.regService.verifyOtp(data);
  }
}
