import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ChangePasswordDto,
  ME_PATTERNS,
  UpdateAddressDto,
  UpdateProfileDto,
} from '@esp/shared';
import { MeService } from './me.service';
import { ChangePasswordService } from './change-password.service';
import { UpdateProfileService } from './update-profile.service';
import { UpdateAddressService } from './update-address.service';

@Controller()
export class MeController {
  constructor(
    private readonly meService: MeService,
    private readonly changePasswordService: ChangePasswordService,
    private readonly updateProfileService: UpdateProfileService,
    private readonly updateAddressService: UpdateAddressService,
  ) {}

  @MessagePattern(ME_PATTERNS.ME)
  async me(@Payload() data: { authorization?: string }) {
    return this.meService.me(data.authorization);
  }

  @MessagePattern(ME_PATTERNS.CHANGE_PASSWORD)
  async changePassword(@Payload() data: ChangePasswordDto) {
    return this.changePasswordService.changePassword(data);
  }

  @MessagePattern(ME_PATTERNS.UPDATE_PROFILE)
  async updateProfile(@Payload() data: UpdateProfileDto) {
    return this.updateProfileService.updateProfile(data);
  }

  @MessagePattern(ME_PATTERNS.UPDATE_ADDRESS)
  async updateAddress(@Payload() data: UpdateAddressDto) {
    return this.updateAddressService.updateAddress(data);
  }
}
