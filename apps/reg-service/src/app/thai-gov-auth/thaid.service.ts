import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { ThaidLoginDto } from '@esp/shared';
import { signJwt } from '../../utils/jwt.util';
import {
  ThaidLoginResult,
  ThaidProfile,
  ThaidTokenResponse,
} from './dtos/thaid.dtos';
import {
  INVALID_TOKEN_ERROR,
  RECORD_ACTIVE,
} from '../../constants/thaid.constants';

/* id_token เป็น JWT ที่ DOPA ส่งกลับมาตรงจาก server-to-server call ของเราเอง (ไม่ได้ผ่าน browser)
   จึงแค่ decode payload อ่านค่า claim โดยไม่ verify signature — ถ้าจะ harden เพิ่มต้องขอ JWKS endpoint จาก DOPA มา verify */
const decodeIdTokenPayload = (idToken: string): ThaidProfile => {
  const payloadSegment = idToken.split('.')[1];
  if (!payloadSegment) throw new RpcException(INVALID_TOKEN_ERROR);

  try {
    return JSON.parse(
      Buffer.from(payloadSegment, 'base64url').toString('utf8'),
    ) as ThaidProfile;
  } catch {
    throw new RpcException(INVALID_TOKEN_ERROR);
  }
};

/* char('0'/'1') -> number(0/1) ให้ตรงกับ contract เดิมที่ frontend เทียบด้วย === 1 */
const flagToNumber = (flag: string | null): number | null =>
  flag === null ? null : Number(flag);

@Injectable()
export class ThaidService {
  private readonly logger = new Logger(ThaidService.name);

  constructor(private readonly prisma: PrismaService) {}

  async exchangeCode({ code }: ThaidLoginDto): Promise<ThaidLoginResult> {
    const basicAuth = Buffer.from(
      `${process.env.THAID_CLIENT_ID}:${process.env.THAID_CLIENT_SECRET}`,
    ).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.THAID_REDIRECT_URI ?? '',
    });

    let response: Response;

    try {
      response = await fetch(process.env.THAID_TOKEN_URL ?? '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
        body: body.toString(),
      });
    } catch (err) {
      this.logger.error('ThaID token exchange request failed', err);
      throw new RpcException({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'ThaID service unavailable.',
      });
    }

    const rawBody = await response.text();

    if (!response.ok) {
      throw new RpcException(INVALID_TOKEN_ERROR);
    }

    const tokenResponse = JSON.parse(rawBody) as ThaidTokenResponse;
    if (!tokenResponse.id_token) throw new RpcException(INVALID_TOKEN_ERROR);

    const profile = decodeIdTokenPayload(tokenResponse.id_token);
    this.logger.log(`Decoded ThaID profile: ${JSON.stringify(profile)}`);

    const existingUser = await this.prisma.tb_user_register.findFirst({
      where: { person_id: profile.pid, record_status: RECORD_ACTIVE },
    });

    if (!existingUser) return { isExistingUser: false, profile };

    const now = new Date();
    await this.prisma.tb_user_register.update({
      where: { user_id: existingUser.user_id },
      data: { user_last_login_dtm: now },
    });

    const accessSecret = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret';
    const refreshSecret =
      process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';
    const accessExp = Number(process.env.JWT_ACCESS_EXPIRES_IN_SEC ?? 900);
    const refreshExp = Number(process.env.JWT_REFRESH_EXPIRES_IN_SEC ?? 604800);

    const loginChannel = 'thaid';
    const loginChannelLabel = 'ThaiD';

    const tokenPayload = {
      user_id: existingUser.user_id,
      person_id: existingUser.person_id,
      given_name: existingUser.first_name_th,
      family_name: existingUser.last_name_th,
      email: existingUser.register_email,
      login_channel: loginChannel,
      login_channel_label: loginChannelLabel,
    };

    const accessToken = signJwt(tokenPayload, accessSecret, accessExp);
    const refreshToken = signJwt(
      { ...tokenPayload, token_type: 'refresh' },
      refreshSecret,
      refreshExp,
    );

    return {
      isExistingUser: true,
      profile,
      user: {
        user_id: existingUser.user_id,
        email: existingUser.register_email,
        is_email_verified: flagToNumber(existingUser.email_verify_flag),
        is_verify: flagToNumber(existingUser.user_verify_flag),
        user_status: null,
        given_name: existingUser.first_name_th,
        family_name: existingUser.last_name_th,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      login_channel: loginChannel,
      login_channel_label: loginChannelLabel,
    };
  }
}
