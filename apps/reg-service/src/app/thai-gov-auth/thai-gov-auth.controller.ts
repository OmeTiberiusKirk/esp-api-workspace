import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { THAI_GOV_AUTH_PATTERNS, ThaidLoginDto } from '@esp/shared';
import { ThaidService } from './thaid.service';

@Controller()
export class ThaiGovAuthController {
  constructor(private readonly thaidService: ThaidService) {}

  @MessagePattern(THAI_GOV_AUTH_PATTERNS.THAID_LOGIN)
  async thaidLogin(@Payload() data: ThaidLoginDto) {
    return this.thaidService.exchangeCode(data);
  }
}
