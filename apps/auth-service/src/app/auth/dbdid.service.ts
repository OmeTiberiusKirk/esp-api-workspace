import { createHash } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { DbdidLoginDto } from '@esp/shared';
import { PrismaService } from '../prisma/prisma.service';
import { issueAuthTokens } from '../../utils/token.util';
import {
  DbdidLoginResult,
  DbdidProfile,
  DbdidTokenResponse,
} from './dtos/dbdid.dtos';
import {
  DBDID_SECRET_HASH_ROUNDS,
  DBDID_SECRET_SALT,
  DBDID_SERVICE_UNAVAILABLE_ERROR,
  INVALID_DBDID_TOKEN_ERROR,
  RECORD_ACTIVE,
  USER_TYPE_LEGAL,
} from '../../constants/dbdid.constants';

const encodeDbdidClientSecret = (secret: string): string => {
  let digestHex = secret;
  for (let i = 0; i < DBDID_SECRET_HASH_ROUNDS; i++) {
    digestHex = createHash('md5')
      .update(digestHex + DBDID_SECRET_SALT)
      .digest('hex');
  }
  return digestHex;
};

/* DBD ID เก็บ profile ไว้ที่ userinfo endpoint (ไม่ได้แนบมาใน access token เหมือน ThaID id_token)
   จึงต้องมี HTTP call เพิ่มอีกรอบหลัง exchange code สำเร็จ */
const fetchProfile = async (accessToken: string): Promise<DbdidProfile> => {
  let response: Response;

  try {
    response = await fetch(process.env.DBDID_USERINFO_URL ?? '', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    throw new RpcException(DBDID_SERVICE_UNAVAILABLE_ERROR);
  }

  if (!response.ok) throw new RpcException(INVALID_DBDID_TOKEN_ERROR);

  const profile = (await response.json()) as DbdidProfile;
  if (!profile.juristic_id) throw new RpcException(INVALID_DBDID_TOKEN_ERROR);

  return profile;
};

@Injectable()
export class DbdidService {
  private readonly logger = new Logger(DbdidService.name);

  constructor(private readonly prisma: PrismaService) {}

  async exchangeCode({ code }: DbdidLoginDto): Promise<DbdidLoginResult> {
    const encodedSecret = encodeDbdidClientSecret(
      process.env.DBDID_CLIENT_SECRET ?? '',
    );
    const basicAuth = Buffer.from(
      `${process.env.DBDID_CLIENT_ID}:${encodedSecret}`,
    ).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DBDID_REDIRECT_URI ?? '',
    });

    let response: Response;

    try {
      response = await fetch(process.env.DBDID_TOKEN_URL ?? '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
        body: body.toString(),
      });
    } catch (err) {
      this.logger.error('DBD ID token exchange request failed', err);
      throw new RpcException(DBDID_SERVICE_UNAVAILABLE_ERROR);
    }

    if (!response.ok) throw new RpcException(INVALID_DBDID_TOKEN_ERROR);

    const tokenResponse = (await response.json()) as DbdidTokenResponse;
    if (!tokenResponse.access_token)
      throw new RpcException(INVALID_DBDID_TOKEN_ERROR);

    const profile = await fetchProfile(tokenResponse.access_token);
    console.log(profile);

    return this.resolveLogin(profile);
  }

  private async resolveLogin(profile: DbdidProfile): Promise<DbdidLoginResult> {
    const existingUser = await this.prisma.tb_user_register.findFirst({
      where: { legal_id: profile.juristic_id, record_status: RECORD_ACTIVE },
    });

    if (!existingUser) return { isExistingUser: false, profile };

    const now = new Date();
    await this.prisma.tb_user_register.update({
      where: { user_id: existingUser.user_id },
      data: { user_last_login_dtm: now },
    });

    const loginChannel = 'dbdid';
    const loginChannelLabel = 'DBD ID';

    const tokens = issueAuthTokens({
      user_id: existingUser.user_id,
      person_id: existingUser.person_id,
      legal_id: existingUser.legal_id,
      legal_name: existingUser.legal_name,
      given_name: existingUser.first_name_th,
      family_name: existingUser.last_name_th,
      email: existingUser.register_email,
      login_channel: loginChannel,
      login_channel_label: loginChannelLabel,
      type: USER_TYPE_LEGAL,
    });

    return {
      isExistingUser: true,
      profile,
      user: {
        user_id: existingUser.user_id,
        legal_id: existingUser.legal_id,
        legal_name: existingUser.legal_name,
        email: existingUser.register_email,
        given_name: existingUser.first_name_th,
        family_name: existingUser.last_name_th,
      },
      ...tokens,
      login_channel: loginChannel,
      login_channel_label: loginChannelLabel,
    };
  }
}
