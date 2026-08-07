import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MASTER_PATTERNS } from '@esp/shared';
import { send } from '../../assets/utils/sendMessage';
import { MASTER_SERVICE_CLIENT } from '../clients/service-clients.constants';
import { ClientProxy } from '@nestjs/microservices';

@ApiTags('Master')
@Controller('master')
export class MasterController {
  constructor(
    @Inject(MASTER_SERVICE_CLIENT) private readonly client: ClientProxy,
  ) {}

  @ApiOperation({
    summary: 'Get provinces response',
    description:
      'Forwards the request to the Master Service (master-service) via TCP transport and returns the result.',
  })
  @Get('/provinces')
  async provinces() {
    return send(this.client, MASTER_PATTERNS.PROVINCES, {});
  }

  @ApiOperation({
    summary: 'Get districts response',
    description:
      'Forwards the request to the Master Service (master-service) via TCP transport and returns the result.',
  })
  @ApiQuery({
    name: 'provinceCode',
    required: true,
    type: 'string',
    default: '10',
  })
  @Get('/districts')
  async districts(@Query('provinceCode') provinceCode: string) {
    return send(this.client, MASTER_PATTERNS.DISTRICTS, { provinceCode });
  }

  @ApiOperation({
    summary: 'Get sub-districts response',
    description:
      'Forwards the request to the Master Service (master-service) via TCP transport and returns the result.',
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
    default: '34',
  })
  @Get('/sub-districts')
  async subDistricts(
    @Query('provinceCode') provinceCode: string,
    @Query('districtCode') districtCode: string,
  ) {
    return send(this.client, MASTER_PATTERNS.SUB_DISTRICTS, {
      provinceCode,
      districtCode,
    });
  }
}
