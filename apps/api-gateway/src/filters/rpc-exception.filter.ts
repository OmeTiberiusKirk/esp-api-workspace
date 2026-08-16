import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

interface RpcErrorPayload {
  statusCode?: number;
  message?: string | string[];
}

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter<RpcException> {
  private readonly logger = new Logger(RpcExceptionFilter.name);

  catch(exception: RpcException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const error = exception.getError();
    const message =
      typeof error === 'object'
        ? ((error as RpcErrorPayload)?.message ?? 'An unknown error occurred.')
        : error;
    const statusCode = (error as RpcErrorPayload)?.statusCode;
    let request: HttpException;

    switch (statusCode) {
      case 400:
        request = new BadRequestException(message);
        break;
      case 401:
        request = new UnauthorizedException(message);
        break;
      case 403:
        request = new ForbiddenException(message);
        break;
      case 404:
        request = new NotFoundException(message);
        break;
      case 409:
        request = new ConflictException(message);
        break;
      default:
        this.logger.warn(
          `Unmapped RpcException statusCode: ${JSON.stringify(statusCode)} — falling back to 500`,
        );
        request = new InternalServerErrorException(message);
        break;
    }

    response.status(request.getStatus()).json(request.getResponse());
  }
}
