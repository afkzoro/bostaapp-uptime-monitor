// src/monitoring/monitoring.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Check, CheckResult, UrlCheckStatus } from '@app/common';
import { CheckResultRepository } from './check-result.repository';
import { CheckRepository } from 'src/check/check.repository';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    private readonly checkResultRepository: CheckResultRepository,
    private readonly checkRepository: CheckRepository,
    @InjectQueue('monitoring') private monitoringQueue: Queue,
  ) {}

  async scheduleNextCheck(check: Check): Promise<void> {
    this.logger.debug(
      `Scheduling next check for ${check.name} in ${check.interval}ms`,
    );

    await this.monitoringQueue.add(
      'perform-check',
      { check },
      {
        delay: check.interval,
        jobId: `check:${check._id}:${Date.now()}`,
      },
    );
  }

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
      status: isUp ? UrlCheckStatus.ACTIVE : UrlCheckStatus.DOWN,
    };

    const result = await this.checkResultRepository.create(createCheckResult);
    await this.updateCheckStatus(check, result);
    return result;
  }

  async initiateMonitoring(check: Check): Promise<void> {
    this.logger.debug(`Initiating monitoring for check ${check.name}`);

    // Clean-up jobs
    const existingJob = await this.monitoringQueue.getJob(`check:${check._id}`);
    if (existingJob) {
      await existingJob.remove();
    }

    // Schedule immediate check
    await this.monitoringQueue.add(
      'perform-check',
      { check },
      { jobId: `check:${check._id}` },
    );

    // Add this to ensure continuous monitoring
    await this.scheduleNextCheck(check);
  }

  async pauseMonitoring(checkId: string): Promise<void> {
    const job = await this.monitoringQueue.getJob(`check:${checkId}`);
    if (job) {
      await job.remove();
    }

    await this.checkRepository.findOneAndUpdate(
      { _id: checkId },
      { status: UrlCheckStatus.PAUSED },
    );
  }

  async getCheckStats(checkId: string, period: number = 24): Promise<any> {
    const startDate = new Date(Date.now() - period * 60 * 60 * 1000);

    const results: CheckResult[] = await this.checkResultRepository
      .findRaw()
      .find({
        checkId,
        timestamp: { $gte: startDate },
      })
      .sort({ timestamp: 1 })
      .exec();

    return {
      total: results.length,
      uptime: results.filter((r) => r.isUp).length,
      downtime: results.filter((r) => !r.isUp).length,
      averageResponseTime:
        results.reduce((acc, curr) => acc + curr.responseTime, 0) /
        results.length,
      history: results.map((r) => ({
        timestamp: r.timestamp,
        status: r.isUp ? 'up' : 'down',
        responseTime: r.responseTime,
      })),
    };
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
          status: result.isUp ? UrlCheckStatus.ACTIVE : UrlCheckStatus.DOWN,
        },
      },
    );
  }
}
