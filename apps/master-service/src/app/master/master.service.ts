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
    try {
      const rows = await this.prisma.tb_ms_province.findMany({
        where: { record_status: ACTIVE },
        orderBy: { province_code: 'asc' },
      });

      return rows
        .filter((r) => r.province_code)
        .map((r) => ({ code: r.province_code!, name: r.province_name_th! }));
    } catch (error) {
      console.log(error);
      return [];
    }
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

  async getUserTitles(): Promise<MasterOption[]> {
    const rows = await this.prisma.tb_ms_title.findMany({
      where: { record_status: ACTIVE },
      orderBy: { title_seq: 'asc' },
    });

    return rows
      .filter((r) => r.title_name)
      .map((r) => ({ code: r.title_id.toString(), name: r.title_name! }));
  }

  /* method_id เป็น BigInt (bigserial) — แปลงเป็น number ก่อนส่งออก เพราะ TCP transport
     serialize เป็น JSON ตรงๆ ไม่รองรับ BigInt (ค่าจริงมีไม่กี่รายการ ไม่มีทางเกิน Number.MAX_SAFE_INTEGER) */
  async getMethods(): Promise<Array<{ method_id: number; method_name: string }>> {
    const rows = await this.prisma.tb_ms_method.findMany({
      where: { record_status: ACTIVE },
      orderBy: { method_order: 'asc' },
    });

    return rows
      .filter((r) => r.method_name)
      .map((r) => ({ method_id: Number(r.method_id), method_name: r.method_name! }));
  }
}
