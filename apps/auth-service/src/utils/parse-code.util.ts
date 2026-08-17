/* คอลัมน์รหัสพื้นที่ของ tb_user_address และ tb_user_private_office เป็น integer — ฝั่ง frontend
   ส่งมาเป็น string เพื่อรักษาเลขศูนย์นำหน้าไว้ตอนแสดงผล ตรงนี้แปลงเป็นตัวเลขก่อนเก็บ
   ใช้ร่วมกันทั้ง registration.service.ts และ register-external/register-external.service.ts */
export const parseCode = (code?: string): number | undefined => {
  if (!code) return undefined;
  const parsed = parseInt(code, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};
