import { HttpStatus } from '@nestjs/common';

export const OTP_LENGTH = 6;
export const OTP_EXPIRES_MINUTES = 5;
/* otp_flag: 0=ยังไม่ถูกใช้งาน, 1=ถูกใช้งานแล้ว */
export const OTP_UNUSED = '0';
export const OTP_USED = '1';
export const RECORD_ACTIVE = 'N';
/* email_verify_flag: 0=ยังไม่ยืนยัน, 1=ยืนยันแล้ว */
export const EMAIL_VERIFIED = '1';

export const INVALID_OTP_ERROR = {
  statusCode: HttpStatus.BAD_REQUEST,
  message: 'Invalid or expired OTP.',
};
