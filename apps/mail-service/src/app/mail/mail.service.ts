import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpService {
  hello(): { message: string } {
    return { message: 'hello otp' };
  }
}
