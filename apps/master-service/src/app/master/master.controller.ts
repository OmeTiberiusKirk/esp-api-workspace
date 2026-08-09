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
  async getDistricts(@Payload() data: { provinceCode: string }) {
    return this.masterService.getDistrictsByProvinceCode(data.provinceCode);
  }

  @MessagePattern(MASTER_PATTERNS.SUB_DISTRICTS)
  async getSubDistricts(
    @Payload() data: { provinceCode: string; districtCode: string },
  ) {
    return this.masterService.getSubDistricts(
      data.provinceCode,
      data.districtCode,
    );
  }
}
