import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalEntry } from '../journal-entries/journal-entry.entity';
import { AnalysisResult } from '../analysis/analysis-result.entity';
import { DatabaseCleanupService } from './database-cleanup.service';
import { TestDataSeederService } from './test-data-seeder.service';
import { LLMEvaluationService } from './llm-evaluation.service';
import { ConsistencyTestingService } from './consistency-testing.service';
import { TestingController } from './testing.controller';
import { LLMEvaluationController } from './llm-evaluation.controller';
import { ConsistencyTestingController } from './consistency-testing.controller';
import { OpenAIModule } from '../openai/openai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JournalEntry, AnalysisResult]),
    OpenAIModule,
  ],
  providers: [
    DatabaseCleanupService,
    TestDataSeederService,
    LLMEvaluationService,
    ConsistencyTestingService,
  ],
  controllers: [
    TestingController,
    LLMEvaluationController,
    ConsistencyTestingController,
  ],
  exports: [
    DatabaseCleanupService,
    TestDataSeederService,
    LLMEvaluationService,
    ConsistencyTestingService,
  ],
})
export class TestingModule {}
