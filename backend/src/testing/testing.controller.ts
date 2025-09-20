import { Controller, Post, Delete, Param, Get } from '@nestjs/common';
import { DatabaseCleanupService } from './database-cleanup.service';
import { TestDataSeederService } from './test-data-seeder.service';

@Controller('testing')
export class TestingController {
  constructor(
    private readonly databaseCleanupService: DatabaseCleanupService,
    private readonly testDataSeederService: TestDataSeederService,
  ) {}

  @Delete('cleanup/all')
  async cleanupAll() {
    await this.databaseCleanupService.cleanupAll();
    return { message: 'All test data cleaned up' };
  }

  @Delete('cleanup/entries')
  async cleanupEntries() {
    await this.databaseCleanupService.cleanupJournalEntries();
    return { message: 'Journal entries cleaned up' };
  }

  @Delete('cleanup/analysis')
  async cleanupAnalysis() {
    await this.databaseCleanupService.cleanupAnalysisResults();
    return { message: 'Analysis results cleaned up' };
  }

  @Post('cleanup/reset')
  async resetDatabase() {
    await this.databaseCleanupService.resetAutoIncrement();
    return { message: 'Database reset with clean state' };
  }

  @Get('profiles')
  getAvailableProfiles() {
    const profiles = this.testDataSeederService.getAvailableProfiles();
    return {
      profiles: profiles.map((name) => ({
        name,
        description: this.testDataSeederService.getProfileDescription(name),
      })),
    };
  }

  @Post('seed/profile/:profileName')
  async seedProfile(@Param('profileName') profileName: string) {
    const result =
      await this.testDataSeederService.seedTestProfile(profileName);
    return {
      message: `Profile '${profileName}' seeded successfully`,
      ...result,
    };
  }

  @Post('seed/all')
  async seedAllProfiles() {
    const results = await this.testDataSeederService.seedAllTestProfiles();
    return {
      message: 'All profiles seeded successfully',
      results,
    };
  }

  @Post('seed/clean-and-seed/:profileName')
  async cleanAndSeedProfile(@Param('profileName') profileName: string) {
    const result =
      await this.testDataSeederService.cleanAndSeedProfile(profileName);
    return {
      message: `Database cleaned and profile '${profileName}' seeded successfully`,
      ...result,
    };
  }

  @Post('seed/clean-and-seed-all')
  async cleanAndSeedAllProfiles() {
    const results = await this.testDataSeederService.cleanAndSeedAllProfiles();
    return {
      message: 'Database cleaned and all profiles seeded successfully',
      results,
    };
  }
}
