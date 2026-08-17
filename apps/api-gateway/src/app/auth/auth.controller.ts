import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { LOGIN_PATTERNS, LoginDto } from '@esp/shared';
import { send } from '../../utils/sendMessage';
import { AUTH_SERVICE_CLIENT } from '../../constants/service-clients.constants';

@ApiTags('Login')
@Controller('login')
export class LoginController {
  constructor(
    @Inject(AUTH_SERVICE_CLIENT) private readonly client: ClientProxy,
  ) {}

  @ApiBody({ type: LoginDto })
  @Post()
  async login(@Body() body: LoginDto) {
    return send(this.client, LOGIN_PATTERNS.LOGIN, body);
  }
}
