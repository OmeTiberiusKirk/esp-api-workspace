import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, TimeoutError, throwError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { MASTER_SERVICE_CLIENT } from '../clients/service-clients.constants';
import { ApiResponse, MASTER_PATTERNS } from '@esp/shared';

@Injectable()
export class MasterService {
  constructor(
    @Inject(MASTER_SERVICE_CLIENT) private readonly client: ClientProxy,
  ) {}

  async getProvinces() {
    return firstValueFrom(
      this.client.send<ApiResponse>(MASTER_PATTERNS.PROVINCES, {}).pipe(
        timeout(5_000),
        catchError((err: unknown) => {
          if (err instanceof TimeoutError) {
            return throwError(
              () =>
                new HttpException(
                  'Master service timed out',
                  HttpStatus.GATEWAY_TIMEOUT,
                ),
            );
          }

          if (err instanceof Error) {
            return throwError(
              () =>
                new HttpException(
                  'Master service unavailable',
                  HttpStatus.SERVICE_UNAVAILABLE,
                ),
            );
          }

          return throwError(() => new RpcException(err as object | string));
        }),
      ),
    );
  }

  async getDistricts(provinceCode: string) {
    return firstValueFrom(
      this.client.send<unknown>('DISTRICTS', { provinceCode }).pipe(
        timeout(5_000),
        catchError((err: unknown) => {
          if (err instanceof TimeoutError) {
            return throwError(
              () =>
                new HttpException(
                  'Master service timed out',
                  HttpStatus.GATEWAY_TIMEOUT,
                ),
            );
          }

          if (err instanceof Error) {
            return throwError(
              () =>
                new HttpException(
                  'Master service unavailable',
                  HttpStatus.SERVICE_UNAVAILABLE,
                ),
            );
          }

          return throwError(() => new RpcException(err as object | string));
        }),
      ),
    );
  }

  async getSubDistricts(provinceCode: string, districtCode: string) {
    return firstValueFrom(
      this.client
        .send<unknown>('SUB_DISTRICTS', { provinceCode, districtCode })
        .pipe(
          timeout(5_000),
          catchError((err: unknown) => {
            if (err instanceof TimeoutError) {
              return throwError(
                () =>
                  new HttpException(
                    'Master service timed out',
                    HttpStatus.GATEWAY_TIMEOUT,
                  ),
              );
            }

            if (err instanceof Error) {
              return throwError(
                () =>
                  new HttpException(
                    'Master service unavailable',
                    HttpStatus.SERVICE_UNAVAILABLE,
                  ),
              );
            }

            return throwError(() => new RpcException(err as object | string));
          }),
        ),
    );
  }
}
