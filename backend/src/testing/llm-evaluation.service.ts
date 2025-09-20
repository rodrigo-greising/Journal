import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from '../journal-entries/journal-entry.entity';
import { AnalysisResult } from '../analysis/analysis-result.entity';
import { OpenAIService } from '../openai/openai.service';
import { TestDataSeederService } from './test-data-seeder.service';
import { TEST_PROFILES } from './test-data.profiles';

export interface EvaluationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  consistency: number;
}

export interface EvaluationResult {
  profileName: string;
  analysisType: 'mood' | 'energy' | 'nutrition' | 'triggers';
  metrics: EvaluationMetrics;
  details: {
    totalSamples: number;
    correctPredictions: number;
    actualResults: any[];
    expectedResults: any[];
    errors: string[];
  };
  timestamp: Date;
}

export interface LLMPerformanceReport {
  overallMetrics: EvaluationMetrics;
  profileResults: EvaluationResult[];
  recommendations: string[];
  langfuseTraceIds: string[];
}

@Injectable()
export class LLMEvaluationService {
  constructor(
    @InjectRepository(JournalEntry)
    private journalEntriesRepository: Repository<JournalEntry>,
    @InjectRepository(AnalysisResult)
    private analysisResultsRepository: Repository<AnalysisResult>,
    private openaiService: OpenAIService,
    private testDataSeederService: TestDataSeederService,
  ) {}

