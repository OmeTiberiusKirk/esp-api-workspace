import { CreatePersonalDto, CreateUserDto } from '@esp/shared';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
// import { MailerService } from '../mailer/mailer.service';

/* record_status: N=Normal, C=Cancel, D=Delete */
const RECORD_ACTIVE = 'N';
const RECORD_CANCELLED = 'C';
/* email_verify_flag / user_verify_flag: 0=ยังไม่ยืนยัน, 1=ยืนยันแล้ว */
const NOT_VERIFIED = '0';
const EMAIL_VERIFIED = '1';
const USER_VERIFY_REJECTED = '2';

/* อ้างอิง reg.tb_ms_method (method_id คงที่ตาม seed data จริง: 1=THAID, 2=DIGITAL ID, 3=DBD ID, 4=LDAP/AD, 5=REGISTER)
   ห้ามใช้ user_verify_flag เดาช่องทางเด็ดขาด เพราะช่องทางอื่น (AD/LDAP/OpenID) ก็ตั้งค่านี้เป็น 1 ได้เหมือนกัน */
export const METHOD_ID_THAID = 1;
export const METHOD_ID_WEBSITE = 5;

/* tb_user_address.tambol_code/amphur_code/province_code เป็น integer — ฝั่ง frontend ส่งมาเป็นรหัส DOPA
   แบบ string (เช่น "01", "10") เพื่อรักษาเลขศูนย์นำหน้าไว้ตอนแสดงผล ตรงนี้แปลงเป็นตัวเลขก่อนเก็บ */
const parseCode = (code?: string): number | undefined => {
  if (!code) return undefined;
  const parsed = parseInt(code, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    // private readonly mailer: MailerService,
  ) {}

  async register({ personal, address, is_thaid_verified }: CreateUserDto) {
    try {
      await this.checkIdNumberExists(personal);
      await this.checkEmailExists(personal);

      const now = new Date();
      const userId = randomUUID();
      /* ผ่าน ThaID มาแล้ว = รัฐยืนยันตัวตนจริงให้เรียบร้อย ไม่ต้องรอไปยืนยันตัวตนที่สำนักงานที่ดินซ้ำอีกรอบ
       ต่างจากสมัครผ่านเว็บปกติที่ user_verify_flag ต้องรอเจ้าหน้าที่อนุมัติ (ยังคง 0 ไปก่อน) */
      const userVerifyFlag = is_thaid_verified ? EMAIL_VERIFIED : NOT_VERIFIED;
      const methodId = is_thaid_verified ? METHOD_ID_THAID : METHOD_ID_WEBSITE;

      const [user] = await this.prisma.$transaction([
        this.prisma.tb_register_user.create({
          data: {
            user_id: userId,
            method_id: methodId,
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
          },
        }),
        this.prisma.tb_user_address.create({
          data: {
            user_address_id: randomUUID(),
            user_id: userId,
            user_home_no: address.home_no,
            user_moo: address.moo,
            user_soi: address.soi,
            user_road: address.road,
            tambol_code: parseCode(address.tambol_code),
            amphur_code: parseCode(address.amphur_code),
            province_code: parseCode(address.province_code),
            record_status: RECORD_ACTIVE,
            create_dtm: now,
          },
        }),
      ]);

      return {
        user_id: user.user_id,
        person_id: user.person_id,
        email: user.register_email,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private async checkIdNumberExists(personal: CreatePersonalDto) {
    const user = await this.prisma.tb_register_user.findFirst({
      where: { person_id: personal.person_id, record_status: RECORD_ACTIVE },
    });

    /* เคยกรอกฟอร์มลงทะเบียนไปแล้วเเต่ยังไม่ยืนยันอีเมล (เช่น ปิด browser ตอนรอกรอก OTP) — ไม่ใช่ duplicate จริง
         ส่ง signal นี้ (403 + ข้อความนี้เป๊ะๆ) ให้ frontend ดักจับเเล้วยิง send-otp ให้เองพาไปหน้ากรอก OTP ต่อ
         send-otp มี resend-guard อยู่แล้ว (ดู otp.service.ts) จะคืนเวลาที่เหลือจริงของ OTP เดิม ไม่ reset เป็น 5 นาทีใหม่ */
    if (user?.email_verify_flag == EMAIL_VERIFIED)
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'ID_NUMBER_ALREADY_EXISTS',
      });
  }

  private async checkEmailExists(personal: CreatePersonalDto) {
    /* คนละ person_id เเต่ซ้ำอีเมล — ต้องกันด้วย เพราะ send-otp/verify-otp (otp.service.ts) หา user ด้วย email
       ล้วนๆ ถ้ามี 2 บัญชีใช้อีเมลเดียวกัน findFirst จะสุ่มไปเจอบัญชีใดบัญชีหนึ่ง OTP จะไปผูกกับคนละบัญชีที่ควรจะเป็น */
    const result = await this.prisma.tb_register_user.findFirst({
      where: { register_email: personal.email, record_status: RECORD_ACTIVE },
    });

    if (result) {
      if (result.email_verify_flag == EMAIL_VERIFIED)
        throw new RpcException({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'EMAIL_NOT_VERIFIED',
        });

      throw new RpcException({
        statusCode: HttpStatus.CONFLICT,
        message: 'EMAIL_ALREADY_EXISTS',
      });
    }
  }
}
