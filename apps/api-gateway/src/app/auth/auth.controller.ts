import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import {
  AUTH_PATTERNS,
  DbdidLoginDto,
  LoginDto,
  OpenidLoginDto,
  ThaidLoginDto,
} from '@esp/shared';
import { send } from '../../utils/sendMessage';
import { AUTH_SERVICE_CLIENT } from '../../constants/service-clients.constants';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE_CLIENT) private readonly client: ClientProxy,
  ) {}

  @ApiBody({ type: LoginDto })
  @Post()
  async login(@Body() body: LoginDto) {
    return send(this.client, AUTH_PATTERNS.AUTH, body);
  }

  @ApiBody({ type: ThaidLoginDto })
  @Post('/thaid')
  async thaidLogin(@Body() body: ThaidLoginDto) {
    return send(this.client, AUTH_PATTERNS.AUTH_THAID, body);
  }

  @ApiBody({ type: OpenidLoginDto })
  @Post('/openid')
  async openidLogin(@Body() body: OpenidLoginDto) {
    return send(this.client, AUTH_PATTERNS.AUTH_OPENID, body);
  }

  @ApiBody({ type: DbdidLoginDto })
  @Post('/dbdid')
  async dbdidLogin(@Body() body: DbdidLoginDto) {
    return send(this.client, AUTH_PATTERNS.AUTH_DBDID, body);
  }
}
