import { randomInt } from 'crypto';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SPECIAL = '!@#$%^&*';
const ALL = LOWER + UPPER + DIGITS + SPECIAL;

const pick = (charset: string): string => charset[randomInt(charset.length)];

/* รหัสผ่านชั่วคราวสุ่ม — บังคับให้มีครบ พิมพ์เล็ก/พิมพ์ใหญ่/ตัวเลข/อักขระพิเศษ อย่างละ 1 ตัว
   ตรงตาม PASSWORD_RULES ที่ frontend ใช้ตรวจตอนเปลี่ยนรหัสผ่าน (ดู ChangePasswordTab/forget-password-form) */
export const generateTemporaryPassword = (length = 8): string => {
  const required = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SPECIAL)];
  const rest = Array.from({ length: Math.max(length - required.length, 0) }, () =>
    pick(ALL),
  );
  const chars = [...required, ...rest];

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
};

/* กติกาเดียวกับที่ frontend ใช้ตรวจตอนกรอกฟอร์มเปลี่ยนรหัสผ่าน — ต้องตรงกันทั้งสองฝั่ง
   ไม่งั้น user จะผ่าน validation ฝั่ง client แล้วมาโดน reject ฝั่ง server อีกที */
export const meetsPasswordRules = (password: string): boolean =>
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /\d/.test(password) &&
  /[!@#$%^&*]/.test(password);
