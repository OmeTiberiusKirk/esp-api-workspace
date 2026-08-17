import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { LoginDto } from '@esp/shared';
import { PrismaService } from '../prisma/prisma.service';
import { MasterClientService } from '../master-client/master-client.service';
import { matchesHash } from '../../utils/hash.util';
import { authenticateAgainstAd } from '../../utils/ldap.util';
import { issueAuthTokens } from '../../utils/token.util';
import {
  EMAIL_VERIFIED,
  METHOD_ID_DBD,
  METHOD_ID_LDAP,
  RECORD_ACTIVE,
  USER_VERIFY_REJECTED,
} from '../../constants/registration.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly masterClient: MasterClientService,
  ) {}

  async login({ username, password }: LoginDto) {
    const user = await this.prisma.tb_user_register.findFirst({
      where: { username },
    });

    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid username or password.',
      });
    }

    if (user.record_status !== RECORD_ACTIVE) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Account is not active.',
      });
    }

    if (user.email_verify_flag !== EMAIL_VERIFIED) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Email address not verified.',
      });
    }

    if (user.user_verify_flag !== EMAIL_VERIFIED) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message:
          user.user_verify_flag === USER_VERIFY_REJECTED
            ? 'User rejected.'
            : 'User not verified.',
      });
    }

    if (user.method_id === METHOD_ID_LDAP) {
      const ldapResult = await authenticateAgainstAd(username, password);
      if (!ldapResult.ok) {
        throw new RpcException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid username or password.',
        });
      }
    } else {
      if (!user.password) {
        throw new RpcException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid username or password.',
        });
      }

      const passwordSecret = process.env.PASSWORD_HMAC_SECRET ?? '';
      if (!passwordSecret) {
        throw new RpcException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Password secret not configured.',
        });
      }

      if (!matchesHash(password, user.password, passwordSecret)) {
        throw new RpcException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid username or password.',
        });
      }
    }

    const now = new Date();
    await this.prisma.tb_user_register.update({
      where: { user_id: user.user_id },
      data: { user_last_login_dtm: now, update_dtm: now },
    });

    /* method_name เป็นแค่ label สวยๆ จาก master-service — ถ้าดึงไม่ได้ก็ใช้ null ไป
       ตัดสินใจ type (legal/staff/user) จาก method_id บน user row เอง ไม่พึ่ง master-service
       เพื่อให้ login สำเร็จได้แม้ master-service ล่ม */
    const methodMap = await this.masterClient.getMethodMap();
    const methodName = methodMap.get(user.method_id ?? -1) ?? null;
    const type =
      user.method_id === METHOD_ID_DBD
        ? 'legal'
        : user.method_id === METHOD_ID_LDAP
          ? 'staff'
          : 'user';

    const loginChannel = 'password';
    const loginChannelLabel = '';

    const tokens = issueAuthTokens({
      user_id: user.user_id,
      person_id: user.person_id,
      given_name: user.first_name_th,
      family_name: user.last_name_th,
      email: user.register_email,
      login_channel: loginChannel,
      login_channel_label: loginChannelLabel,
      type,
      method_id: user.method_id,
      method_name: methodName,
    });

    return {
      type,
      user: {
        user_id: user.user_id,
        person_id: user.person_id,
        given_name: user.first_name_th,
        family_name: user.last_name_th,
        email: user.register_email,
        method_id: user.method_id,
        method_name: methodName,
      },
      ...tokens,
      login_channel: loginChannel,
      login_channel_label: loginChannelLabel,
    };
  }
}
