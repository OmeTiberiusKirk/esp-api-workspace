import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { requireAccessToken } from '../../utils/auth-context.util';
import { RECORD_ACTIVE } from '../../constants/registration.constants';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async me(authorization: string | undefined) {
    const payload = requireAccessToken(authorization);

    const user = await this.prisma.tb_user_register.findFirst({
      where: { user_id: payload.user_id, record_status: RECORD_ACTIVE },
    });

    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'User not found.',
      });
    }

    const address = await this.prisma.tb_user_address.findFirst({
      where: { user_id: user.user_id, record_status: RECORD_ACTIVE },
      orderBy: { create_dtm: 'desc' },
    });

    return {
      user: {
        user_id: user.user_id,
        person_id: user.person_id,
        title: user.title_name_th ?? null,
        given_name: user.first_name_th ?? null,
        middle_name: user.middle_name_th ?? null,
        family_name: user.last_name_th ?? null,
        email: user.register_email ?? null,
        mobile_no: user.register_mobile_no ?? null,
        address: address
          ? {
              home_no: address.user_home_no ?? null,
              moo: address.user_moo ?? null,
              soi: address.user_soi ?? address.user_alley ?? null,
              road: address.user_road ?? null,
              tambol_name: address.tambol_name ?? null,
              amphoe_name: address.amphoe_name ?? null,
              province_name: address.province_name ?? null,
            }
          : null,
      },
      login_channel: payload.login_channel ?? null,
      login_channel_label: payload.login_channel_label ?? null,
      register_method_id: user.method_id ?? null,
    };
  }
}
