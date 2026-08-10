import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  hello(): { message: string } {
    return { message: 'hello mail' };
  }
}
