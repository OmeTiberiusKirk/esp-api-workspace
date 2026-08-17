import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LOGIN_PATTERNS, LoginDto } from '@esp/shared';
import { LoginService } from './login.service';

@Controller()
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @MessagePattern(LOGIN_PATTERNS.LOGIN)
  async login(@Payload() data: LoginDto) {
    return this.loginService.login(data);
  }
}
