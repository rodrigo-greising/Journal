import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisResult } from './analysis-result.entity';
import { JournalEntry } from '../journal-entries/journal-entry.entity';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { AnalysisWorkerService } from './analysis-worker.service';
import { OpenAIService } from '../openai/openai.service';
import { QueueService } from '../queue/queue.service';
import { LangfuseModule } from '../langfuse/langfuse.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalysisResult, JournalEntry]),
    LangfuseModule,
  ],
  controllers: [AnalysisController],
  providers: [
    AnalysisService,
    AnalysisWorkerService,
    OpenAIService,
    QueueService,
  ],
  exports: [AnalysisService, QueueService],
})
export class AnalysisModule {}