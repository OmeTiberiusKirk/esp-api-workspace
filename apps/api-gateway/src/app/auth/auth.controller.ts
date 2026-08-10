import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import {
  AUTH_PATTERNS,
  CreateAddressDto,
  CreatePersonalDto,
  CreateUserDto,
} from '@esp/shared';
import { send } from '../../assets/utils/sendMessage';
import { AUTH_SERVICE_CLIENT } from '../../assets/constants/service-clients.constants';
import { validate } from 'class-validator';

@ApiTags('Auth Service')
@Controller('auth/reg001')
export class AuthReg001 {
  constructor(
    @Inject(AUTH_SERVICE_CLIENT) private readonly client: ClientProxy,
  ) {}

  @ApiBody({
    type: CreateUserDto,
  })
  @Post()
  async register(@Body() body: CreateUserDto) {
    const personal = new CreatePersonalDto(body.personal);
    const address = new CreateAddressDto(body.address);
    const pErrors = await validate(personal);
    const aErrors = await validate(address);
    const errors = pErrors.concat(aErrors);

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

  @Post('send-otp')
  async send() {
    return 'send otp';
  }

  @Post('verify-otp')
  verifyOtp() {
    return 'verify otp';
  }
}
