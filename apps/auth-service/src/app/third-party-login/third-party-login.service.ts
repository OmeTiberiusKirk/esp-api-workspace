import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { issueAuthTokens } from '../../utils/token.util';
import { RECORD_ACTIVE } from '../../constants/registration.constants';

export interface ThirdPartyResolveInput<TProfile> {
  personId: string;
  profile: TProfile;
  loginChannel: string;
  loginChannelLabel: string;
}

export interface ThirdPartyResolveResult<TProfile> {
  isExistingUser: boolean;
  profile: TProfile;
  user?: {
    user_id: string;
    email: string | null;
    given_name: string | null;
    family_name: string | null;
  };
  access_token?: string;
  refresh_token?: string;
  login_channel?: string;
  login_channel_label?: string;
}

/* จุดร่วมของทุก third-party login ที่ผูกกับ person_id (natural person): เจอ user เดิม -> ออก token ให้
   ไม่เจอ -> ส่ง profile กลับไปให้ frontend เอาไป prefill ฟอร์มลงทะเบียนต่อ
   เฉพาะ DBD ID เท่านั้นที่ไม่ใช้ตัวนี้ เพราะผูกกับ legal_id คนละคอลัมน์ (ดู dbdid.service.ts) */
@Injectable()
export class ThirdPartyLoginService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve<TProfile>({
    personId,
    profile,
    loginChannel,
    loginChannelLabel,
  }: ThirdPartyResolveInput<TProfile>): Promise<ThirdPartyResolveResult<TProfile>> {
    const existingUser = await this.prisma.tb_user_register.findFirst({
      where: { person_id: personId, record_status: RECORD_ACTIVE },
    });

    if (!existingUser) return { isExistingUser: false, profile };

    const now = new Date();
    await this.prisma.tb_user_register.update({
      where: { user_id: existingUser.user_id },
      data: { user_last_login_dtm: now },
    });

    const tokens = issueAuthTokens({
      user_id: existingUser.user_id,
      person_id: existingUser.person_id,
      given_name: existingUser.first_name_th,
      family_name: existingUser.last_name_th,
      email: existingUser.register_email,
      login_channel: loginChannel,
      login_channel_label: loginChannelLabel,
    });

    return {
      isExistingUser: true,
      profile,
      user: {
        user_id: existingUser.user_id,
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