  async evaluateProfile(profileName: string): Promise<EvaluationResult[]> {
    const profile = TEST_PROFILES.find((p) => p.name === profileName);
    if (!profile) {
      throw new Error(`Test profile '${profileName}' not found`);
    }

    // Seed the profile data
    await this.testDataSeederService.cleanAndSeedProfile(profileName);

    // Get all journal entries for this evaluation
    const entries = await this.journalEntriesRepository.find({
      order: { createdAt: 'ASC' },
    });

    const results: EvaluationResult[] = [];

    // Evaluate each analysis type
    const analysisTypes: ('mood' | 'energy' | 'nutrition' | 'triggers')[] = [
      'mood',
      'energy',
      'nutrition',
      'triggers',
    ];

    for (const analysisType of analysisTypes) {
      const result = await this.evaluateAnalysisType(
        profileName,
        entries,
        analysisType,
      );
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  async evaluateAllProfiles(): Promise<LLMPerformanceReport> {
    const allResults: EvaluationResult[] = [];
    const traceIds: string[] = [];

    for (const profile of TEST_PROFILES) {
      const profileResults = await this.evaluateProfile(profile.name);
      allResults.push(...profileResults);
    }

    const overallMetrics = this.calculateOverallMetrics(allResults);
    const recommendations = this.generateRecommendations(allResults);

    return {
      overallMetrics,
      profileResults: allResults,
      recommendations,
      langfuseTraceIds: traceIds,
    };
  }

  private async evaluateAnalysisType(
    profileName: string,
    entries: JournalEntry[],
    analysisType: 'mood' | 'energy' | 'nutrition' | 'triggers',
  ): Promise<EvaluationResult | null> {
    const profile = TEST_PROFILES.find((p) => p.name === profileName);
    if (!profile) return null;

    const results = {
      correct: 0,
      total: 0,
      actualResults: [] as any[],
      expectedResults: [] as any[],
      errors: [] as string[],
    };

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const expectedData = profile.entries[i]?.expectedAnalysis?.[analysisType];

      if (!expectedData) continue;

      try {
        // Run actual LLM analysis
        let actualResult: any;
        const userId = 'evaluation-user';

        switch (analysisType) {
          case 'mood':
            actualResult = await this.openaiService.analyzeMood(
              entry.content,
              entry.id,
              userId,
            );
            break;
          case 'energy':
            actualResult = await this.openaiService.analyzeEnergy(
              entry.content,
              entry.id,
              userId,
            );
            break;
          case 'nutrition':
            actualResult = await this.openaiService.analyzeNutrition(
              entry.content,
              entry.id,
              userId,
            );
            break;
          case 'triggers':
            actualResult = await this.openaiService.analyzeTriggers(
              entry.content,
              entry.id,
              userId,
            );
            break;
        }

        // Compare results and calculate accuracy
        const isCorrect = this.compareResults(
          actualResult,
          expectedData,
          analysisType,
        );
        if (isCorrect) results.correct++;

        results.actualResults.push(actualResult);
        results.expectedResults.push(expectedData);
        results.total++;
      } catch (error) {
        results.errors.push(
          `Error analyzing entry ${entry.id}: ${error.message}`,
        );
        results.total++;
      }
    }

    const metrics = this.calculateMetrics(
      results.correct,
      results.total,
      results.actualResults,
      results.expectedResults,
    );

    return {
      profileName,
      analysisType,
      metrics,
      details: {
        totalSamples: results.total,
        correctPredictions: results.correct,
        actualResults: results.actualResults,
        expectedResults: results.expectedResults,
        errors: results.errors,
      },
      timestamp: new Date(),
    };
  }

  private compareResults(
    actual: any,
    expected: any,
    analysisType: string,
  ): boolean {
    switch (analysisType) {
      case 'mood':
        return this.compareMoodResults(actual, expected);
      case 'energy':
        return this.compareEnergyResults(actual, expected);
      case 'nutrition':
        return this.compareNutritionResults(actual, expected);
      case 'triggers':
        return this.compareTriggersResults(actual, expected);
      default:
        return false;
    }
  }

  private compareMoodResults(actual: any, expected: any): boolean {
    // Check if mood scale is within 1 point of expected
    const moodAccurate = Math.abs(actual.moodScale - expected.moodScale) <= 1;

    // Check if sentiment matches
    const sentimentAccurate = actual.sentiment === expected.sentiment;

    // Check if at least 50% of expected emotions are captured
    const expectedEmotions = expected.emotions || [];
    const actualEmotions = actual.emotions || [];
    const emotionOverlap = expectedEmotions.filter((e: string) =>
      actualEmotions.some(
        (a: string) =>
          a.toLowerCase().includes(e.toLowerCase()) ||
          e.toLowerCase().includes(a.toLowerCase()),
      ),
    ).length;
    const emotionAccurate =
      expectedEmotions.length === 0 ||
      emotionOverlap / expectedEmotions.length >= 0.5;

    return moodAccurate && sentimentAccurate && emotionAccurate;
  }

  private compareEnergyResults(actual: any, expected: any): boolean {
    // Check if energy level is within 1 point of expected
    const energyAccurate =
      Math.abs(actual.energyLevel - expected.energyLevel) <= 1;

    // Check sleep quality if provided
    let sleepAccurate = true;
    if (expected.sleepQuality && actual.sleepQuality) {
      sleepAccurate =
        Math.abs(actual.sleepQuality - expected.sleepQuality) <= 1;
    }

    return energyAccurate && sleepAccurate;
  }

  private compareNutritionResults(actual: any, expected: any): boolean {
    // Check if major food items are captured
    const expectedFoods = expected.foodMentions || [];
    const actualFoods = actual.foodMentions || [];

    if (expectedFoods.length === 0) return actualFoods.length === 0;

    const foodOverlap = expectedFoods.filter((f: string) =>
      actualFoods.some(
        (a: string) =>
          a.toLowerCase().includes(f.toLowerCase()) ||
          f.toLowerCase().includes(a.toLowerCase()),
      ),
    ).length;

    return foodOverlap / expectedFoods.length >= 0.7;
  }

  private compareTriggersResults(actual: any, expected: any): boolean {
    // Check if major stressors are captured
    const expectedStressors = expected.stressors || [];
    const actualStressors = actual.stressor || actual.stressors || [];

    if (expectedStressors.length === 0) return actualStressors.length === 0;

    const stressorOverlap = expectedStressors.filter((s: string) =>
      actualStressors.some(
        (a: string) =>
          a.toLowerCase().includes(s.toLowerCase()) ||
          s.toLowerCase().includes(a.toLowerCase()),
      ),
    ).length;

    return stressorOverlap / expectedStressors.length >= 0.6;
  }

  private calculateMetrics(
    correct: number,
    total: number,
    actual: any[],
    expected: any[],
  ): EvaluationMetrics {
    const accuracy = total > 0 ? correct / total : 0;

    // Simplified precision/recall calculation
    const precision = accuracy;
    const recall = accuracy;
    const f1Score =
      precision + recall > 0
        ? (2 * precision * recall) / (precision + recall)
        : 0;

    // Consistency check: similar inputs should produce similar outputs
    const consistency = this.calculateConsistency(actual);

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      consistency,
    };
  }

