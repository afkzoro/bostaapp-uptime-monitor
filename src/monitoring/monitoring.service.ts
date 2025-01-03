// src/monitoring/monitoring.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Check, CheckResult } from '@app/common';
import { CheckResultRepository } from './check-result.repository';
import { CheckRepository } from 'src/check/check.repository';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    private readonly checkResultRepository: CheckResultRepository,
    private readonly checkRepository: CheckRepository,
  ) {}

  async performCheck(check: Check): Promise<CheckResult> {
    const startTime = Date.now();
    let isUp = false;
    let error = null;
    let statusCode = null;

    try {
      const response = await axios({
        method: 'GET',
        url: this.buildUrl(check),
        timeout: check.timeout,
        headers: this.buildHeaders(check),
        validateStatus: null,
      });

      statusCode = response.status;
      isUp = this.validateResponse(check, response);
    } catch (err) {
      error = err.message;
      isUp = false;
    }

    const responseTime = Date.now() - startTime;

    const createCheckResult: Partial<CheckResult> = {
      checkId: check._id.toString(),
      timestamp: new Date(),
      isUp,
      responseTime,
      statusCode,
      error,
    };

    const result = await this.checkResultRepository.create(createCheckResult);
    await this.updateCheckStatus(check, result);
    return result;
  }

  private buildUrl(check: Check): string {
    let url = `${check.protocol.toLowerCase()}://${check.url}`;
    if (check.path) {
      url += check.path;
    }
    if (check.port) {
      url += `:${check.port}`;
    }
    return url;
  }

  private buildHeaders(check: Check): Record<string, string> {
    const headers: Record<string, string> = {};

    if (check.httpHeaders) {
      check.httpHeaders.forEach((header) => {
        headers[header.key] = header.value;
      });
    }

    if (check.authentication) {
      const auth = Buffer.from(
        `${check.authentication.username}:${check.authentication.password}`,
      ).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    return headers;
  }

  private validateResponse(check: Check, response: any): boolean {
    if (check.assert?.statusCode) {
      return response.status === check.assert.statusCode;
    }
    return response.status >= 200 && response.status < 300;
  }

  private async updateCheckStatus(
    check: Check,
    result: CheckResult,
  ): Promise<void> {
    await this.checkRepository.findOneAndUpdate(
      { _id: check._id },
      {
        $set: {
          lastCheck: result.timestamp,
          status: result.isUp ? 'active' : 'down',
        },
      },
    );
  }
}
