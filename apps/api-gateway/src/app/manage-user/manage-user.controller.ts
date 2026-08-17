import { Controller, Get, Headers, Inject, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { MANAGE_USER_PATTERNS } from '@esp/shared';
import { send } from '../../utils/sendMessage';
import { AUTH_SERVICE_CLIENT } from '../../constants/service-clients.constants';

@ApiTags('Manage User')
@ApiBearerAuth()
@Controller('manage-user')
export class ManageUserController {
  constructor(
    @Inject(AUTH_SERVICE_CLIENT) private readonly client: ClientProxy,
  ) {}

  /* ใช้ @Query('field') รายตัวแทนการ bind ทั้ง DTO — Omit<...> เป็น type ล้วนๆ ไม่มี class จริงตอน runtime
     ValidationPipe (transform:true) จะมองว่า metatype เป็น Object เฉยๆ แล้วข้าม transform ไปเลย
     ทำให้ page/limit ยังเป็น string ค้างอยู่ ส่งต่อไป Prisma (Int column) แล้วพัง */
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({ name: 'user_type', required: false })
  @ApiQuery({ name: 'first_name', required: false })
  @ApiQuery({ name: 'last_name', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('/users')
  async listUsers(
    @Headers('authorization') authorization: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('user_type') user_type?: string,
    @Query('first_name') first_name?: string,
    @Query('last_name') last_name?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return send(this.client, MANAGE_USER_PATTERNS.LIST_USERS, {
      authorization,
      start_date,
      end_date,
      user_type,
      first_name,
      last_name,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
