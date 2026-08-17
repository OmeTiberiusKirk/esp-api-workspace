/* ปกป้อง PII ก่อนส่งออกนอก service — ห้ามส่ง person_id/email/mobile_no แบบดิบเด็ดขาด */

/* เลขบัตรประชาชนไทย รูปแบบ X-XXXX-XXXXX-XX-X (1-4-5-2-1 = 13 หลัก)
   เปิดเผยเฉพาะหลักที่ 5-9 (หลักท้ายของกลุ่มที่ 2 + หลักแรก 4 ตัวของกลุ่มที่ 3) ที่เหลือ mask ทั้งหมด */
export const maskPersonId = (personId: string | null | undefined): string => {
  const digits = (personId ?? '').replace(/\D/g, '');
  if (digits.length !== 13) return '*'.repeat(digits.length || 13);

  const masked = digits
    .split('')
    .map((d, i) => (i >= 4 && i <= 8 ? d : '*'))
    .join('');

  return `${masked[0]}-${masked.slice(1, 5)}-${masked.slice(5, 10)}-${masked.slice(10, 12)}-${masked[12]}`;
};

/* เปิดเผยตัวอักษรแรกของ local part ที่เหลือ mask ตามความยาวจริง, domain คงเดิม */
export const maskEmail = (email: string | null | undefined): string => {
  const value = email ?? '';
  const atIndex = value.indexOf('@');
  if (atIndex <= 0) return '*'.repeat(value.length);

  const local = value.slice(0, atIndex);
  const domain = value.slice(atIndex);
  const maskedLocal = local[0] + '*'.repeat(Math.max(local.length - 1, 0));

  return `${maskedLocal}${domain}`;
};

/* เบอร์มือถือไทย รูปแบบ XXX-XXX-XXXX (3-3-4 = 10 หลัก) เปิดเผย 5 หลักแรก ที่เหลือ mask */
export const maskPhone = (phone: string | null | undefined): string => {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (digits.length !== 10) return '*'.repeat(digits.length || 10);

  const masked = digits
    .split('')
    .map((d, i) => (i < 5 ? d : '*'))
    .join('');

  return `${masked.slice(0, 3)}-${masked.slice(3, 6)}-${masked.slice(6, 10)}`;
};
