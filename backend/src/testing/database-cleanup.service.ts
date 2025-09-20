import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from '../journal-entries/journal-entry.entity';
import { AnalysisResult } from '../analysis/analysis-result.entity';

@Injectable()
export class DatabaseCleanupService {
  constructor(
    @InjectRepository(JournalEntry)
    private journalEntriesRepository: Repository<JournalEntry>,
    @InjectRepository(AnalysisResult)
    private analysisResultsRepository: Repository<AnalysisResult>,
  ) {}

  async cleanupAll(): Promise<void> {
    // Clean child tables first due to foreign key constraints
    await this.cleanupAnalysisResults();
    await this.cleanupJournalEntries();
  }

  async cleanupJournalEntries(): Promise<void> {
    // Use query to delete all records
    await this.journalEntriesRepository.query('DELETE FROM journal_entries');
  }

  async cleanupAnalysisResults(): Promise<void> {
    // Use query to delete all records
    await this.analysisResultsRepository.query('DELETE FROM analysis_results');
  }

  async cleanupTestData(): Promise<void> {
    // Clean up any test-specific data patterns
    await this.analysisResultsRepository.query('DELETE FROM analysis_results');
    await this.journalEntriesRepository.query('DELETE FROM journal_entries');
  }

  async resetAutoIncrement(): Promise<void> {
    // Reset sequences for clean test state (PostgreSQL specific)
    // Use CASCADE to handle foreign key constraints
    await this.journalEntriesRepository.query(
      'TRUNCATE TABLE journal_entries, analysis_results RESTART IDENTITY CASCADE',
    );
  }
}
