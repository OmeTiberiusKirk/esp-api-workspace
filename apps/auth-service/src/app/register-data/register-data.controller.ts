import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { REGISTER_DATA_PATTERNS, RegisterDataQueryDto } from '@esp/shared';
import { RegisterDataService } from './register-data.service';

@Controller()
export class RegisterDataController {
  constructor(private readonly registerDataService: RegisterDataService) {}

  @MessagePattern(REGISTER_DATA_PATTERNS.STATS)
  async stats(@Payload() data: RegisterDataQueryDto) {
    return this.registerDataService.stats(data);
  }

  @MessagePattern(REGISTER_DATA_PATTERNS.LIST_USERS)
  async listUsers(@Payload() data: RegisterDataQueryDto) {
    return this.registerDataService.listUsers(data);
  }
}
