import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import {
  REGISTRATION_PATTERNS,
  CreateUserDto,
  VerifyOtpDto,
  VerifyUserDto,
} from '@esp/shared';
import { send } from '../../utils/sendMessage';
import { AUTH_SERVICE_CLIENT } from '../../constants/service-clients.constants';

@ApiTags('Registration')
@Controller('registration')
export class RegistrationController {
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
    // // ตรวจว่าข้อมูล personal ถูกต้องไหม
    // const personal = new CreatePersonalDto(body.personal);
    // // ตรวจว่าข้อมูล address ถูกต้องไหม
    // const address = new CreateAddressDto(body.address);
    // const pErrors = await validate(personal);
    // const aErrors = await validate(address);
    // const errors = pErrors.concat(aErrors);

    // // หากมี error ให้ reponse bad request
    // if (errors.length > 0) {
    //   const message = errors.flatMap((error) =>
    //     Object.values(error.constraints ?? {}),
    //   );

    //   throw new BadRequestException({
    //     statusCode: HttpStatus.BAD_REQUEST,
    //     message,
    //   });
    // }

    return send(this.client, REGISTRATION_PATTERNS.REGISTRATION, body);
  }

  @ApiBody({
    type: VerifyOtpDto,
  })
  @Post('/verify-otp')
  async verify(@Body() body: VerifyOtpDto) {
    return send(
      this.client,
      REGISTRATION_PATTERNS.REGISTRATION_VERIFY_OTP,
      body,
    );
  }

  @Post('/resend-otp')
  async resendOtp(@Body() body: { email: string }) {
    return send(
      this.client,
      REGISTRATION_PATTERNS.REGISTRATION_RESEND_OTP,
      body,
    );
  }

  @Get('/pending')
  async listPending() {
    return send(
      this.client,
      REGISTRATION_PATTERNS.REGISTRATION_PENDING_LIST,
      {},
    );
  }

  @ApiBody({
    type: VerifyUserDto,
  })
  @Post('/verify')
  async verifyUser(@Body() body: VerifyUserDto) {
    return send(
      this.client,
      REGISTRATION_PATTERNS.REGISTRATION_PENDING_VERIFY,
      body,
    );
  }
}
