import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import {
  AUTH_PATTERNS,
  CreateAddressDto,
  CreatePersonalDto,
  CreateUserDto,
  VerifyOtpDto,
} from '@esp/shared';
import { send } from '../../utils/sendMessage';
import { AUTH_SERVICE_CLIENT } from '../../constants/service-clients.constants';
import { validate } from 'class-validator';

@ApiTags('Reg Service')
@Controller('reg001')
export class Reg001 {
  constructor(
    @Inject(AUTH_SERVICE_CLIENT) private readonly client: ClientProxy,
  ) {}

  @ApiBody({
    type: CreateUserDto,
  })
  @Post()
  /**
   * Create by Ome
   * Create Date 17/8/2569
   * ลงทะเบียน
   *
   * @param {CreateUserDto} body - payload จาก form เช่น ชื่อ, นามสกุล
   * @returns {void} ไม่มี
   */
  async register(@Body() body: CreateUserDto) {
    // ตรวจว่าข้อมูล personal ถูกต้องไหม
    const personal = new CreatePersonalDto(body.personal);
    // ตรวจว่าข้อมูล address ถูกต้องไหม
    const address = new CreateAddressDto(body.address);
    const pErrors = await validate(personal);
    const aErrors = await validate(address);
    const errors = pErrors.concat(aErrors);

    // หากมี error ให้ reponse bad request
    if (errors.length > 0) {
      const message = errors.flatMap((error) =>
        Object.values(error.constraints ?? {}),
      );

      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message,
      });
    }

    return send(this.client, AUTH_PATTERNS.REG001, body);
  }

  @ApiBody({
    type: VerifyOtpDto,
  })
  @Post('/verify-otp')
  async verify(@Body() body: VerifyOtpDto) {
    return send(this.client, AUTH_PATTERNS.REG001_VERIFY_OTP, body);
  }
}
