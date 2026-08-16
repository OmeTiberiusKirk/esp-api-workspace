import { Inject, Injectable } from '@nestjs/common';
import { type Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { join } from 'path';

export interface OtpEmailParams {
  to: string;
  recipientName: string;
  subjectLine: string;
  description: string;
  otpCode: string;
  expiresInMinutes: number;
}

export interface AccountVerifiedEmailParams {
  to: string;
  username: string;
  temporaryPassword: string;
}

const ASSETS_DIR = join(__dirname, 'assets');
const LOGO_CID = 'e-service-logo';
const BOTTOM_MAIL_CID = 'bottom-mail';

const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (ch) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        ch
      ] as string,
  );

const renderOtpEmailHtml = (params: OtpEmailParams): string => `
<div style="background:#FFFFFF;padding:32px 16px;font-family:Tahoma,'Leelawadee UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,0.08);padding:32px 40px;">
    <img src="cid:${LOGO_CID}" alt="e-service plus" height="36" style="display:block;margin-bottom:28px;" />
    <p style="margin:0 0 4px;color:#303031;font-size:15px;">เรียน ${escapeHtml(params.recipientName)}</p>
    <p style="margin:0 0 20px;color:#303031;font-size:15px;">เรื่อง ${escapeHtml(params.subjectLine)}</p>
    <p style="margin:0 0 24px;color:#303031;font-size:15px;line-height:1.8;white-space:pre-line;">${escapeHtml(params.description)}</p>
    <div style="background:#F7F8F9;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <span style="font-size:16px;font-weight:700;letter-spacing:1px;color:#303031;white-space:nowrap;">รหัสยืนยันตน (OTP) : ${params.otpCode}</span>
    </div>
    <p style="margin:0 0 4px;color:#888E9D;font-size:13px;">หากท่านไม่ได้เป็นผู้ทำรายการนี้ โปรดเพิกเฉยต่ออีเมลฉบับนี้</p>
    <p style="margin:0 0 24px;color:#888E9D;font-size:13px;">ขอแสดงความนับถือ</p>
    <img src="cid:${BOTTOM_MAIL_CID}" alt="กรมที่ดิน e-service plus" style="display:block;width:100%;" />
  </div>
</div>`;

/* แจ้งผลอนุมัติสิทธิ์ + รหัสผ่านชั่วคราว หลังเจ้าหน้าที่กด "ยืนยันตัวตน" ที่หน้า verify-dol (REG014) */
const renderAccountVerifiedEmailHtml = (
  params: AccountVerifiedEmailParams,
): string => `
<div style="background:#FFFFFF;padding:32px 16px;font-family:Tahoma,'Leelawadee UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,0.08);padding:32px 40px;">
    <img src="cid:${LOGO_CID}" alt="e-service plus" height="36" style="display:block;margin-bottom:28px;" />
    <p style="margin:0 0 4px;color:#303031;font-size:15px;">เรียน ท่านผู้ใช้บริการเว็บ e-service plus</p>
    <p style="margin:0 0 20px;color:#303031;font-size:15px;">เรื่อง แจ้งผลการยืนยันตัวตนและรหัสผ่านเข้าใช้งานระบบ</p>
    <p style="margin:0 0 24px;color:#303031;font-size:15px;line-height:1.8;">
      ตามที่ท่านได้ดำเนินการยื่นคำขอและเดินทางไปยืนยันตัวตน ณ สำนักงานที่ดิน เรียบร้อยแล้วนั้น<br/>
      เจ้าหน้าที่ได้ทำการตรวจสอบและ&quot;อนุมัติสิทธิ์&quot;การเปิดใช้งานบัญชีของท่านในระบบเรียบร้อยแล้ว<br/>
      ท่านสามารถเข้าสู่ระบบเพื่อเริ่มต้นใช้งานได้ทันที โดยใช้ข้อมูลรหัสผ่านชั่วคราวดังต่อไปนี้
    </p>
    <div style="background:#F7F8F9;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#303031;">ชื่อผู้ใช้งาน : ${escapeHtml(params.username)}</p>
      <p style="margin:0;font-size:16px;font-weight:700;color:#303031;">รหัสผ่านชั่วคราว : ${escapeHtml(params.temporaryPassword)}</p>
    </div>
    <p style="margin:0 0 4px;color:#888E9D;font-size:13px;">หากท่านไม่ได้เป็นผู้ทำรายการนี้ โปรดเพิกเฉยต่ออีเมลฉบับนี้</p>
    <p style="margin:0 0 24px;color:#888E9D;font-size:13px;">ขอแสดงความนับถือ</p>
    <img src="cid:${BOTTOM_MAIL_CID}" alt="กรมที่ดิน e-service plus" style="display:block;width:100%;" />
  </div>
</div>`;

@Injectable()
export class MailerService {
  constructor(
    @Inject('transporter')
    private transporter: Transporter<
      SMTPTransport.SentMessageInfo,
      SMTPTransport.Options
    >,
  ) {}

  /* contentDisposition: 'inline' บังคับให้ mail client แสดงรูปในเนื้อหาอีเมลเสมอ
     ไม่งั้น client บางตัว (เช่น Outlook รุ่นเก่า) จะถือว่าเป็นไฟล์แนบเเยกต่างหาก แล้วซ่อน/ยุบไว้ท้ายอีเมลแทนที่จะโชว์ตรง cid */
  private readonly assetAttachments = [
    {
      filename: 'e-service-logo.png',
      path: join(ASSETS_DIR, 'e-service-logo.png'),
      cid: LOGO_CID,
      contentDisposition: 'inline' as const,
    },
    {
      filename: 'bottom-mail.png',
      path: join(ASSETS_DIR, 'bottom-mail.png'),
      cid: BOTTOM_MAIL_CID,
      contentDisposition: 'inline' as const,
    },
  ];

  async sendOtpEmail(params: OtpEmailParams): Promise<void> {
    await this.transporter.sendMail({
      from: `"e-service plus" <${process.env.OAUTH2_EMAIL}>`,
      to: params.to,
      subject: params.subjectLine,
      html: renderOtpEmailHtml(params),
      attachments: this.assetAttachments,
    });
  }

  async sendAccountVerifiedEmail(
    params: AccountVerifiedEmailParams,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: `"e-service plus" <${process.env.OAUTH2_EMAIL}>`,
      to: params.to,
      subject: 'แจ้งผลการยืนยันตัวตนและรหัสผ่านเข้าใช้งานระบบ',
      html: renderAccountVerifiedEmailHtml(params),
      attachments: this.assetAttachments,
    });
  }
}
