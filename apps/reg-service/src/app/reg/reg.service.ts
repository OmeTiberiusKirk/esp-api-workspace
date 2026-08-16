import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { maskEmail, maskPersonId, maskPhone } from '../../utils/mask.util';
import { VerifyUserDto } from '../../dtos/verify-user.dto';
import { hashWithSecret } from '../../utils/hash.util';
import { PrismaService } from '../prisma/prisma.service';
import { generateTemporaryPassword } from '../../utils/password.util';
import { CreateTbUserRegisterDto } from '../../generated/nestjs-dto/create-tbUserRegister.dto';
import { CreateTbUserAddressDto } from '../../generated/nestjs-dto/create-tbUserAddress.dto';
import { ConnectTbUserRegisterDto } from '../../generated/nestjs-dto/connect-tbUserRegister.dto';
import { parseCode } from '../../utils/parse-code.util';
import { CreateUserDto } from '@esp/shared';
import { OtpService } from './otp.service';
import {
  CHANNEL_ID_WEBSITE,
  METHOD_ID_THAID,
  METHOD_ID_WEBSITE,
  NOT_VERIFIED,
  RECORD_ACTIVE,
  RECORD_CANCELLED,
  USER_VERIFY_REJECTED,
} from '../../constants/registration.constants';
import { EMAIL_VERIFIED } from '../../constants/otp.constants';

