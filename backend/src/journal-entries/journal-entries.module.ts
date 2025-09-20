import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalEntriesService } from './journal-entries.service';
import { JournalEntriesController } from './journal-entries.controller';
import { JournalEntry } from './journal-entry.entity';
import { StorageService } from '../storage/storage.service';
import { AnalysisModule } from '../analysis/analysis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([JournalEntry]),
    forwardRef(() => AnalysisModule),
  ],
  controllers: [JournalEntriesController],
  providers: [JournalEntriesService, StorageService],
  exports: [JournalEntriesService],
})
export class JournalEntriesModule {}