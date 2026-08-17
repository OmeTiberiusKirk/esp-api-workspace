import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/* Prisma คืนค่า BigInt สำหรับคอลัมน์ bigserial ซึ่ง JSON.stringify (ตอน serialize ผ่าน TCP transport)
   throw ทันทีถ้าเจอ bigint ดิบๆ ใน payload — ต้องแปลงเป็น string ก่อนเสมอ */
const serialize = (value: unknown): unknown => {
  if (typeof value === 'bigint') return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, serialize(val)]),
    );
  }
  return value;
};

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => serialize(data)));
  }
}
