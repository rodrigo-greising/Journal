import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from '../journal-entries/journal-entry.entity';
import { AnalysisResult } from '../analysis/analysis-result.entity';
import {
  TEST_PROFILES,
  TestProfile,
  TestJournalEntry,
} from './test-data.profiles';
import { DatabaseCleanupService } from './database-cleanup.service';

@Injectable()
export class TestDataSeederService {
  constructor(
    @InjectRepository(JournalEntry)
    private journalEntriesRepository: Repository<JournalEntry>,
    @InjectRepository(AnalysisResult)
    private analysisResultsRepository: Repository<AnalysisResult>,
    private databaseCleanupService: DatabaseCleanupService,
  ) {}

  async seedTestProfile(
    profileName: string,
  ): Promise<{ entriesCreated: number; analysisCreated: number }> {
    const profile = TEST_PROFILES.find((p) => p.name === profileName);
    if (!profile) {
      throw new Error(`Test profile '${profileName}' not found`);
    }

    const results = await this.seedProfile(profile);
    return results;
  }

  async seedAllTestProfiles(): Promise<{
    [profileName: string]: { entriesCreated: number; analysisCreated: number };
  }> {
    const results: {
      [profileName: string]: {
        entriesCreated: number;
        analysisCreated: number;
      };
    } = {};

    for (const profile of TEST_PROFILES) {
      results[profile.name] = await this.seedProfile(profile);
    }

    return results;
  }

  async cleanAndSeedProfile(
    profileName: string,
  ): Promise<{ entriesCreated: number; analysisCreated: number }> {
    await this.databaseCleanupService.cleanupAll();
    return await this.seedTestProfile(profileName);
  }

  async cleanAndSeedAllProfiles(): Promise<{
    [profileName: string]: { entriesCreated: number; analysisCreated: number };
  }> {
    await this.databaseCleanupService.cleanupAll();
    return await this.seedAllTestProfiles();
  }

  private async seedProfile(
    profile: TestProfile,
  ): Promise<{ entriesCreated: number; analysisCreated: number }> {
    let entriesCreated = 0;
    let analysisCreated = 0;

    for (const testEntry of profile.entries) {
      const journalEntry = await this.createJournalEntry(testEntry);
      entriesCreated++;

      // Create expected analysis results
      if (testEntry.expectedAnalysis) {
        const analysisCount = await this.createAnalysisResults(
          journalEntry.id,
          testEntry.expectedAnalysis,
        );
        analysisCreated += analysisCount;
      }
    }

    return { entriesCreated, analysisCreated };
  }

  private async createJournalEntry(
    testEntry: TestJournalEntry,
  ): Promise<JournalEntry> {
    const entryDate = new Date();
    entryDate.setDate(entryDate.getDate() + testEntry.dateOffset);

    const journalEntry = this.journalEntriesRepository.create({
      content: testEntry.content,
      type: testEntry.type,
      isDraft: false,
      isDeleted: false,
      createdAt: entryDate,
      updatedAt: entryDate,
    });

    return await this.journalEntriesRepository.save(journalEntry);
  }

  private async createAnalysisResults(
    journalEntryId: string,
    expectedAnalysis: any,
  ): Promise<number> {
    let count = 0;

    // Create mood analysis
    if (expectedAnalysis.mood) {
      const moodResult = this.analysisResultsRepository.create({
        journalEntryId,
        analysisType: 'mood',
        status: 'completed',
        result: expectedAnalysis.mood,
        retryCount: 0,
      });
      await this.analysisResultsRepository.save(moodResult);
      count++;
    }

    // Create energy analysis
    if (expectedAnalysis.energy) {
      const energyResult = this.analysisResultsRepository.create({
        journalEntryId,
        analysisType: 'energy',
        status: 'completed',
        result: expectedAnalysis.energy,
        retryCount: 0,
      });
      await this.analysisResultsRepository.save(energyResult);
      count++;
    }

    // Create nutrition analysis
    if (expectedAnalysis.nutrition) {
      const nutritionResult = this.analysisResultsRepository.create({
        journalEntryId,
        analysisType: 'nutrition',
        status: 'completed',
        result: expectedAnalysis.nutrition,
        retryCount: 0,
      });
      await this.analysisResultsRepository.save(nutritionResult);
      count++;
    }

    // Create triggers analysis
    if (expectedAnalysis.triggers) {
      const triggersResult = this.analysisResultsRepository.create({
        journalEntryId,
        analysisType: 'triggers',
        status: 'completed',
        result: expectedAnalysis.triggers,
        retryCount: 0,
      });
      await this.analysisResultsRepository.save(triggersResult);
      count++;
    }

    return count;
  }

  getAvailableProfiles(): string[] {
    return TEST_PROFILES.map((profile) => profile.name);
  }

  getProfileDescription(profileName: string): string | null {
    const profile = TEST_PROFILES.find((p) => p.name === profileName);
    return profile ? profile.description : null;
  }
}
