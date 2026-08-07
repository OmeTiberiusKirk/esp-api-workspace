import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface MasterOption {
  code: string;
  name: string;
}

const ACTIVE = 'N';

@Injectable()
export class MasterService {
  constructor(private readonly prisma: PrismaService) {}

  async getProvinces(): Promise<MasterOption[]> {
    const rows = await this.prisma.tb_ms_province.findMany({
      where: { record_status: ACTIVE },
      orderBy: { province_code: 'asc' },
    });

    return rows
      .filter((r) => r.province_code)
      .map((r) => ({ code: r.province_code!, name: r.province_name_th! }));
  }

  async getDistrictsByProvinceCode(
    provinceCode: string,
  ): Promise<MasterOption[]> {
    const rows = await this.prisma.tb_ms_amphoe.findMany({
      where: { record_status: ACTIVE, province_code: provinceCode },
      orderBy: { amphoe_code: 'asc' },
    });

    return rows
      .filter((r) => r.amphoe_code)
      .map((r) => ({ code: r.amphoe_code!, name: r.amphoe_name_th! }));
  }

  async getSubDistricts(
    provinceCode: string,
    districtCode: string,
  ): Promise<MasterOption[]> {
    const rows = await this.prisma.tb_ms_tambon.findMany({
      where: {
        record_status: ACTIVE,
        province_code: provinceCode,
        amphoe_code: districtCode,
      },
      orderBy: { tambon_code: 'asc' },
    });

    return rows
      .filter((r) => r.tambon_code)
      .map((r) => ({ code: r.tambon_code!, name: r.tambon_name_th! }));
  }
}
