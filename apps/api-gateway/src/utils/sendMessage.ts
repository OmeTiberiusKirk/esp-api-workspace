import { ApiResponse } from '@esp/shared';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import {
  catchError,
  firstValueFrom,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs';

export const send = <T>(
  client: ClientProxy,
  pattern: string,
  data: unknown = {},
  timeoutMs = 5_000,
) => {
  return firstValueFrom(
    client.send<ApiResponse<T>>(pattern, data).pipe(
      timeout(timeoutMs),
      catchError((err: unknown) => {
        console.log(err);
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new HttpException(
                'service timed out',
                HttpStatus.GATEWAY_TIMEOUT,
              ),
          );
        }

        if (err instanceof Error) {
          return throwError(
            () =>
              new HttpException(
                'service unavailable',
                HttpStatus.SERVICE_UNAVAILABLE,
              ),
          );
        }

        return throwError(() => new RpcException(err as object | string));
      }),
    ),
  );
};
