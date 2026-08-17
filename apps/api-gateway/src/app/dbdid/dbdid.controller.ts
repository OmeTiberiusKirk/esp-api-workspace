import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { DBDID_PATTERNS, DbdidLoginDto } from '@esp/shared';
import { send } from '../../utils/sendMessage';
import { AUTH_SERVICE_CLIENT } from '../../constants/service-clients.constants';

@ApiTags('DBD ID')
@Controller('dbdid')
export class DbdidController {
  constructor(
    @Inject(AUTH_SERVICE_CLIENT) private readonly client: ClientProxy,
  ) {}

  @ApiBody({ type: DbdidLoginDto })
  @Post('/login')
  async login(@Body() body: DbdidLoginDto) {
    return send(this.client, DBDID_PATTERNS.DBDID_LOGIN, body);
  }
}
