import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  AUTH_PATTERNS,
  DbdidLoginDto,
  LoginDto,
  OpenidLoginDto,
  ThaidLoginDto,
} from '@esp/shared';
import { AuthService } from './auth.service';
import { ThaidService } from './thaid.service';
import { OpenidService } from './openid.service';
import { DbdidService } from './dbdid.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly thaidService: ThaidService,
    private readonly openidService: OpenidService,
    private readonly dbdidService: DbdidService,
  ) {}

  @MessagePattern(AUTH_PATTERNS.AUTH)
  async login(@Payload() data: LoginDto) {
    return this.authService.login(data);
  }

  @MessagePattern(AUTH_PATTERNS.AUTH_THAID)
  async thaidLogin(@Payload() data: ThaidLoginDto) {
    return this.thaidService.exchangeCode(data);
  }

  @MessagePattern(AUTH_PATTERNS.AUTH_OPENID)
  async openidLogin(@Payload() data: OpenidLoginDto) {
    return this.openidService.exchangeCode(data);
  }

  @MessagePattern(AUTH_PATTERNS.AUTH_DBDID)
  async dbdidLogin(@Payload() data: DbdidLoginDto) {
    return this.dbdidService.exchangeCode(data);
  }
}
