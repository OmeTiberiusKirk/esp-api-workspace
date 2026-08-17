import { randomUUID } from 'node:crypto';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { CreateExternalOrgUserDto, MAILER_PATTERNS, VerifyUserDto } from '@esp/shared';
import { PrismaService } from '../prisma/prisma.service';
import { FileStorageService } from '../file-storage/file-storage.service';
import { MAILER_SERVICE_CLIENT } from '../../constants/service-clients.constants';
import { hashWithSecret } from '../../utils/hash.util';
import { generateTemporaryPassword } from '../../utils/password.util';
import { maskEmail, maskPersonId, maskPhone } from '../../utils/mask.util';
import { parseCode } from '../../utils/parse-code.util';
import {
  CHANNEL_ID_WEBSITE,
  EMAIL_VERIFIED,
  METHOD_ID_WEBSITE,
  NOT_VERIFIED,
  RECORD_ACTIVE,
  RECORD_CANCELLED,
  USER_VERIFY_REJECTED,
} from '../../constants/registration.constants';

const ATTACHMENT_SUB_DIR = 'reg-external';

@Injectable()
export class RegisterExternalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorage: FileStorageService,
    @Inject(MAILER_SERVICE_CLIENT) private readonly mailerClient: ClientProxy,
  ) {}

  async createExternalOrgUser({
    personal,
    address,
    departmentAddress,
    attachments,
  }: CreateExternalOrgUserDto) {
    const existingUser = await this.prisma.tb_user_register.findFirst({
      where: {
        record_status: RECORD_ACTIVE,
        OR: [{ person_id: personal.person_id }, { register_email: personal.email }],
      },
    });

    if (existingUser) {
      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: 'DUPLICATE_USER_INFO_CONTACT_STAFF',
      });
    }

    /* อัปโหลดไฟล์ให้เสร็จก่อนเปิด transaction — ไม่อยากได้ row ใน DB ที่ชี้ไปยังไฟล์ที่เขียนไม่สำเร็จ */
    const uploaded = await Promise.all(
      (attachments ?? []).map((file) =>
        this.fileStorage.upload(
          Buffer.from(file.buffer_base64, 'base64'),
          file.file_name,
          file.file_mime_type,
          ATTACHMENT_SUB_DIR,
        ),
      ),
    );

    const userId = randomUUID();
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.tb_user_register.create({
        /* ห้าม spread ...personal ตรงๆ — ชื่อฟิลด์ email/mobile_no (DTO) ไม่ตรงกับ
           register_email/register_mobile_no (DB) ดู auth.service.ts mapToUserCreateInput ประกอบ */
        data: {
          user_type_id: personal.user_type_id,
          method_id: METHOD_ID_WEBSITE,
          person_id: personal.person_id,
          title_id: personal.title_id,
          title_name_th: personal.title_name_th,
          first_name_th: personal.first_name_th,
          middle_name_th: personal.middle_name_th,
          last_name_th: personal.last_name_th,
          register_email: personal.email,
          register_mobile_no: personal.mobile_no,
          user_id: userId,
          channel_id: CHANNEL_ID_WEBSITE,
          birth_date: personal.birth_date ? new Date(personal.birth_date) : undefined,
          date_of_expiry: personal.date_of_expiry
            ? new Date(personal.date_of_expiry)
            : undefined,
          email_verify_flag: NOT_VERIFIED,
          user_verify_flag: NOT_VERIFIED,
          record_status: RECORD_ACTIVE,
          user_register_dtm: now,
          create_dtm: now,
        },
      }),
      this.prisma.tb_user_address.create({
        /* ห้าม spread ...address ตรงๆ — tambol_seq/amphoe_seq/province_seq (DTO, string) ไม่ตรงกับ
           tambon_seq (DB, int, สะกดคนละแบบ) ดู auth.service.ts mapToUserAddressCreateInput ประกอบ */
        data: {
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
          create_dtm: now,
        },
      }),
      this.prisma.tb_user_department_address.create({
        data: {
          ...departmentAddress,
          department_address_id: randomUUID(),
          user_id: userId,
          department_tambon_seq: parseCode(departmentAddress.department_tambon_seq),
          department_amphoe_seq: parseCode(departmentAddress.department_amphoe_seq),
          department_province_seq: parseCode(departmentAddress.department_province_seq),
          record_status: RECORD_ACTIVE,
          create_dtm: now,
        },
      }),
      ...uploaded.map((file) =>
        this.prisma.tb_user_reg_attach_file.create({
          data: {
            reg_attach_file_id: randomUUID(),
            user_id: userId,
            file_name: file.file_name,
            file_path: file.file_path,
            file_mime_type: file.file_mime_type,
            file_size: file.file_size,
            record_status: RECORD_ACTIVE,
            create_dtm: now,
          },
        }),
      ),
    ]);

    return { user_id: userId, person_id: personal.person_id, email: personal.email };
  }

  /* ต้องมี tb_user_department_address ผูกอยู่จริง ถึงจะถือว่าเป็นหน่วยงานภายนอก — แยกจากรายการรอ
     ยืนยันตัวตนของ REG014 (สมัครเว็บทั่วไป) ที่ method_id เดียวกันแต่ไม่มีที่อยู่หน่วยงาน */
  async listPendingExternalOrgUsers() {
    const users = await this.prisma.tb_user_register.findMany({
      where: {
        record_status: RECORD_ACTIVE,
        method_id: METHOD_ID_WEBSITE,
        user_verify_flag: NOT_VERIFIED,
        email_verify_flag: EMAIL_VERIFIED,
        tb_user_department_address: { some: { record_status: RECORD_ACTIVE } },
      },
      orderBy: { user_register_dtm: 'desc' },
      include: {
        tb_user_department_address: {
          where: { record_status: RECORD_ACTIVE },
          orderBy: { create_dtm: 'desc' },
          take: 1,
        },
      },
    });

    return users.map((u) => {
      const dept = u.tb_user_department_address[0];
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
        department: dept
          ? {
              department_type: dept.department_type ?? null,
              private_office_certificate_no: dept.private_office_certificate_no ?? null,
            }
          : null,
      };
    });
  }

  async verifyExternalOrgUser({ user_id, verify_flag, reason }: VerifyUserDto) {
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
}
