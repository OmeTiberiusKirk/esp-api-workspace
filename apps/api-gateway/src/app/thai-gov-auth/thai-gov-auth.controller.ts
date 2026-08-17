import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { THAI_GOV_AUTH_PATTERNS, ThaidLoginDto } from '@esp/shared';
import { send } from '../../utils/sendMessage';
import { REG_SERVICE_CLIENT } from '../../constants/service-clients.constants';

@ApiTags('Thai Gov Auth')
@Controller('thai-gov-auth')
export class ThaiGovAuthController {
  constructor(
    @Inject(REG_SERVICE_CLIENT) private readonly client: ClientProxy,
  ) {}

  @ApiBody({
    type: ThaidLoginDto,
  })
  @Post('/thaid-login')
  async thaidLogin(@Body() body: ThaidLoginDto) {
    return send(this.client, THAI_GOV_AUTH_PATTERNS.THAID_LOGIN, body);
  }
}
