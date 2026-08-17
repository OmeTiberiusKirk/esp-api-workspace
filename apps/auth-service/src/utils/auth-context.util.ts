import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { verifyJwt } from './jwt.util';

export interface AccessTokenPayload {
  user_id: string;
  [key: string]: unknown;
}

const unauthorized = (message: string) =>
  new RpcException({ statusCode: HttpStatus.UNAUTHORIZED, message });

/* ทุก handler ที่ต้องล็อกอินก่อน (me/manage-user/register-data) รับ authorization มาเป็น field
   ธรรมดาใน payload แทน HTTP header เพราะเป็น TCP microservice ไม่มี guard/decorator ให้ใช้
   รวม logic แยก Bearer + verify JWT ไว้ที่เดียวกัน ไม่ต้องเขียนซ้ำทุกโมดูล */
export const requireAccessToken = (
  authorization: string | undefined,
): AccessTokenPayload => {
  if (!authorization?.startsWith('Bearer ')) {
    throw unauthorized('Authorization header is required.');
  }

  const token = authorization.slice('Bearer '.length).trim();
  const accessSecret = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret';
  const payload = verifyJwt(token, accessSecret);

  if (payload.token_type === 'refresh') {
    throw unauthorized('Access token required.');
  }

  if (typeof payload.user_id !== 'string') {
    throw unauthorized('Invalid token payload.');
  }

  return payload as AccessTokenPayload;
};
