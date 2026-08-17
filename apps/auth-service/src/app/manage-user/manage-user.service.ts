import { Injectable } from '@nestjs/common';
import { ManageUserListUsersDto } from '@esp/shared';
import { PrismaService } from '../prisma/prisma.service';
import { MasterClientService } from '../master-client/master-client.service';
import { requireAccessToken } from '../../utils/auth-context.util';
import { parseDateRangeFilter } from '../../utils/date-range.util';
import { maskEmail, maskPersonId, maskPhone } from '../../utils/mask.util';
import {
  METHOD_ID_DBD,
  METHOD_ID_LDAP,
  RECORD_ACTIVE,
  RECORD_CANCELLED,
} from '../../constants/registration.constants';

@Injectable()
export class ManageUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly masterClient: MasterClientService,
  ) {}

  async listUsers(dto: ManageUserListUsersDto) {
    requireAccessToken(dto.authorization);

    const page = Math.max(dto.page ?? 1, 1);
    const limit = Math.min(Math.max(dto.limit ?? 20, 1), 100);
    const where = this.buildWhere(dto);

    const [total, users] = await this.prisma.$transaction([
      this.prisma.tb_user_register.count({ where }),
      this.prisma.tb_user_register.findMany({
        where,
        orderBy: [{ user_register_dtm: 'desc' }, { create_dtm: 'desc' }],
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
      method_id: u.method_id ?? null,
      method_name: u.method_id != null ? (methodMap.get(u.method_id) ?? null) : null,
      record_status: u.record_status,
      created_at: (u.user_register_dtm ?? u.create_dtm ?? new Date(0)).toISOString(),
    }));

    return { total, page, limit, items };
  }

  private buildWhere(dto: ManageUserListUsersDto) {
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
      case 'นิติบุคคล':
        and.push({ method_id: METHOD_ID_DBD });
        break;
      case 'เจ้าหน้าที่':
      case 'เจ้าหน้าที่กรมที่ดิน':
        and.push({ method_id: METHOD_ID_LDAP });
        break;
      case 'บุคคลธรรมดา':
        and.push({
          OR: [
            { method_id: { notIn: [METHOD_ID_DBD, METHOD_ID_LDAP] } },
            { method_id: null },
          ],
        });
        break;
      default:
        break; // 'ทั้งหมด' or empty = no filter
    }

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
