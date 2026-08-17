import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateExternalOrgUserDto,
  REGISTER_EXTERNAL_PATTERNS,
  VerifyUserDto,
} from '@esp/shared';
import { send } from '../../utils/sendMessage';
import { AUTH_SERVICE_CLIENT } from '../../constants/service-clients.constants';

@ApiTags('Register External')
@Controller('register-external')
export class RegisterExternalController {
  constructor(
    @Inject(AUTH_SERVICE_CLIENT) private readonly client: ClientProxy,
  ) {}

  @ApiBody({ type: CreateExternalOrgUserDto })
  @Post()
  async create(@Body() body: CreateExternalOrgUserDto) {
    return send(this.client, REGISTER_EXTERNAL_PATTERNS.CREATE, body);
  }

  @Get('/pending')
  async listPending() {
    return send(this.client, REGISTER_EXTERNAL_PATTERNS.LIST, {});
  }

  @ApiBody({ type: VerifyUserDto })
  @Post('/verify')
  async verify(@Body() body: VerifyUserDto) {
    return send(this.client, REGISTER_EXTERNAL_PATTERNS.VERIFY, body);
  }
}
