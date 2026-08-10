import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { OTP_PATTERNS } from '@esp/shared';
import { send } from '../../assets/utils/sendMessage';
import { OTP_SERVICE_CLIENT } from '../../assets/constants/service-clients.constants';

@ApiTags('OTP Service')
@Controller('otp')
export class OtpController {
  constructor(
    @Inject(OTP_SERVICE_CLIENT) private readonly client: ClientProxy,
  ) {}

  @ApiOperation({
    summary: 'Get hello otp response',
    description:
      'Forwards the request to the OTP Service (otp-service) via TCP transport and returns the result.',
  })
  @Get()
  async hello() {
    return send(this.client, OTP_PATTERNS.HELLO, {});
  }
}
