import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ManageUserListUsersDto, MANAGE_USER_PATTERNS } from '@esp/shared';
import { ManageUserService } from './manage-user.service';

@Controller()
export class ManageUserController {
  constructor(private readonly manageUserService: ManageUserService) {}

  @MessagePattern(MANAGE_USER_PATTERNS.LIST_USERS)
  async listUsers(@Payload() data: ManageUserListUsersDto) {
    return this.manageUserService.listUsers(data);
  }
}
