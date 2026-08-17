import { HttpStatus } from '@nestjs/common';

export const INVALID_TOKEN_ERROR = {
  statusCode: HttpStatus.BAD_REQUEST,
  message: 'Unable to verify ThaID login.',
};

/* record_status: N=Normal, C=Cancel, D=Delete */
export const RECORD_ACTIVE = 'N';
