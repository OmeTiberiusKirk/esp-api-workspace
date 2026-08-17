import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  AUTH_PATTERNS,
  CreateUserDto,
  VerifyOtpDto,
  VerifyUserDto,
} from '@esp/shared';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.REG001)
  async register(@Payload() data: CreateUserDto) {
    return await this.authService.createUser(data);
  }

  @MessagePattern(AUTH_PATTERNS.REG001_VERIFY_OTP)
  async verifyOtp(@Payload() data: VerifyOtpDto) {
    return await this.authService.verifyOtp(data);
  }

  @MessagePattern(AUTH_PATTERNS.REG002_SEND_OTP)
  async resendOtp(@Payload() data: { email: string }) {
    return await this.authService.resendOtp(data);
  }

  @MessagePattern(AUTH_PATTERNS.REG014_LIST)
  async listPendingWebsiteUsers() {
    return await this.authService.listPendingWebsiteUsersForVerification();
  }

  @MessagePattern(AUTH_PATTERNS.REG014_VERIFY)
  async verifyWebsiteUser(@Payload() data: VerifyUserDto) {
    return await this.authService.verifyWebsiteUser(data);
  }
}
