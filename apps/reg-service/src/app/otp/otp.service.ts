import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { MAILER_PATTERNS, VerifyOtpDto } from '@esp/shared';
import { PrismaService } from '../prisma/prisma.service';
import {
  INVALID_OTP_ERROR,
  OTP_EXPIRES_MINUTES,
  OTP_LENGTH,
  OTP_UNUSED,
  OTP_USED,
  RECORD_ACTIVE,
} from '../../constants/otp.constants';
import {
  EMAIL_VERIFIED,
  METHOD_ID_THAID,
} from '../../constants/registration.constants';
import {
  createHmac,
  randomBytes,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from 'node:crypto';
import { TbUserRegister } from '../../generated/nestjs-dto/tbUserRegister.entity';
import { MAILER_SERVICE_CLIENT } from '../../constants/service-clients.constants';
import { signJwt } from '../../utils/jwt.util';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MAILER_SERVICE_CLIENT) private readonly mailerClient: ClientProxy,
  ) {}

  async sendOtp(
    user: TbUserRegister,
  ): Promise<{ message: string; expiresInSeconds: number }> {
    const existing = await this.prisma.tb_user_email_otp.findFirst({
      where: {
        user_id: user.user_id,
        otp_flag: OTP_UNUSED,
        otp_expire_dtm: { gt: new Date() },
      },
      orderBy: { create_dtm: 'desc' },
    });

    if (existing?.otp_expire_dtm) {
      return {
        message: 'OTP already sent',
        expiresInSeconds: Math.max(
          0,
          Math.ceil((existing.otp_expire_dtm.getTime() - Date.now()) / 1000),
        ),
      };
    }

    const otp = this.generateOtp();
    const refCode = this.generateRefCode();
    const now = new Date();
    const otpExpireDtm = new Date(now.getTime() + OTP_EXPIRES_MINUTES * 60_000);

    await this.prisma.$transaction(async (tx) => {
      await tx.tb_user_email_otp.updateMany({
        where: { user_id: user.user_id, otp_flag: OTP_UNUSED },
        data: { otp_flag: OTP_USED, update_dtm: now },
      });

      await tx.tb_user_email_otp.create({
        data: {
          email_otp_id: randomUUID(),
          user_id: user.user_id,
          email_otp: user.register_email,
          otp: this.hashOtp(otp),
          ref_code: refCode,
          otp_expire_dtm: otpExpireDtm,
          otp_flag: OTP_UNUSED,
          record_status: RECORD_ACTIVE,
          create_dtm: now,
        },
      });
    });

    await firstValueFrom(
      this.mailerClient
        .send<{ success: true }>(MAILER_PATTERNS.SEND_OTP_EMAIL, {
          to: user.register_email,
          recipientName: this.buildRecipientName(user),
          subjectLine: 'ยืนยันอีเมลสำหรับการลงทะเบียนใช้งานระบบ',
          description:
            'กรุณากรอกรหัส OTP ด้านล่างนี้เพื่อยืนยันอีเมลของท่านให้เสร็จสมบูรณ์',
          otpCode: otp,
          expiresInMinutes: OTP_EXPIRES_MINUTES,
        })
        .pipe(timeout(5_000)),
    );

    return { message: 'OTP sent', expiresInSeconds: OTP_EXPIRES_MINUTES * 60 };
  }

  async verifyOtp({ email, otp }: VerifyOtpDto): Promise<{
    message: string;
    access_token: string;
    refresh_token: string;
  }> {
    const user = await this.prisma.tb_user_register.findFirst({
      where: { register_email: email, record_status: RECORD_ACTIVE },
    });
    if (!user) throw new RpcException(INVALID_OTP_ERROR);

    const otpRecord = await this.prisma.tb_user_email_otp.findFirst({
      where: { user_id: user.user_id, otp_flag: OTP_UNUSED },
      orderBy: { create_dtm: 'desc' },
    });

    if (
      !otpRecord ||
      !otpRecord.otp_expire_dtm ||
      otpRecord.otp_expire_dtm < new Date()
    ) {
      throw new RpcException(INVALID_OTP_ERROR);
    }

    if (!this.matchesOtp(this.hashOtp(otp), otpRecord.otp ?? '')) {
      throw new RpcException(INVALID_OTP_ERROR);
    }

    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.tb_user_email_otp.update({
        where: { email_otp_id: otpRecord.email_otp_id },
        data: { otp_flag: OTP_USED, update_dtm: now },
      }),
      this.prisma.tb_user_register.update({
        where: { user_id: user.user_id },
        data: { email_verify_flag: EMAIL_VERIFIED, email_verify_dtm: now },
      }),
    ]);

    /* ยืนยันอีเมลสำเร็จ = พิสูจน์ตัวตนความเป็นเจ้าของบัญชีนี้ได้แล้ว — ออก session ให้เลย
       ไม่ต้องรอ login ซ้ำ ไม่งั้นหน้า /home จะไม่มี access_token cookie ให้แสดงชื่อผู้ใช้งาน */
    const accessSecret = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret';
    const refreshSecret =
      process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';
    const accessExp = Number(process.env.JWT_ACCESS_EXPIRES_IN_SEC ?? 900);
    const refreshExp = Number(process.env.JWT_REFRESH_EXPIRES_IN_SEC ?? 604800);

    /* เช็คช่องทางจาก method_id (อ้างอิง tb_ms_method) โดยตรง — ห้ามใช้ user_verify_flag เดา เพราะช่องทางอื่น
       (AD/LDAP/OpenID ในอนาคต) ก็ตั้ง user_verify_flag เป็น 1 ได้เหมือนกัน ไม่ได้แปลว่าเป็น ThaiD เสมอไป */
    const isThaidUser = user.method_id === METHOD_ID_THAID;

    const tokenPayload = {
      user_id: user.user_id,
      person_id: user.person_id,
      given_name: user.first_name_th,
      family_name: user.last_name_th,
      email: user.register_email,
      login_channel: isThaidUser ? 'thaid' : 'email',
      login_channel_label: isThaidUser ? 'ThaiD' : 'อีเมล',
    };

    const accessToken = signJwt(tokenPayload, accessSecret, accessExp);
    const refreshToken = signJwt(
      { ...tokenPayload, token_type: 'refresh' },
      refreshSecret,
      refreshExp,
    );

    return {
      message: 'Email verified',
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /* เทียบแบบ constant-time กัน timing attack */
  private matchesOtp(candidateHash: string, storedHash: string): boolean {
    const candidateBuf = Buffer.from(candidateHash);
    const storedBuf = Buffer.from(storedHash);
    return (
      candidateBuf.length === storedBuf.length &&
      timingSafeEqual(candidateBuf, storedBuf)
    );
  }

  private buildRecipientName(user: TbUserRegister): string {
    return (
      [user.title_name_th, user.first_name_th, user.last_name_th]
        .filter(Boolean)
        .join(' ') ||
      (user.register_email ?? '')
    );
  }

  private generateOtp(): string {
    return randomInt(0, 10 ** OTP_LENGTH)
      .toString()
      .padStart(OTP_LENGTH, '0');
  }

  /* ref_code (varchar(10)) — รหัสอ้างอิงของ OTP รอบนี้ ไม่ใช่ตัว OTP เอง ใช้ผูกกับ verify-otp ภายหลัง */
  private generateRefCode(): string {
    return randomBytes(5).toString('hex').toUpperCase().slice(0, 10);
  }

  /* เก็บ HMAC-SHA256 hash เต็ม (64 ตัวอักษร) ของ OTP แทน plaintext — ต้องมี OTP_HMAC_SECRET ประกอบ
     การเดา/brute-force ฝั่งที่มีแค่ DB (ไม่มี secret) จะทำไม่ได้เลย ต่างจากเก็บ plaintext ที่ใครอ่าน DB ได้
     ก็เอา OTP ไปใช้ยืนยันแทนเจ้าของอีเมลได้ทันทีภายในเวลาที่ยังไม่หมดอายุ */
  private hashOtp(otp: string): string {
    return createHmac('sha256', process.env.OTP_HMAC_SECRET ?? '')
      .update(otp)
      .digest('hex');
  }
}
