import { HttpStatus } from '@nestjs/common';

export const DBDID_SERVICE_UNAVAILABLE_ERROR = {
  statusCode: HttpStatus.SERVICE_UNAVAILABLE,
  message: 'DBD ID service unavailable.',
};

export const INVALID_DBDID_TOKEN_ERROR = {
  statusCode: HttpStatus.BAD_REQUEST,
  message: 'Unable to verify DBD ID login.',
};

/* record_status: N=Normal, C=Cancel, D=Delete */
export const RECORD_ACTIVE = 'N';

export const USER_TYPE_LEGAL = 'legal';

/* DBD ID เข้ารหัส client secret ด้วย md5 วนซ้ำก่อนใช้ทำ HTTP Basic auth เหมือน DGA (ทางรัฐ) */
export const DBDID_SECRET_SALT = 'EGA';
export const DBDID_SECRET_HASH_ROUNDS = 7;
