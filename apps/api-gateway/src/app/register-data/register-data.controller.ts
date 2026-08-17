import { Controller, Get, Headers, Inject, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { REGISTER_DATA_PATTERNS } from '@esp/shared';
import { send } from '../../utils/sendMessage';
import { AUTH_SERVICE_CLIENT } from '../../constants/service-clients.constants';

@ApiTags('Register Data')
@ApiBearerAuth()
@Controller('register-data')
export class RegisterDataController {
  constructor(
    @Inject(AUTH_SERVICE_CLIENT) private readonly client: ClientProxy,
  ) {}

  /* ใช้ @Query('field') รายตัวเหมือน manage-user.controller.ts — ดูเหตุผลเรื่อง Omit<> + ValidationPipe
     ที่คอมเมนต์ไว้ในไฟล์นั้นประกอบ */
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({ name: 'user_type', required: false })
  @ApiQuery({ name: 'method_id', required: false, type: Number })
  @ApiQuery({ name: 'channel_id', required: false, type: Number })
  @Get('/stats')
  async stats(
    @Headers('authorization') authorization: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('user_type') user_type?: string,
    @Query('method_id') method_id?: string,
    @Query('channel_id') channel_id?: string,
  ) {
    return send(this.client, REGISTER_DATA_PATTERNS.STATS, {
      authorization,
      start_date,
      end_date,
      user_type,
      method_id: method_id ? Number(method_id) : undefined,
      channel_id: channel_id ? Number(channel_id) : undefined,
    });
  }

  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({ name: 'user_type', required: false })
  @ApiQuery({ name: 'method_id', required: false, type: Number })
  @ApiQuery({ name: 'channel_id', required: false, type: Number })
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
    @Query('method_id') method_id?: string,
    @Query('channel_id') channel_id?: string,
    @Query('first_name') first_name?: string,
    @Query('last_name') last_name?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return send(this.client, REGISTER_DATA_PATTERNS.LIST_USERS, {
      authorization,
      start_date,
      end_date,
      user_type,
      method_id: method_id ? Number(method_id) : undefined,
      channel_id: channel_id ? Number(channel_id) : undefined,
      first_name,
      last_name,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
