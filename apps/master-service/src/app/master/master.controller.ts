import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MasterService } from './master.service';
import { MASTER_PATTERNS } from '@esp/shared';

@Controller()
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  @MessagePattern(MASTER_PATTERNS.PROVINCES)
  async getProvinces() {
    return this.masterService.getProvinces();
  }

  @MessagePattern(MASTER_PATTERNS.DISTRICTS)
  async getDistricts(@Payload() data: { province_code: string }) {
    return this.masterService.getDistricts(data.province_code);
  }

  @MessagePattern(MASTER_PATTERNS.SUB_DISTRICTS)
  async getSubDistricts(
    @Payload() data: { province_code: string; amphoe_code: string },
  ) {
    return this.masterService.getSubDistricts(
      data.province_code,
      data.amphoe_code,
    );
  }

  @MessagePattern(MASTER_PATTERNS.TITLES)
  async getUserTitles() {
    return this.masterService.getUserTitles();
  }

  @MessagePattern(MASTER_PATTERNS.METHODS)
  async getMethods() {
    return this.masterService.getMethods();
  }
}
