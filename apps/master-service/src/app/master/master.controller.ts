import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MasterService } from './master.service';

@Controller()
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  @MessagePattern('PROVINCES')
  async getProvinces() {
    return this.masterService.getProvinces();
  }

  @MessagePattern('DISTRICTS')
  async getDistricts(@Payload() data: { provinceCode: string }) {
    return this.masterService.getDistrictsByProvinceCode(data.provinceCode);
  }

  @MessagePattern('SUB_DISTRICTS')
  async getSubDistricts(
    @Payload() data: { provinceCode: string; districtCode: string },
  ) {
    return this.masterService.getSubDistricts(
      data.provinceCode,
      data.districtCode,
    );
  }
}
