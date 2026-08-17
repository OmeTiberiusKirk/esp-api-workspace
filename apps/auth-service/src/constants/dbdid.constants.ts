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
