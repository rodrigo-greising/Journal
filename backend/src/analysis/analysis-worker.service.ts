import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { AnalysisService } from './analysis.service';
import { AnalysisJobData } from '../queue/queue.service';

@Injectable()
export class AnalysisWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AnalysisWorkerService.name);
  private worker: Worker;

  constructor(
    private configService: ConfigService,
    private analysisService: AnalysisService,
  ) {}

  onModuleInit() {
    const redisConnection = {
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6380),
      password: this.configService.get('REDIS_PASSWORD') || undefined,
    };

    this.worker = new Worker(
      'analysis',
      async (job: Job<AnalysisJobData>) => {
        this.logger.log(`Processing analysis job ${job.id} for entry ${job.data.journalEntryId}`);

        try {
          await this.analysisService.processJournalEntry(
            job.data.journalEntryId,
            job.data.analysisType
          );

          this.logger.log(`Completed analysis job ${job.id}`);
          return { success: true };
        } catch (error) {
          this.logger.error(`Failed analysis job ${job.id}:`, error);
          throw error;
        }
      },
      {
        connection: redisConnection,
        concurrency: 5,
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      }
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed:`, err);
    });

    this.worker.on('error', (err) => {
      this.logger.error('Worker error:', err);
    });

    this.logger.log('Analysis worker started');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.logger.log('Analysis worker stopped');
    }
  }
}