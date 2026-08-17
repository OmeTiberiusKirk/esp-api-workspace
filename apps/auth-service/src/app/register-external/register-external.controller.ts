import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateExternalOrgUserDto,
  REGISTER_EXTERNAL_PATTERNS,
  VerifyUserDto,
} from '@esp/shared';
import { RegisterExternalService } from './register-external.service';

@Controller()
export class RegisterExternalController {
  constructor(private readonly registerExternalService: RegisterExternalService) {}

  @MessagePattern(REGISTER_EXTERNAL_PATTERNS.CREATE)
  async create(@Payload() data: CreateExternalOrgUserDto) {
    return this.registerExternalService.createExternalOrgUser(data);
  }

  @MessagePattern(REGISTER_EXTERNAL_PATTERNS.LIST)
  async list() {
    return this.registerExternalService.listPendingExternalOrgUsers();
  }

  @MessagePattern(REGISTER_EXTERNAL_PATTERNS.VERIFY)
  async verify(@Payload() data: VerifyUserDto) {
    return this.registerExternalService.verifyExternalOrgUser(data);
  }
}