  private calculateConsistency(results: any[]): number {
    if (results.length < 2) return 1.0;

    // Simple consistency check: variance in confidence scores
    const confidenceScores = results
      .map((r) => r.confidence || 0.5)
      .filter((c) => c > 0);
    if (confidenceScores.length === 0) return 0.5;

    const mean =
      confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;
    const variance =
      confidenceScores.reduce((acc, c) => acc + Math.pow(c - mean, 2), 0) /
      confidenceScores.length;

    // Convert variance to consistency score (lower variance = higher consistency)
    return Math.max(0, 1 - variance * 2);
  }

  private calculateOverallMetrics(
    results: EvaluationResult[],
  ): EvaluationMetrics {
    if (results.length === 0) {
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        consistency: 0,
      };
    }

    const totalSamples = results.reduce(
      (sum, r) => sum + r.details.totalSamples,
      0,
    );
    const totalCorrect = results.reduce(
      (sum, r) => sum + r.details.correctPredictions,
      0,
    );

    const accuracy = totalSamples > 0 ? totalCorrect / totalSamples : 0;
    const avgPrecision =
      results.reduce((sum, r) => sum + r.metrics.precision, 0) / results.length;
    const avgRecall =
      results.reduce((sum, r) => sum + r.metrics.recall, 0) / results.length;
    const avgF1 =
      results.reduce((sum, r) => sum + r.metrics.f1Score, 0) / results.length;
    const avgConsistency =
      results.reduce((sum, r) => sum + r.metrics.consistency, 0) /
      results.length;

    return {
      accuracy,
      precision: avgPrecision,
      recall: avgRecall,
      f1Score: avgF1,
      consistency: avgConsistency,
    };
  }

  private generateRecommendations(results: EvaluationResult[]): string[] {
    const recommendations: string[] = [];

    const overallMetrics = this.calculateOverallMetrics(results);

    if (overallMetrics.accuracy < 0.7) {
      recommendations.push(
        'Overall accuracy is below 70%. Consider refining prompts or using a more powerful model.',
      );
    }

    if (overallMetrics.consistency < 0.6) {
      recommendations.push(
        'Consistency is low. Consider reducing temperature or adding more specific instructions.',
      );
    }

    // Analyze by analysis type
    const moodResults = results.filter((r) => r.analysisType === 'mood');
    const energyResults = results.filter((r) => r.analysisType === 'energy');
    const nutritionResults = results.filter(
      (r) => r.analysisType === 'nutrition',
    );
    const triggerResults = results.filter((r) => r.analysisType === 'triggers');

    if (
      moodResults.length > 0 &&
      moodResults.every((r) => r.metrics.accuracy < 0.6)
    ) {
      recommendations.push(
        'Mood analysis accuracy is consistently low. Review mood scale calibration and emotion detection.',
      );
    }

    if (
      energyResults.length > 0 &&
      energyResults.every((r) => r.metrics.accuracy < 0.6)
    ) {
      recommendations.push(
        'Energy analysis needs improvement. Consider adding more fatigue and energy indicators to prompts.',
      );
    }

    if (
      nutritionResults.length > 0 &&
      nutritionResults.every((r) => r.metrics.accuracy < 0.6)
    ) {
      recommendations.push(
        'Nutrition analysis could be enhanced with better food recognition patterns.',
      );
    }

    if (
      triggerResults.length > 0 &&
      triggerResults.every((r) => r.metrics.accuracy < 0.6)
    ) {
      recommendations.push(
        'Trigger analysis needs refinement. Consider expanding stressor categories and risk factor definitions.',
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'LLM performance is within acceptable ranges. Continue monitoring for consistency.',
      );
    }

    return recommendations;
  }

  async generatePerformanceReport(): Promise<LLMPerformanceReport> {
    return await this.evaluateAllProfiles();
  }
}
