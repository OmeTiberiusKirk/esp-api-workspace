import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { createHmac, timingSafeEqual } from 'crypto';

/* ดึงออกมาจาก thaid.service.ts เดิม — ใช้ร่วมกันได้ทั้ง login ด้วย ThaID และ login ด้วย username/password
   เพราะ token payload/การ verify เหมือนกันทุกช่องทาง ต่างกันแค่ตอนสร้าง payload ก่อนเซ็น */
export type JwtPayload = Record<string, unknown>;

const INVALID_TOKEN_ERROR = {
  statusCode: HttpStatus.UNAUTHORIZED,
  message: 'Invalid or expired token.',
};

export const signJwt = (
  payload: JwtPayload,
  secret: string,
  expiresInSeconds: number,
): string => {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload, iat: now, exp: now + expiresInSeconds };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedBody = Buffer.from(JSON.stringify(body)).toString('base64url');
  const data = `${encodedHeader}.${encodedBody}`;
  const signature = createHmac('sha256', secret).update(data).digest('base64url');

  return `${data}.${signature}`;
};

export const verifyJwt = (token: string, secret: string): JwtPayload => {
  const parts = token.split('.');
  if (parts.length !== 3) throw new RpcException(INVALID_TOKEN_ERROR);

  const [encodedHeader, encodedBody, signature] = parts;
  if (!encodedHeader || !encodedBody || !signature) {
    throw new RpcException(INVALID_TOKEN_ERROR);
  }

  const data = `${encodedHeader}.${encodedBody}`;
  const expectedSignature = createHmac('sha256', secret)
    .update(data)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  const sigOk = sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf);
  if (!sigOk) throw new RpcException(INVALID_TOKEN_ERROR);

  let payload: JwtPayload;
  try {
    payload = JSON.parse(
      Buffer.from(encodedBody, 'base64url').toString('utf8'),
    ) as JwtPayload;
  } catch {
    throw new RpcException(INVALID_TOKEN_ERROR);
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = payload.exp;
  if (typeof exp !== 'number' || exp <= now) {
    throw new RpcException({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Session expired Please log in again.',
    });
  }

  return payload;
};
