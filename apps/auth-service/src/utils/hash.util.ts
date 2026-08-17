import { createHmac, timingSafeEqual } from 'crypto';

/* เทคนิคเดียวกับ otp.service.ts (hashOtp/matchesHash) แยกออกมาเป็น shared util เพื่อใช้กับรหัสผ่านด้วย
   ใช้ secret คนละตัวกับ OTP เพราะอายุการใช้งานต่างกันมาก (รหัสผ่านอยู่ยาว ถ้า secret เดียวกัน หมุน secret
   ครั้งเดียวจะพังทั้ง OTP ที่ค้างอยู่และรหัสผ่านที่ออกไปแล้วพร้อมกัน) */
export const hashWithSecret = (value: string, secret: string): string =>
  createHmac('sha256', secret).update(value).digest('hex');

export const matchesHash = (
  value: string,
  storedHash: string,
  secret: string,
): boolean => {
  const candidate = Buffer.from(hashWithSecret(value, secret), 'hex');
  const stored = Buffer.from(storedHash, 'hex');
  return (
    candidate.length === stored.length && timingSafeEqual(candidate, stored)
  );
};
