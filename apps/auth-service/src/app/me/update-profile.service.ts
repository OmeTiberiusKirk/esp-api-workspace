import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { UpdateProfileDto } from '@esp/shared';
import { PrismaService } from '../prisma/prisma.service';
import { requireAccessToken } from '../../utils/auth-context.util';
import {
  EMAIL_VERIFIED,
  RECORD_ACTIVE,
} from '../../constants/registration.constants';

const THAI_MOBILE_NO = /^0\d{9}$/;

@Injectable()
export class UpdateProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile({ authorization, mobile_no }: UpdateProfileDto) {
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

    /* login ผ่าน 3rd-party (ThaID/OpenID/DBD ID) ข้าม verify flag check ตอน login ไปเลย
       ต้องเช็คซ้ำที่นี่แทน ไม่งั้นบัญชีที่ยังไม่ผ่านการยืนยันจะแก้ข้อมูลได้ */
    if (user.user_verify_flag !== EMAIL_VERIFIED) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'User is not verified.',
      });
    }

    if (!THAI_MOBILE_NO.test(mobile_no)) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid mobile number.',
      });
    }

    await this.prisma.tb_user_register.update({
      where: { user_id: user.user_id },
      data: {
        register_mobile_no: mobile_no,
        update_dtm: new Date(),
        update_by: user.user_id,
      },
    });

    return { message: 'Profile updated.', mobile_no };
  }
}
