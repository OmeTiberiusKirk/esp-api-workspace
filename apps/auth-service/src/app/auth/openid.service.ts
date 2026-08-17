import { createHash } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { OpenidLoginDto } from '@esp/shared';
import { ThirdPartyLoginService } from '../third-party-login/third-party-login.service';
import { OpenidProfile, OpenidTokenResponse } from './dtos/openid.dtos';
import {
  DGA_SECRET_HASH_ROUNDS,
  DGA_SECRET_SALT,
  INVALID_OPENID_TOKEN_ERROR,
  OPENID_SERVICE_UNAVAILABLE_ERROR,
} from '../../constants/openid.constants';

/* DGA ต้องการ client secret ที่ผ่าน md5 ซ้ำ 7 รอบ (เติม salt 'EGA' ต่อท้ายทุกรอบ) ก่อนเอาไปเข้ารหัส
   Basic auth — เป็น requirement เฉพาะของผู้ให้บริการนี้ ไม่ใช่ OAuth มาตรฐาน */
const encodeDgaClientSecret = (secret: string): string => {
  let digestHex = secret;
  for (let i = 0; i < DGA_SECRET_HASH_ROUNDS; i++) {
    digestHex = createHash('md5').update(digestHex + DGA_SECRET_SALT).digest('hex');
  }
  return digestHex;
};

const fetchProfile = async (accessToken: string): Promise<OpenidProfile> => {
  let response: Response;

  try {
    response = await fetch(process.env.OPENID_USERINFO_URL ?? '', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    throw new RpcException(OPENID_SERVICE_UNAVAILABLE_ERROR);
  }

  if (!response.ok) throw new RpcException(INVALID_OPENID_TOKEN_ERROR);

  const profile = (await response.json()) as OpenidProfile;
  if (!profile.citizen_id) throw new RpcException(INVALID_OPENID_TOKEN_ERROR);

  return profile;
};

@Injectable()
export class OpenidService {
  private readonly logger = new Logger(OpenidService.name);

  constructor(private readonly thirdPartyLoginService: ThirdPartyLoginService) {}

  async exchangeCode({ code }: OpenidLoginDto) {
    const encodedSecret = encodeDgaClientSecret(process.env.OPENID_CLIENT_SECRET ?? '');
    const basicAuth = Buffer.from(
      `${process.env.OPENID_CLIENT_ID}:${encodedSecret}`,
    ).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.OPENID_REDIRECT_URI ?? '',
    });

    let response: Response;

    try {
      response = await fetch(process.env.OPENID_TOKEN_URL ?? '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${basicAuth}`,
        },
        body: body.toString(),
      });
    } catch (err) {
      this.logger.error('OpenID token exchange request failed', err);
      throw new RpcException(OPENID_SERVICE_UNAVAILABLE_ERROR);
    }

    if (!response.ok) throw new RpcException(INVALID_OPENID_TOKEN_ERROR);

    const tokenResponse = (await response.json()) as OpenidTokenResponse;
    if (!tokenResponse.access_token) throw new RpcException(INVALID_OPENID_TOKEN_ERROR);

    const profile = await fetchProfile(tokenResponse.access_token);

    return this.thirdPartyLoginService.resolve({
      personId: profile.citizen_id,
      profile,
      loginChannel: 'openid',
      loginChannelLabel: 'ทางรัฐ',
    });
  }
}
