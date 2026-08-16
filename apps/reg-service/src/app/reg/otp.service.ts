import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { MAILER_PATTERNS } from '@esp/shared';
import { PrismaService } from '../prisma/prisma.service';
import {
  OTP_EXPIRES_MINUTES,
  OTP_LENGTH,
  OTP_UNUSED,
  OTP_USED,
  RECORD_ACTIVE,
} from '../../constants/otp';
import { createHmac, randomBytes, randomInt, randomUUID } from 'node:crypto';
import { TbUserRegister } from '../../generated/nestjs-dto/tbUserRegister.entity';
import { MAILER_SERVICE_CLIENT } from '../../constants/service-clients.constants';

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

  private buildRecipientName(user: TbUserRegister): string {
    return (
      [user.title_name_th, user.first_name_th, user.last_name_th]
        .filter(Boolean)
        .join(' ') || (user.register_email ?? '')
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
