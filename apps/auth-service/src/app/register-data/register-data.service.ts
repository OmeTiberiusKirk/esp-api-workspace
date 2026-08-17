import { Injectable } from '@nestjs/common';
import { RegisterDataQueryDto } from '@esp/shared';
import { PrismaService } from '../prisma/prisma.service';
import { MasterClientService } from '../master-client/master-client.service';
import { requireAccessToken } from '../../utils/auth-context.util';
import { parseDateRangeFilter } from '../../utils/date-range.util';
import { maskEmail, maskPersonId, maskPhone } from '../../utils/mask.util';
import { RECORD_ACTIVE, RECORD_CANCELLED } from '../../constants/registration.constants';

const USER_TYPE_LABELS = [
  'บุคคลธรรมดา',
  'นิติบุคคล',
  'หน่วยงานภายนอก',
  'เจ้าหน้าที่กรมที่ดิน',
] as const;

/* FIXME: จัดกลุ่มจาก method_id (วิธีสมัคร) ซึ่งไม่ใช่ user_type_id (ประเภทผู้ใช้) จริงๆ —
   หน่วยงานภายนอกที่สมัครผ่านเว็บจะถูกนับปนกับบุคคลธรรมดาทั่วไป เพราะ method_id ชนกัน (ทั้งคู่ = METHOD_ID_WEBSITE)
   คงพฤติกรรมเดิมไว้ก่อนตามต้นทาง รอ REG015 rework ให้ยึด user_type_id แทน */
const getUserTypeFromMethodId = (methodId: number | null): (typeof USER_TYPE_LABELS)[number] | null => {
  switch (methodId) {
    case 1:
    case 3:
      return 'บุคคลธรรมดา';
    case 4:
      return 'นิติบุคคล';
    case 2:
      return 'หน่วยงานภายนอก';
    case 5:
      return 'เจ้าหน้าที่กรมที่ดิน';
    default:
      return null;
  }
};

const getChannelLabel = (channelId: number | null): string | null => {
  if (channelId == null) return null;
  if (channelId === 1) return 'เว็บไซต์';
  if (channelId === 2) return 'Kiosk';
  return `ช่องทาง ${channelId}`;
};

@Injectable()
export class RegisterDataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly masterClient: MasterClientService,
  ) {}

  async stats(dto: RegisterDataQueryDto) {
    requireAccessToken(dto.authorization);

    const where = this.buildWhere(dto);
    const users = await this.prisma.tb_user_register.findMany({
      where,
      select: { method_id: true, channel_id: true, user_id: true },
    });

    const methodMap = await this.masterClient.getMethodMap();

    const byUserType = new Map<string, number>(USER_TYPE_LABELS.map((l) => [l, 0]));
    const byChannel = new Map<string, number>();
    const byMethod = new Map<string, number>();

    for (const u of users) {
      const userType = getUserTypeFromMethodId(u.method_id);
      if (userType) byUserType.set(userType, (byUserType.get(userType) ?? 0) + 1);

      const channelLabel = getChannelLabel(u.channel_id) ?? 'ไม่ระบุ';
      byChannel.set(channelLabel, (byChannel.get(channelLabel) ?? 0) + 1);

      const methodLabel = u.method_id != null ? (methodMap.get(u.method_id) ?? 'ไม่ระบุ') : 'ไม่ระบุ';
      byMethod.set(methodLabel, (byMethod.get(methodLabel) ?? 0) + 1);
    }

    return {
      total: users.length,
      by_user_type: Array.from(byUserType, ([label, count]) => ({ label, count })),
      by_channel: Array.from(byChannel, ([label, count]) => ({ label, count })),
      by_method: Array.from(byMethod, ([label, count]) => ({ label, count })),
    };
  }

  async listUsers(dto: RegisterDataQueryDto) {
    requireAccessToken(dto.authorization);

    const page = Math.max(dto.page ?? 1, 1);
    const limit = Math.min(Math.max(dto.limit ?? 20, 1), 100);
    const where = this.buildWhere(dto);

    const [total, users] = await this.prisma.$transaction([
      this.prisma.tb_user_register.count({ where }),
      this.prisma.tb_user_register.findMany({
        where,
        orderBy: { user_register_dtm: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const methodMap = await this.masterClient.getMethodMap();

    const items = users.map((u) => ({
      user_id: u.user_id,
      title: u.title_name_th ?? null,
      given_name: u.first_name_th ?? null,
      family_name: u.last_name_th ?? null,
      person_id: maskPersonId(u.person_id),
      email: maskEmail(u.register_email),
      mobile_no: maskPhone(u.register_mobile_no),
      channel_label: getChannelLabel(u.channel_id),
      method_name: u.method_id != null ? (methodMap.get(u.method_id) ?? null) : null,
      user_type: getUserTypeFromMethodId(u.method_id),
      created_at: (u.user_register_dtm ?? u.create_dtm ?? new Date(0)).toISOString(),
    }));

    return { total, page, limit, items };
  }

  private buildWhere(dto: RegisterDataQueryDto) {
    const and: Array<Record<string, unknown>> = [
      { record_status: { in: [RECORD_ACTIVE, RECORD_CANCELLED] } },
    ];

    const dateRange = parseDateRangeFilter(dto.start_date, dto.end_date);
    if (dateRange) {
      and.push({
        OR: [
          { user_register_dtm: dateRange },
          { AND: [{ user_register_dtm: null }, { create_dtm: dateRange }] },
        ],
      });
    }

    switch (dto.user_type) {
      case 'บุคคลธรรมดา':
        and.push({ method_id: { in: [1, 3] } });
        break;
      case 'นิติบุคคล':
        and.push({ method_id: 4 });
        break;
      case 'หน่วยงานภายนอก':
        and.push({ method_id: 2 });
        break;
      case 'เจ้าหน้าที่กรมที่ดิน':
        and.push({ method_id: 5 });
        break;
      default:
        break;
    }

    if (dto.method_id != null) and.push({ method_id: dto.method_id });
    if (dto.channel_id != null) and.push({ channel_id: dto.channel_id });

    if (dto.first_name) {
      and.push({
        OR: [
          { first_name_th: { contains: dto.first_name } },
          { middle_name_th: { contains: dto.first_name } },
        ],
      });
    }

    if (dto.last_name) {
      and.push({ last_name_th: { contains: dto.last_name } });
    }

    return { AND: and };
  }
}
