import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { randomUUID } from 'crypto';
import { maskEmail, maskPersonId, maskPhone } from '../../utils/mask.util';
import { hashWithSecret } from '../../utils/hash.util';
import { PrismaService } from '../prisma/prisma.service';
import { generateTemporaryPassword } from '../../utils/password.util';
import { CreateTbUserRegisterDto } from '../../generated/nestjs-dto/create-tbUserRegister.dto';
import { CreateTbUserAddressDto } from '../../generated/nestjs-dto/create-tbUserAddress.dto';
import { ConnectTbUserRegisterDto } from '../../generated/nestjs-dto/connect-tbUserRegister.dto';
import { parseCode } from '../../utils/parse-code.util';
import {
  CreateUserDto,
  MAILER_PATTERNS,
  VerifyOtpDto,
  VerifyUserDto,
} from '@esp/shared';
import { OtpService } from '../otp/otp.service';
import { MAILER_SERVICE_CLIENT } from '../../constants/service-clients.constants';
import {
  CHANNEL_ID_WEBSITE,
  METHOD_ID_WEBSITE,
  NOT_VERIFIED,
  RECORD_ACTIVE,
  RECORD_CANCELLED,
  REGISTRATION_METHODS,
  USER_VERIFY_REJECTED,
} from '../../constants/registration.constants';
import { EMAIL_VERIFIED } from '../../constants/otp.constants';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
    @Inject(MAILER_SERVICE_CLIENT) private readonly mailerClient: ClientProxy,
  ) {}

  async createUser(data: CreateUserDto) {
    /* เช็ค person_id กับ email ซ้ำรวมเป็น query เดียว เจอซ้ำฝั่งไหนก็ตอบ error เดียวกันหมด
       ไม่แยก verified/unverified แล้ว ให้เจ้าหน้าที่จัดการเองแทนการ auto-resume */
    await this.checkUserExists(data);

    const userId = randomUUID();
    const [user] = await this.prisma.$transaction([
      this.prisma.tb_user_register.create({
        data: this.mapToUserCreateInput(userId, data),
      }),
      this.prisma.tb_user_address.create({
        data: this.mapToUserAddressCreateInput(userId, data),
      }),
    ]);

    await this.otpService.sendOtp(user);

    return {
      user_id: user.user_id,
      person_id: user.person_id,
      email: user.register_email,
    };
  }

  async verifyOtp(data: VerifyOtpDto): Promise<{ message: string }> {
    return this.otpService.verifyOtp(data);
  }

  /* ปุ่ม "ส่งรหัสอีกครั้ง" ที่หน้ายืนยันอีเมล — แยกออกจาก createUser เพราะ user อาจปิดหน้าไปแล้วกลับมาใหม่
     โดยไม่ได้สมัครซ้ำ ใช้ guard เดียวกับใน OtpService.sendOtp (ไม่ยิงซ้ำถ้ายังมี OTP ที่ไม่หมดอายุ) */
  async resendOtp({ email }: { email: string }): Promise<{
    message: string;
    expiresInSeconds: number;
  }> {
    const user = await this.prisma.tb_user_register.findFirst({
      where: { register_email: email, record_status: RECORD_ACTIVE },
    });

    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'User not found.',
      });
    }

    return this.otpService.sendOtp(user);
  }

  async checkUserExists(personal: CreateUserDto): Promise<void> {
    const existingUser = await this.prisma.tb_user_register.findFirst({
      where: {
        record_status: RECORD_ACTIVE,
        OR: [
          { person_id: personal.person_id },
          { register_email: personal.register_email },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email_verify_flag !== EMAIL_VERIFIED) {
        await this.otpService.sendOtp(existingUser);
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
    personal: CreateUserDto,
  ): CreateTbUserRegisterDto {
    const now = new Date();
    /* ผ่าน ThaID มาแล้ว = รัฐยืนยันตัวตนจริงให้เรียบร้อย ไม่ต้องรอไปยืนยันตัวตนที่สำนักงานที่ดินซ้ำอีกรอบ
       ต่างจากสมัครผ่านเว็บปกติที่ user_verify_flag ต้องรอเจ้าหน้าที่อนุมัติ (ยังคง 0 ไปก่อน) */
    const isUserVerified = personal.method_id != REGISTRATION_METHODS.MANUAL;

    /* ห้าม spread ...personal ตรงๆ — CreatePersonalDto ใช้ชื่อฟิลด์ email/mobile_no (ตามฟอร์ม)
       แต่ tb_user_register ใช้ register_email/register_mobile_no (ตาม DB) ชื่อไม่ตรงกัน
       spread ตรงๆ จะเหลือ key email/mobile_no ที่ Prisma ไม่รู้จักติดไปด้วย แล้ว throw ตอน runtime */
    return {
      user_type_id: personal.user_type_id,
      method_id: personal.method_id,
      person_id: personal.person_id,
      title_name_th: personal.title_name_th,
      first_name_th: personal.first_name_th,
      middle_name_th: personal.middle_name_th,
      last_name_th: personal.last_name_th,
      register_email: personal.register_email,
      register_mobile_no: personal.register_mobile_no,
      user_id: userId,
      channel_id: CHANNEL_ID_WEBSITE,
      birth_date: personal.birth_date
        ? new Date(personal.birth_date)
        : undefined,
      date_of_expiry: personal.date_of_expiry
        ? new Date(personal.date_of_expiry)
        : undefined,
      email_verify_flag: isUserVerified ? '1' : '0',
      user_verify_flag: isUserVerified ? '1' : '0',
      user_verify_dtm: isUserVerified ? now : undefined,
      record_status: RECORD_ACTIVE,
      user_register_dtm: now,
      create_dtm: now,
    };
  }

  private mapToUserAddressCreateInput(
    userId: string,
    address: CreateUserDto,
  ): CreateTbUserAddressDto & ConnectTbUserRegisterDto {
    /* ห้าม spread ...address ตรงๆ เช่นกัน — CreateAddressDto เก็บรหัสพื้นที่เป็น tambol_seq/amphoe_seq/
       province_seq (string, มาจากฟอร์ม) แต่ tb_user_address ใช้ tambon_seq (int, สะกดคนละแบบ + ต่างชนิด)
       ต้อง map เฉพาะฟิลด์ที่ตรงจริง ไม่งั้น tambol_seq (key ที่ Prisma ไม่รู้จัก) จะติดไปด้วย */
    return {
      user_home_no: address.user_home_no,
      user_soi: address.user_soi,
      user_road: address.user_road,
      user_moo: address.user_moo,
      tambol_name: address.tambol_name,
      amphoe_name: address.amphoe_name,
      province_name: address.province_name,
      user_address_id: randomUUID(),
      user_id: userId,
      tambon_seq: parseCode(address.tambol_seq),
      amphoe_seq: parseCode(address.amphoe_seq),
      province_seq: parseCode(address.province_seq),
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

    await firstValueFrom(
      this.mailerClient
        .send<{ success: true }>(MAILER_PATTERNS.SEND_ACCOUNT_VERIFIED_EMAIL, {
          to: user.register_email,
          username: user.register_email,
          temporaryPassword,
        })
        .pipe(timeout(5_000)),
    );

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
