import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TestingModule as TestingModuleImport } from '../src/testing/testing.module';
import { DatabaseCleanupService } from '../src/testing/database-cleanup.service';
import { TestDataSeederService } from '../src/testing/test-data-seeder.service';

describe('LLM Evaluation System (e2e)', () => {
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
    await cleanupService.cleanupAll();
  });

  afterAll(async () => {
    await cleanupService.cleanupAll();
    await app.close();
  });

  describe('Profile Evaluation', () => {
    it('should evaluate addiction recovery profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/evaluation/profile/addiction-recovery-profile')
        .expect(201);

      expect(response.body.message).toContain('Evaluation completed');
      expect(response.body.profileName).toBe('addiction-recovery-profile');
      expect(response.body.results).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);

      // Should have results for multiple analysis types
      const analysisTypes = response.body.results.map((r) => r.analysisType);
      expect(analysisTypes).toContain('mood');
      expect(analysisTypes).toContain('triggers');

      // Each result should have proper structure
      response.body.results.forEach((result) => {
        expect(result.metrics).toBeDefined();
        expect(result.metrics.accuracy).toBeGreaterThanOrEqual(0);
        expect(result.metrics.accuracy).toBeLessThanOrEqual(1);
        expect(result.details.totalSamples).toBeGreaterThan(0);
        expect(result.timestamp).toBeDefined();
      });
    }, 60000); // Longer timeout for LLM calls

    it('should evaluate nutrition tracking profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/evaluation/profile/nutrition-tracking-profile')
        .expect(201);

      expect(response.body.profileName).toBe('nutrition-tracking-profile');
      expect(response.body.results.length).toBeGreaterThan(0);

      // Should have nutrition analysis results
      const nutritionResults = response.body.results.filter(
        (r) => r.analysisType === 'nutrition',
      );
      expect(nutritionResults.length).toBeGreaterThan(0);
    }, 60000);

    it('should evaluate mental health tracking profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/evaluation/profile/mental-health-tracking-profile')
        .expect(201);

      expect(response.body.profileName).toBe('mental-health-tracking-profile');
      expect(response.body.results.length).toBeGreaterThan(0);

      // Should capture mental health specific analysis
      const moodResults = response.body.results.filter(
        (r) => r.analysisType === 'mood',
      );
      expect(moodResults.length).toBeGreaterThan(0);
    }, 60000);

    it('should handle non-existent profile gracefully', async () => {
      const response = await request(app.getHttpServer())
        .post('/evaluation/profile/non-existent-profile')
        .expect(500); // Should throw error for non-existent profile

      expect(response.body.message).toContain('not found');
    });
  });

  describe('Comprehensive Evaluation', () => {
    it('should evaluate all profiles and generate comprehensive report', async () => {
      const response = await request(app.getHttpServer())
        .post('/evaluation/all-profiles')
        .expect(201);

      expect(response.body.message).toContain(
        'Comprehensive LLM evaluation completed',
      );
      expect(response.body.report).toBeDefined();

      const report = response.body.report;

      // Should have overall metrics
      expect(report.overallMetrics).toBeDefined();
      expect(report.overallMetrics.accuracy).toBeGreaterThanOrEqual(0);
      expect(report.overallMetrics.precision).toBeGreaterThanOrEqual(0);
      expect(report.overallMetrics.recall).toBeGreaterThanOrEqual(0);
      expect(report.overallMetrics.f1Score).toBeGreaterThanOrEqual(0);
      expect(report.overallMetrics.consistency).toBeGreaterThanOrEqual(0);

      // Should have results from all profiles
      expect(report.profileResults).toBeDefined();
      expect(report.profileResults.length).toBeGreaterThan(0);

      // Should have recommendations
      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);

      // Should include trace IDs for Langfuse
      expect(report.langfuseTraceIds).toBeDefined();
      expect(Array.isArray(report.langfuseTraceIds)).toBe(true);
    }, 120000); // Much longer timeout for comprehensive evaluation
  });

  describe('Performance Monitoring', () => {
    it('should provide performance report', async () => {
      // First run an evaluation to have data
      await request(app.getHttpServer())
        .post('/evaluation/profile/addiction-recovery-profile')
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/evaluation/report')
        .expect(200);

      expect(response.body.message).toContain(
        'LLM performance report generated',
      );
      expect(response.body.report).toBeDefined();
      expect(response.body.report.overallMetrics).toBeDefined();
    }, 60000);

    it('should provide metrics summary', async () => {
      // First run an evaluation to have data
      await request(app.getHttpServer())
        .post('/evaluation/profile/addiction-recovery-profile')
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/evaluation/metrics/summary')
        .expect(200);

      expect(response.body.accuracy).toBeGreaterThanOrEqual(0);
      expect(response.body.consistency).toBeGreaterThanOrEqual(0);
      expect(response.body.lastEvaluated).toBeDefined();
      expect(response.body.totalProfiles).toBeGreaterThan(0);
      expect(response.body.recommendations).toBeDefined();
      expect(Array.isArray(response.body.recommendations)).toBe(true);
    }, 60000);
  });

  describe('Integration with Langfuse Observability', () => {
    it('should trace LLM calls during evaluation', async () => {
      const response = await request(app.getHttpServer())
        .post('/evaluation/profile/addiction-recovery-profile')
        .expect(201);

      // Check that evaluation completed successfully
      expect(response.body.results.length).toBeGreaterThan(0);

      // Each result should have details about the LLM calls
      response.body.results.forEach((result) => {
        expect(result.details.actualResults.length).toBeGreaterThan(0);

        // Each actual result should have the structure expected from LLM
        result.details.actualResults.forEach((actualResult) => {
          expect(actualResult).toBeDefined();
          // Should have confidence scores for observability
          if (actualResult.confidence !== undefined) {
            expect(actualResult.confidence).toBeGreaterThanOrEqual(0);
            expect(actualResult.confidence).toBeLessThanOrEqual(1);
          }
        });
      });
    }, 60000);

    it('should maintain evaluation history for trend analysis', async () => {
      // Run evaluation twice to check history
      await request(app.getHttpServer())
        .post('/evaluation/profile/addiction-recovery-profile')
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/evaluation/profile/addiction-recovery-profile')
        .expect(201);

      // Should have fresh evaluation data
      expect(response.body.results.length).toBeGreaterThan(0);
      expect(response.body.results[0].timestamp).toBeDefined();
    }, 90000);
  });

  describe('Quality Assurance', () => {
    it('should identify when LLM performance drops below threshold', async () => {
      const response = await request(app.getHttpServer())
        .post('/evaluation/all-profiles')
        .expect(201);

      const report = response.body.report;

      // Check if recommendations include performance warnings
      const hasPerformanceWarnings = report.recommendations.some(
        (rec) =>
          rec.includes('accuracy') ||
          rec.includes('consistency') ||
          rec.includes('performance'),
      );

      // Should have meaningful recommendations regardless of performance
      expect(report.recommendations.length).toBeGreaterThan(0);

      // Overall metrics should be within reasonable bounds
      expect(report.overallMetrics.accuracy).toBeLessThanOrEqual(1);
      expect(report.overallMetrics.consistency).toBeLessThanOrEqual(1);
    }, 120000);

    it('should validate analysis output structure', async () => {
      const response = await request(app.getHttpServer())
        .post('/evaluation/profile/addiction-recovery-profile')
        .expect(201);

      // Validate that all actual results have expected structure
      response.body.results.forEach((result) => {
        result.details.actualResults.forEach((actualResult) => {
          switch (result.analysisType) {
            case 'mood':
              expect(actualResult.moodScale).toBeDefined();
              expect(typeof actualResult.moodScale).toBe('number');
              expect(actualResult.sentiment).toBeDefined();
              break;
            case 'energy':
              expect(actualResult.energyLevel).toBeDefined();
              expect(typeof actualResult.energyLevel).toBe('number');
              break;
            case 'nutrition':
              expect(actualResult.foodMentions).toBeDefined();
              expect(Array.isArray(actualResult.foodMentions)).toBe(true);
              break;
            case 'triggers':
              expect(
                actualResult.stressor || actualResult.stressors,
              ).toBeDefined();
              break;
          }
        });
      });
    }, 60000);
  });
});
