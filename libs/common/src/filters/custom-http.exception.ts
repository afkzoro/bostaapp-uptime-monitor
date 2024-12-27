import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(message: string, statusCode: HttpStatus) {
    super(
      {
        statusCode,
        message,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}
