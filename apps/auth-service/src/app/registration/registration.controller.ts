import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  REGISTRATION_PATTERNS,
  CreateUserDto,
  VerifyOtpDto,
  VerifyUserDto,
} from '@esp/shared';
import { RegistrationService } from './registration.service';

@Controller()
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @MessagePattern(REGISTRATION_PATTERNS.REGISTRATION)
  async register(@Payload() data: CreateUserDto) {
    return await this.registrationService.createUser(data);
  }

  @MessagePattern(REGISTRATION_PATTERNS.REGISTRATION_VERIFY_OTP)
  async verifyOtp(@Payload() data: VerifyOtpDto) {
    return await this.registrationService.verifyOtp(data);
  }

  @MessagePattern(REGISTRATION_PATTERNS.REGISTRATION_RESEND_OTP)
  async resendOtp(@Payload() data: { email: string }) {
    return await this.registrationService.resendOtp(data);
  }

  @MessagePattern(REGISTRATION_PATTERNS.REGISTRATION_PENDING_LIST)
  async listPendingWebsiteUsers() {
    return await this.registrationService.listPendingWebsiteUsersForVerification();
  }

  @MessagePattern(REGISTRATION_PATTERNS.REGISTRATION_PENDING_VERIFY)
  async verifyWebsiteUser(@Payload() data: VerifyUserDto) {
    return await this.registrationService.verifyWebsiteUser(data);
  }
}
