import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { JournalEntry } from '../journal-entries/journal-entry.entity';
import { AnalysisResult } from '../analysis/analysis-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JournalEntry, AnalysisResult])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