@Injectable()
export class RegService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
  ) {}

  async createUser({ personal, address, is_thaid_verified }: CreateUserDto) {
    /* เช็ค person_id กับ email ซ้ำรวมเป็น query เดียว เจอซ้ำฝั่งไหนก็ตอบ error เดียวกันหมด
       ไม่แยก verified/unverified แล้ว ให้เจ้าหน้าที่จัดการเองแทนการ auto-resume */
    await this.checkUserExists(personal);

    const userId = randomUUID();
    const [user] = await this.prisma.$transaction([
      this.prisma.tb_user_register.create({
        data: this.mapToUserCreateInput(
          userId,
          Boolean(is_thaid_verified),
          personal,
        ),
      }),
      this.prisma.tb_user_address.create({
        data: this.mapToUserAddressCreateInput(userId, address),
      }),
    ]);

    await this.otpService.sendOtp(user);

    return {
      user_id: user.user_id,
      person_id: user.person_id,
      email: user.register_email,
    };
  }

  async checkUserExists(personal: CreateUserDto['personal']): Promise<void> {
    const existingUser = await this.prisma.tb_user_register.findFirst({
      where: {
        record_status: RECORD_ACTIVE,
        OR: [
          { person_id: personal.person_id },
          { register_email: personal.email },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.user_verify_flag !== EMAIL_VERIFIED) {
        throw new RpcException({
          statusCode: HttpStatus.CONFLICT,
          message: 'EMAIL_NOT_VERIFIED',
        });
      }
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: 'DUPLICATE_USER_INFO_CONTACT_STAFF',
      });
    }
  }

  private mapToUserCreateInput(
    userId: string,
    is_thaid_verified: boolean,
    personal: CreateUserDto['personal'],
  ): CreateTbUserRegisterDto {
    const now = new Date();
    /* ผ่าน ThaID มาแล้ว = รัฐยืนยันตัวตนจริงให้เรียบร้อย ไม่ต้องรอไปยืนยันตัวตนที่สำนักงานที่ดินซ้ำอีกรอบ
       ต่างจากสมัครผ่านเว็บปกติที่ user_verify_flag ต้องรอเจ้าหน้าที่อนุมัติ (ยังคง 0 ไปก่อน) */
    const userVerifyFlag = is_thaid_verified ? EMAIL_VERIFIED : NOT_VERIFIED;
    const methodId = is_thaid_verified ? METHOD_ID_THAID : METHOD_ID_WEBSITE;

    return {
      user_id: userId,
      method_id: methodId,
      channel_id: CHANNEL_ID_WEBSITE,
      person_id: personal.person_id,
      title_name_th: personal.title,
      first_name_th: personal.given_name,
      middle_name_th: personal.middle_name,
      last_name_th: personal.family_name,
      birth_date: personal.birth_date
        ? new Date(personal.birth_date)
        : undefined,
      date_of_expiry: personal.date_of_expiry
        ? new Date(personal.date_of_expiry)
        : undefined,
      register_email: personal.email,
      register_mobile_no: personal.mobile_no,
      email_verify_flag: NOT_VERIFIED,
      user_verify_flag: userVerifyFlag,
      user_verify_dtm: is_thaid_verified ? now : undefined,
      record_status: RECORD_ACTIVE,
      user_register_dtm: now,
      create_dtm: now,
    };
  }

  private mapToUserAddressCreateInput(
    userId: string,
    address: CreateUserDto['address'],
  ): CreateTbUserAddressDto & ConnectTbUserRegisterDto {
    return {
      user_address_id: randomUUID(),
      user_id: userId,
      user_home_no: address.home_no,
      user_moo: address.moo,
      user_soi: address.soi,
      user_road: address.road,
      tambon_seq: parseCode(address.tambol_code),
      amphoe_seq: parseCode(address.amphur_code),
      province_seq: parseCode(address.province_code),
      tambol_name: address.tambol_name,
      amphoe_name: address.amphur_name,
      province_name: address.province_name,
      record_status: RECORD_ACTIVE,
      create_dtm: new Date(),
    };
  }

  async verifyWebsiteUser({ user_id, verify_flag, reason }: VerifyUserDto) {
    const user = await this.prisma.tb_user_register.findFirst({
      where: { user_id, record_status: RECORD_ACTIVE },
    });

    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'User not found.',
      });
    }

    if (user.method_id !== METHOD_ID_WEBSITE) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'User register method is not supported.',
      });
    }

    if (user.email_verify_flag !== EMAIL_VERIFIED) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Email not verified.',
      });
    }

    if (user.user_verify_flag === EMAIL_VERIFIED) {
      return { message: 'User already verified.' };
    }

    if (verify_flag === 2) {
      const trimmedReason = (reason ?? '').trim();
      if (!trimmedReason) {
        throw new RpcException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Reason is required.',
        });
      }

      const now = new Date();

      await this.prisma.$transaction([
        this.prisma.tb_user_register.update({
          where: { user_id: user.user_id },
          data: {
            record_status: RECORD_CANCELLED,
            user_verify_flag: USER_VERIFY_REJECTED,
            user_verify_dtm: now,
            update_dtm: now,
          },
        }),
        this.prisma.tb_user_cancel.create({
          data: {
            user_cancel_id: randomUUID(),
            user_id: user.user_id,
            user_cancel_dtm: now,
            user_cancel_reason: trimmedReason,
            record_status: RECORD_ACTIVE,
            create_dtm: now,
          },
        }),
      ]);

      return { message: 'User rejected.' };
    }

    if (verify_flag !== 1) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid verify flag.',
      });
    }

    if (!user.register_email) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Email is required.',
      });
    }

    const passwordSecret = process.env.PASSWORD_HMAC_SECRET ?? '';
    if (!passwordSecret) {
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Password secret not configured.',
      });
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = hashWithSecret(temporaryPassword, passwordSecret);
    const now = new Date();

    await this.prisma.tb_user_register.update({
      where: { user_id: user.user_id },
      data: {
        user_verify_flag: EMAIL_VERIFIED,
        user_verify_dtm: now,
        username: user.register_email,
        password: passwordHash,
        update_dtm: now,
      },
    });

    return { message: 'User verified.' };
  }

  async listPendingWebsiteUsersForVerification(): Promise<
    Array<{
      user_id: string;
      title: string | null;
      given_name: string | null;
      family_name: string | null;
      person_id: string;
      email: string;
      mobile_no: string;
      created_at: string;
      address: {
        home_no: string | null;
        moo: string | null;
        soi: string | null;
        road: string | null;
        tambol_name: string | null;
        amphur_name: string | null;
        province_name: string | null;
      } | null;
    }>
  > {
    const users = await this.prisma.tb_user_register.findMany({
      where: {
        record_status: RECORD_ACTIVE,
        method_id: METHOD_ID_WEBSITE,
        user_verify_flag: NOT_VERIFIED,
        email_verify_flag: EMAIL_VERIFIED,
      },
      orderBy: { user_register_dtm: 'desc' },
      include: {
        tb_user_address: {
          where: { record_status: RECORD_ACTIVE },
          orderBy: { create_dtm: 'desc' },
          take: 1,
        },
      },
    });

    return users.map((u) => {
      const addr = u.tb_user_address[0];
      const createdAt = u.user_register_dtm ?? u.create_dtm ?? new Date(0);

      return {
        user_id: u.user_id,
        title: u.title_name_th ?? null,
        given_name: u.first_name_th ?? null,
        family_name: u.last_name_th ?? null,
        person_id: maskPersonId(u.person_id),
        email: maskEmail(u.register_email),
        mobile_no: maskPhone(u.register_mobile_no),
        created_at: createdAt.toISOString(),
        address: addr
          ? {
              home_no: addr.user_home_no ?? null,
              moo: addr.user_moo ?? null,
              soi: addr.user_soi ?? null,
              road: addr.user_road ?? null,
              tambol_name: null,
              amphur_name: null,
              province_name: null,
            }
          : null,
      };
    });
  }
}
