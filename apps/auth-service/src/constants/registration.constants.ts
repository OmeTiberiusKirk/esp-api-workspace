/* record_status: N=Normal, C=Cancel, D=Delete */
export const RECORD_ACTIVE = 'N';
export const RECORD_CANCELLED = 'C';

/* email_verify_flag / user_verify_flag: 0=ยังไม่ยืนยัน, 1=ยืนยันแล้ว */
export const NOT_VERIFIED = '0';
export const EMAIL_VERIFIED = '1';
export const USER_VERIFY_REJECTED = '2';

/* อ้างอิง mas.tb_ms_method (ค่าตาม seed จริง: 1=ThaiD, 2=OpenID(Digital ID), 3=บันทึกระบบเอง,
   4=DBD ID, 5=LDAP/AD, 6=Smart Card)
   ห้ามใช้ user_verify_flag เดาช่องทางเด็ดขาด เพราะช่องทางอื่น (AD/LDAP/OpenID) ก็ตั้งค่านี้เป็น 1 ได้เหมือนกัน */
export const METHOD_ID_THAID = 1;
export const METHOD_ID_OPENID = 2;
export const METHOD_ID_WEBSITE = 3;

/* อ้างอิง mas.tb_ms_channel (ค่าตาม seed จริง: 1=Website) */
export const CHANNEL_ID_WEBSITE = 1;

export const USER_TYPES = {
  NATURAL_PERSON: 1,
  JURISTIC_PERSON: 2,
  JURISTIC_REP: 3,
  EXTERNAL_AGENCY: 4,
  LAND_OFFICER: 5,
} as const;

export const REGISTRATION_METHODS = {
  THAID: 1,
  OPENID: 2,
  MANUAL: 3,
  DBDID: 4,
  LDAP: 5,
  SMART_CARD: 6,
} as const;

export const USER_VERIFICATION_STATUS = {
  NOT_VERIFIED: '0',
  EMAIL_VERIFIED: '1',
  USER_VERIFY_REJECTED: '2',
};
