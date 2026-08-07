import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MASTER_SERVICE_CLIENT } from '../clients/service-clients.constants';
import { MASTER_PATTERNS } from '@esp/shared';
import { send } from '../../assets/utils/sendMessage';

@Injectable()
export class MasterService {
  constructor(
    @Inject(MASTER_SERVICE_CLIENT) private readonly client: ClientProxy,
  ) {}

  async provinces() {
    return send(this.client, MASTER_PATTERNS.PROVINCES, {});
  }

  async getDistricts(provinceCode: string) {
    return send(this.client, MASTER_PATTERNS.DISTRICTS, { provinceCode });
  }

  async getSubDistricts(provinceCode: string, districtCode: string) {
    return send(this.client, MASTER_PATTERNS.SUB_DISTRICTS, {
      provinceCode,
      districtCode,
    });
  }
}
