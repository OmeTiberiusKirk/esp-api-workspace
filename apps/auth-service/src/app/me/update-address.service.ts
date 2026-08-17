import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { UpdateAddressDto } from '@esp/shared';
import { PrismaService } from '../prisma/prisma.service';
import { requireAccessToken } from '../../utils/auth-context.util';
import { parseCode } from '../../utils/parse-code.util';
import {
  METHOD_ID_OPENID,
  METHOD_ID_THAID,
  RECORD_ACTIVE,
} from '../../constants/registration.constants';

@Injectable()
export class UpdateAddressService {
  constructor(private readonly prisma: PrismaService) {}

  async updateAddress({ authorization, ...fields }: UpdateAddressDto) {
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

    /* ที่อยู่ของช่องทาง ThaID/OpenID มาจากผู้ให้บริการตัวตนตอนลงทะเบียน ไม่ใช่ผู้ใช้กรอกเอง
       จึงไม่ให้แก้ไขเองภายหลัง (ต่างจากบัญชีเว็บไซต์ปกติ) */
    if (user.method_id === METHOD_ID_THAID || user.method_id === METHOD_ID_OPENID) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Address is managed by the identity provider.',
      });
    }

    const address = await this.prisma.tb_user_address.findFirst({
      where: { user_id: user.user_id, record_status: RECORD_ACTIVE },
      orderBy: { create_dtm: 'desc' },
    });

    if (!address) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Address not found.',
      });
    }

    const updated = await this.prisma.tb_user_address.update({
      where: { user_address_id: address.user_address_id },
      data: {
        user_home_no: fields.user_home_no,
        user_moo: fields.user_moo,
        user_soi: fields.user_soi,
        user_road: fields.user_road,
        tambon_seq: parseCode(fields.tambol_seq),
        amphoe_seq: parseCode(fields.amphoe_seq),
        province_seq: parseCode(fields.province_seq),
        tambol_name: fields.tambol_name,
        amphoe_name: fields.amphoe_name,
        province_name: fields.province_name,
        update_dtm: new Date(),
        update_by: user.user_id,
      },
    });

    return {
      home_no: updated.user_home_no ?? null,
      moo: updated.user_moo ?? null,
      soi: updated.user_soi ?? updated.user_alley ?? null,
      road: updated.user_road ?? null,
      tambol_name: updated.tambol_name ?? null,
      amphoe_name: updated.amphoe_name ?? null,
      province_name: updated.province_name ?? null,
    };
  }
}
