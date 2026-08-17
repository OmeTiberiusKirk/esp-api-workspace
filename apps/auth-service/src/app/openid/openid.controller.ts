import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OpenidLoginDto, THAI_GOV_AUTH_PATTERNS } from '@esp/shared';
import { OpenidService } from './openid.service';

@Controller()
export class OpenidController {
  constructor(private readonly openidService: OpenidService) {}

  @MessagePattern(THAI_GOV_AUTH_PATTERNS.OPENID_LOGIN)
  async openidLogin(@Payload() data: OpenidLoginDto) {
    return this.openidService.exchangeCode(data);
  }
}
