import { HttpStatus } from '@nestjs/common';

export const OPENID_SERVICE_UNAVAILABLE_ERROR = {
  statusCode: HttpStatus.SERVICE_UNAVAILABLE,
  message: 'OpenID service unavailable.',
};

export const INVALID_OPENID_TOKEN_ERROR = {
  statusCode: HttpStatus.BAD_REQUEST,
  message: 'Unable to verify OpenID login.',
};

/* DGA (ทางรัฐ) เข้ารหัส client secret ด้วย md5 วนซ้ำก่อนใช้ทำ HTTP Basic auth
   ไม่ใช่ standard OAuth client_secret_basic ปกติแบบ ThaID/DBD ID */
export const DGA_SECRET_SALT = 'EGA';
export const DGA_SECRET_HASH_ROUNDS = 7;
