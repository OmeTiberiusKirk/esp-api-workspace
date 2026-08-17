import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ChangePasswordDto } from '@esp/shared';
import { PrismaService } from '../prisma/prisma.service';
import { requireAccessToken } from '../../utils/auth-context.util';
import { hashWithSecret, matchesHash } from '../../utils/hash.util';
import { meetsPasswordRules } from '../../utils/password.util';
import {
  EMAIL_VERIFIED,
  METHOD_ID_WEBSITE,
  RECORD_ACTIVE,
} from '../../constants/registration.constants';

@Injectable()
export class ChangePasswordService {
  constructor(private readonly prisma: PrismaService) {}

  async changePassword({
    authorization,
    current_password,
    new_password,
  }: ChangePasswordDto) {
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

    /* เฉพาะบัญชีที่สมัครผ่านเว็บ (ตั้งรหัสผ่านเอง) เท่านั้นที่เปลี่ยนรหัสผ่านได้ — LDAP/ThaID/OpenID/DBD ID
       ไม่มีรหัสผ่านให้เปลี่ยนในระบบนี้ (auth อยู่ที่ผู้ให้บริการภายนอกทั้งหมด) */
    if (user.method_id !== METHOD_ID_WEBSITE) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Password change not allowed.',
      });
    }

    if (user.email_verify_flag !== EMAIL_VERIFIED || user.user_verify_flag !== EMAIL_VERIFIED) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Account is not verified.',
      });
    }

    const passwordSecret = process.env.PASSWORD_HMAC_SECRET ?? '';
    if (!passwordSecret) {
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Password secret not configured.',
      });
    }

    if (new_password === current_password) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'New password must be different from the current password.',
      });
    }

    if (!meetsPasswordRules(new_password)) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Password does not meet the required rules.',
      });
    }

    if (!user.password || !matchesHash(current_password, user.password, passwordSecret)) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Current password is incorrect.',
      });
    }

    const now = new Date();
    await this.prisma.tb_user_register.update({
      where: { user_id: user.user_id },
      data: {
        password: hashWithSecret(new_password, passwordSecret),
        password_changed_dtm: now,
        update_dtm: now,
      },
    });

    return { message: 'Password changed.' };
  }
}
