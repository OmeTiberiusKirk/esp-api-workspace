import { Body, Controller, Get, Headers, Inject, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import {
  ChangePasswordDto,
  ME_PATTERNS,
  UpdateAddressDto,
  UpdateProfileDto,
} from '@esp/shared';
import { send } from '../../utils/sendMessage';
import { AUTH_SERVICE_CLIENT } from '../../constants/service-clients.constants';

@ApiTags('Me')
@ApiBearerAuth()
@Controller('me')
export class MeController {
  constructor(
    @Inject(AUTH_SERVICE_CLIENT) private readonly client: ClientProxy,
  ) {}

  @Get()
  async me(@Headers('authorization') authorization: string) {
    return send(this.client, ME_PATTERNS.ME, { authorization });
  }

  /* รับเป็น DTO เต็มๆ (ไม่ใช้ Omit<>) เพื่อให้ ValidationPipe เห็น class จริงตอน runtime แล้ว validate ได้
     ฟิลด์ authorization ใน body เอง (ถ้ามี) จะถูกเขียนทับด้วยค่าจาก header เสมอ */
  @ApiBody({ type: ChangePasswordDto })
  @Post('/change-password')
  async changePassword(
    @Headers('authorization') authorization: string,
    @Body() body: ChangePasswordDto,
  ) {
    return send(this.client, ME_PATTERNS.CHANGE_PASSWORD, {
      ...body,
      authorization,
    });
  }

  @ApiBody({ type: UpdateProfileDto })
  @Post('/update-profile')
  async updateProfile(
    @Headers('authorization') authorization: string,
    @Body() body: UpdateProfileDto,
  ) {
    return send(this.client, ME_PATTERNS.UPDATE_PROFILE, {
      ...body,
      authorization,
    });
  }

  @ApiBody({ type: UpdateAddressDto })
  @Post('/update-address')
  async updateAddress(
    @Headers('authorization') authorization: string,
    @Body() body: UpdateAddressDto,
  ) {
    return send(this.client, ME_PATTERNS.UPDATE_ADDRESS, {
      ...body,
      authorization,
    });
  }
}
