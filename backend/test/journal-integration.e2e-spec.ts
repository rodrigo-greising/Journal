import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TestingModule as TestingModuleImport } from '../src/testing/testing.module';
import { DatabaseCleanupService } from '../src/testing/database-cleanup.service';
import { TestDataSeederService } from '../src/testing/test-data-seeder.service';

describe('Journal Integration (e2e)', () => {
  let app: INestApplication<App>;
  let cleanupService: DatabaseCleanupService;
  let seederService: TestDataSeederService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestingModuleImport],
    }).compile();

    app = moduleFixture.createNestApplication();
    cleanupService = moduleFixture.get<DatabaseCleanupService>(
      DatabaseCleanupService,
    );
    seederService = moduleFixture.get<TestDataSeederService>(
      TestDataSeederService,
    );

    await app.init();
  });

  beforeEach(async () => {
    // Clean database before each test
    await cleanupService.cleanupAll();
  });

  afterAll(async () => {
    await cleanupService.cleanupAll();
    await app.close();
  });

  describe('Addiction Recovery Profile Integration', () => {
    beforeEach(async () => {
      await seederService.seedTestProfile('addiction-recovery-profile');
    });

    it('should have seeded addiction recovery profile correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/journal-entries')
        .expect(200);

      expect(response.body).toHaveLength(5);
      expect(response.body[0].content).toContain('Month milestone');
      expect(response.body[4].content).toContain('Day 1 of sobriety');
    });

    it('should provide complete analysis results for addiction recovery', async () => {
      const entriesResponse = await request(app.getHttpServer())
        .get('/journal-entries')
        .expect(200);

      const firstEntry = entriesResponse.body[0];

      const analysisResponse = await request(app.getHttpServer())
        .get(`/analysis/entry/${firstEntry.id}`)
        .expect(200);

      expect(analysisResponse.body.length).toBeGreaterThan(0);

      const moodAnalysis = analysisResponse.body.find(
        (a) => a.analysisType === 'mood',
      );
      const triggerAnalysis = analysisResponse.body.find(
        (a) => a.analysisType === 'triggers',
      );

      expect(moodAnalysis).toBeDefined();
      expect(moodAnalysis.status).toBe('completed');
      expect(moodAnalysis.result.moodScale).toBeDefined();

      if (triggerAnalysis) {
        expect(triggerAnalysis.status).toBe('completed');
        expect(triggerAnalysis.result.stressors).toBeDefined();
      }
    });

    it('should show mood progression over time in dashboard', async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 35);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app.getHttpServer())
        .get(
          `/dashboard/data?startDate=${thirtyDaysAgo.toISOString()}&endDate=${tomorrow.toISOString()}`,
        )
        .expect(200);

      expect(response.body.trends).toBeDefined();
      expect(response.body.trends.mood).toBeDefined();
      expect(response.body.trends.mood.length).toBeGreaterThan(0);

      // Check that mood trends show progression (should generally improve)
      const moodData = response.body.trends.mood;
      expect(moodData[0].value).toBeLessThan(
        moodData[moodData.length - 1].value,
      );
    });

    it('should identify common triggers in word cloud', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/data')
        .expect(200);

      expect(response.body.wordCloud).toBeDefined();
      expect(response.body.wordCloud.length).toBeGreaterThan(0);

      const triggerWords = response.body.wordCloud.filter(
        (word) =>
          (word.category === 'triggers' && word.text.includes('alcohol')) ||
          word.text.includes('stress'),
      );

      expect(triggerWords.length).toBeGreaterThan(0);
    });

    it('should provide meaningful summary statistics', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/data')
        .expect(200);

      expect(response.body.summary).toBeDefined();
      expect(response.body.summary.totalEntries).toBe(5);
      expect(response.body.summary.avgMood).toBeGreaterThan(0);
      expect(response.body.summary.commonTriggers).toBeDefined();
      expect(response.body.summary.positiveTrends).toBeDefined();
    });
  });

  describe('Nutrition Tracking Profile Integration', () => {
    beforeEach(async () => {
      await seederService.seedTestProfile('nutrition-tracking-profile');
    });

    it('should track nutrition patterns correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/analysis')
        .expect(200);

      const nutritionAnalyses = response.body.filter(
        (a) => a.analysisType === 'nutrition',
      );
      expect(nutritionAnalyses.length).toBeGreaterThan(0);

      const hasCalorieData = nutritionAnalyses.some(
        (a) => a.result && a.result.calorieEstimate !== undefined,
      );
      expect(hasCalorieData).toBe(true);
    });

    it('should show energy correlation with nutrition', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/data')
        .expect(200);

      expect(response.body.trends.energy).toBeDefined();
      expect(response.body.trends.energy.length).toBeGreaterThan(0);

      // Energy should vary based on nutrition patterns
      const energyData = response.body.trends.energy;
      const energyValues = energyData.map((d) => d.value);
      expect(
        Math.max(...energyValues) - Math.min(...energyValues),
      ).toBeGreaterThan(2);
    });
  });

  describe('Mental Health Tracking Profile Integration', () => {
    beforeEach(async () => {
      await seederService.seedTestProfile('mental-health-tracking-profile');
    });

    it('should track anxiety and mental health patterns', async () => {
      const entriesResponse = await request(app.getHttpServer())
        .get('/journal-entries')
        .expect(200);

      const analysisPromises = entriesResponse.body.map((entry) =>
        request(app.getHttpServer())
          .get(`/analysis/entry/${entry.id}`)
          .expect(200),
      );

      const analysisResponses = await Promise.all(analysisPromises);

      const allAnalyses = analysisResponses.flatMap((res) => res.body);
      const moodAnalyses = allAnalyses.filter((a) => a.analysisType === 'mood');

      expect(moodAnalyses.length).toBeGreaterThan(0);

      // Should capture emotional variance
      const emotions = moodAnalyses.flatMap((a) => a.result.emotions || []);
      expect(emotions).toContain('anxious');
    });

    it('should identify mental health triggers', async () => {
      const response = await request(app.getHttpServer())
        .get('/analysis/type/triggers')
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);

      const allTriggers = response.body.flatMap(
        (a) => a.result.stressors || [],
      );
      expect(
        allTriggers.some(
          (trigger) =>
            trigger.includes('social') || trigger.includes('presentation'),
        ),
      ).toBe(true);
    });
  });

  describe('Combined Profile Integration', () => {
    beforeEach(async () => {
      await seederService.seedAllTestProfiles();
    });

    it('should handle multiple profiles simultaneously', async () => {
      const entriesResponse = await request(app.getHttpServer())
        .get('/journal-entries')
        .expect(200);

      // Should have entries from all three profiles
      expect(entriesResponse.body.length).toBeGreaterThan(10);
    });

    it('should provide comprehensive dashboard with all data types', async () => {
      const response = await request(app.getHttpServer())
        .get('/dashboard/data')
        .expect(200);

      expect(response.body.trends.mood.length).toBeGreaterThan(5);
      expect(response.body.trends.energy.length).toBeGreaterThan(5);
      expect(response.body.wordCloud.length).toBeGreaterThan(10);

      // Should have multiple categories in word cloud
      const categories = [
        ...new Set(response.body.wordCloud.map((w) => w.category)),
      ];
      expect(categories.length).toBeGreaterThan(1);
    });

    it('should support bulk analysis operations', async () => {
      const response = await request(app.getHttpServer())
        .post('/analysis/process-all')
        .send({ analysisTypes: ['mood', 'energy'] })
        .expect(201);

      expect(response.body.message).toContain('Bulk processing queued');
    });
  });

  describe('Database Cleanup Integration', () => {
    it('should clean up all data properly', async () => {
      // Seed some data first
      await seederService.seedTestProfile('addiction-recovery-profile');

      // Verify data exists
      const beforeResponse = await request(app.getHttpServer())
        .get('/journal-entries')
        .expect(200);
      expect(beforeResponse.body.length).toBeGreaterThan(0);

      // Clean up via API
      await request(app.getHttpServer())
        .delete('/testing/cleanup/all')
        .expect(200);

      // Verify data is gone
      const afterResponse = await request(app.getHttpServer())
        .get('/journal-entries')
        .expect(200);
      expect(afterResponse.body.length).toBe(0);
    });

    it('should handle selective cleanup operations', async () => {
      await seederService.seedTestProfile('addiction-recovery-profile');

      // Clean up only analysis results
      await request(app.getHttpServer())
        .delete('/testing/cleanup/analysis')
        .expect(200);

      // Entries should still exist
      const entriesResponse = await request(app.getHttpServer())
        .get('/journal-entries')
        .expect(200);
      expect(entriesResponse.body.length).toBeGreaterThan(0);

      // Analysis should be gone
      const analysisResponse = await request(app.getHttpServer())
        .get('/analysis')
        .expect(200);
      expect(analysisResponse.body.length).toBe(0);
    });
  });

  describe('API Error Handling', () => {
    it('should handle non-existent journal entry requests gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/journal-entries/non-existent-id')
        .expect(404);
    });

    it('should handle invalid analysis type requests', async () => {
      const response = await request(app.getHttpServer()).get(
        '/analysis/type/invalid-type',
      );

      // Should either return empty array or handle gracefully
      expect([200, 400, 404]).toContain(response.status);
    });

    it('should handle bulk delete operations safely', async () => {
      const response = await request(app.getHttpServer())
        .delete('/journal-entries/all')
        .expect(200);

      expect(response.body.message).toBeDefined();
    });
  });
});
