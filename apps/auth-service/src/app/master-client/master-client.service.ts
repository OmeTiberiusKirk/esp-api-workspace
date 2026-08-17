import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { MASTER_PATTERNS } from '@esp/shared';
import { MASTER_SERVICE_CLIENT } from '../../constants/service-clients.constants';

interface MethodOption {
  method_id: number;
  method_name: string;
}

@Injectable()
export class MasterClientService {
  private readonly logger = new Logger(MasterClientService.name);

  constructor(
    @Inject(MASTER_SERVICE_CLIENT) private readonly masterClient: ClientProxy,
  ) {}

  /* master-service ล่ม/ช้า ไม่ควรทำให้ login/report ทั้งหน้าใช้งานไม่ได้ — ยอม fail-open
     คืน Map ว่างแทนการ throw แล้วปล่อยให้ผู้เรียก fallback (เช่น method_name = null) */
  async getMethodMap(): Promise<Map<number, string>> {
    try {
      const methods = await firstValueFrom(
        this.masterClient
          .send<MethodOption[]>(MASTER_PATTERNS.METHODS, {})
          .pipe(timeout(5_000)),
      );

      return new Map(methods.map((m) => [m.method_id, m.method_name]));
    } catch (err) {
      this.logger.warn(`Failed to fetch method map from master-service: ${err}`);
      return new Map();
    }
  }
}
