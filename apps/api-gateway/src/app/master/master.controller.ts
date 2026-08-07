import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MasterService } from './master.service';

@ApiTags('Master')
@Controller('master')
export class MasterController {
  constructor(private readonly masterService: MasterService) {}

  @ApiOperation({
    summary: 'Get provinces response',
    description:
      'Forwards the request to the Master Service (dol-master-service) via TCP transport and returns the result.',
  })
  @Get('/provinces')
  async getProvinces() {
    return this.masterService.provinces();
  }

  @ApiOperation({
    summary: 'Get districts response',
    description:
      'Forwards the request to the Master Service (dol-master-service) via TCP transport and returns the result.',
  })
  @ApiQuery({
    name: 'provinceCode',
    required: true,
    type: 'string',
    default: '10',
  })
  @Get('/districts')
  async getDistrictsByProvinceCode(
    @Query('provinceCode') provinceCode: string,
  ) {
    return this.masterService.getDistricts(provinceCode);
  }

  @ApiOperation({
    summary: 'Get sub-districts response',
    description:
      'Forwards the request to the Master Service (dol-master-service) via TCP transport and returns the result.',
  })
  @ApiQuery({
    name: 'provinceCode',
    required: true,
    type: 'string',
    default: '10',
  })
  @ApiQuery({
    name: 'districtCode',
    required: true,
    type: 'string',
    default: '01',
  })
  @Get('/sub-districts')
  async getSubDistricts(
    @Query('provinceCode') provinceCode: string,
    @Query('districtCode') districtCode: string,
  ) {
    return this.masterService.getSubDistricts(provinceCode, districtCode);
  }
}
