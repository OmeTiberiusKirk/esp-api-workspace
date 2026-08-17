import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DBDID_PATTERNS, DbdidLoginDto } from '@esp/shared';
import { DbdidService } from './dbdid.service';

@Controller()
export class DbdidController {
  constructor(private readonly dbdidService: DbdidService) {}

  @MessagePattern(DBDID_PATTERNS.DBDID_LOGIN)
  async dbdidLogin(@Payload() data: DbdidLoginDto) {
    return this.dbdidService.exchangeCode(data);
  }
}
