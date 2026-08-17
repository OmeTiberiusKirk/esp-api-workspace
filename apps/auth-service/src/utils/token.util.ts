import { signJwt } from './jwt.util';

export interface IssuedTokens {
  access_token: string;
  refresh_token: string;
}

/* รวม logic เซ็น access/refresh JWT คู่กัน (payload เดียวกัน ต่างแค่ secret/อายุ/token_type)
   ใช้ร่วมกันได้ทุกช่องทาง login (otp verify, thaid, dbdid, openid, username/password) */
export const issueAuthTokens = (payload: Record<string, unknown>): IssuedTokens => {
  const accessSecret = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret';
  const refreshSecret = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';
  const accessExp = Number(process.env.JWT_ACCESS_EXPIRES_IN_SEC ?? 900);
  const refreshExp = Number(process.env.JWT_REFRESH_EXPIRES_IN_SEC ?? 604_800);

  return {
    access_token: signJwt(payload, accessSecret, accessExp),
    refresh_token: signJwt(
      { ...payload, token_type: 'refresh' },
      refreshSecret,
      refreshExp,
    ),
  };
};
