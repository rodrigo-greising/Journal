import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { AnalysisType } from '../analysis/analysis-result.entity';

export interface AnalysisJobData {
  journalEntryId: string;
  analysisType: AnalysisType;
  content: string;
  audioUrl?: string;
}

@Injectable()
export class QueueService implements OnModuleInit {
  private analysisQueue: Queue;
  private worker: Worker;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisConnection = {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6380),
      password: this.configService.get('REDIS_PASSWORD') || undefined,
    };

    this.analysisQueue = new Queue('analysis', {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });
  }

  async addAnalysisJob(jobData: AnalysisJobData): Promise<void> {
    await this.analysisQueue.add('process-analysis', jobData, {
      priority: jobData.analysisType === 'triggers' ? 10 : 5, // Prioritize trigger analysis
      delay: 1000, // Small delay to batch multiple analyses
    });
  }

  async addBulkAnalysisJobs(jobDataArray: AnalysisJobData[]): Promise<void> {
    const jobs = jobDataArray.map((jobData) => ({
      name: 'process-analysis',
      data: jobData,
      opts: {
        priority: jobData.analysisType === 'triggers' ? 10 : 5,
      },
    }));

    await this.analysisQueue.addBulk(jobs);
  }

  getQueue(): Queue {
    return this.analysisQueue;
  }

  async getJobCounts() {
    const waiting = await this.analysisQueue.getWaiting();
    const active = await this.analysisQueue.getActive();
    const completed = await this.analysisQueue.getCompleted();
    const failed = await this.analysisQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  async retryFailedJobs(): Promise<void> {
    const failedJobs = await this.analysisQueue.getFailed();
    for (const job of failedJobs) {
      await job.retry();
    }
  }

  async cleanQueue(): Promise<void> {
    await this.analysisQueue.clean(24 * 60 * 60 * 1000, 100); // Clean jobs older than 24 hours
  }
}
