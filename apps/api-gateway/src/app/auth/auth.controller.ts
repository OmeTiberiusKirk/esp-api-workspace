import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_PATTERNS } from '@esp/shared';
import { send } from '../../assets/utils/sendMessage';
import { AUTH_SERVICE_CLIENT } from '../../assets/constants/service-clients.constants';

@ApiTags('Auth-Service')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE_CLIENT) private readonly client: ClientProxy,
  ) {}

  @ApiOperation({
    summary: 'Get hello response',
    description:
      'Forwards the request to the Auth Service (auth-service) via TCP transport and returns the result.',
  })
  @Get('/hello')
  async hello() {
    return send(this.client, AUTH_PATTERNS.HELLO, {});
  }
}
