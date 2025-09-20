import { Injectable } from '@nestjs/common';
import { OpenAIService } from '../openai/openai.service';

export interface ConsistencyTestResult {
  testEntry: string;
  analysisType: 'mood' | 'energy' | 'nutrition' | 'triggers';
  runs: number;
  results: any[];
  metrics: {
    meanMoodScale?: number;
    moodScaleVariance?: number;
    meanEnergyLevel?: number;
    energyLevelVariance?: number;
    sentimentConsistency?: number;
    emotionsConsistency?: number;
    foodGroupsConsistency?: number;
    overallConsistency: number;
  };
  recommendations: string[];
}

@Injectable()
export class ConsistencyTestingService {
  constructor(private openaiService: OpenAIService) {}

  async testMoodConsistency(
    entryText: string,
    runs: number = 5
  ): Promise<ConsistencyTestResult> {
    const results = [];

    for (let i = 0; i < runs; i++) {
      const result = await this.openaiService.analyzeMood(
        entryText,
        `consistency-test-${Date.now()}-${i}`,
        'consistency-tester'
      );
      results.push(result);
    }

    const metrics = this.calculateMoodConsistencyMetrics(results);
    const recommendations = this.generateMoodRecommendations(metrics);

    return {
      testEntry: entryText,
      analysisType: 'mood',
      runs,
      results,
      metrics,
      recommendations,
    };
  }

  async testEnergyConsistency(
    entryText: string,
    runs: number = 5
  ): Promise<ConsistencyTestResult> {
    const results = [];

    for (let i = 0; i < runs; i++) {
      const result = await this.openaiService.analyzeEnergy(
        entryText,
        `consistency-test-${Date.now()}-${i}`,
        'consistency-tester'
      );
      results.push(result);
    }

    const metrics = this.calculateEnergyConsistencyMetrics(results);
    const recommendations = this.generateEnergyRecommendations(metrics);

    return {
      testEntry: entryText,
      analysisType: 'energy',
      runs,
      results,
      metrics,
      recommendations,
    };
  }

  async testNutritionConsistency(
    entryText: string,
    runs: number = 5
  ): Promise<ConsistencyTestResult> {
    const results = [];

    for (let i = 0; i < runs; i++) {
      const result = await this.openaiService.analyzeNutrition(
        entryText,
        `consistency-test-${Date.now()}-${i}`,
        'consistency-tester'
      );
      results.push(result);
    }

    const metrics = this.calculateNutritionConsistencyMetrics(results);
    const recommendations = this.generateNutritionRecommendations(metrics);

    return {
      testEntry: entryText,
      analysisType: 'nutrition',
      runs,
      results,
      metrics,
      recommendations,
    };
  }

  async testTriggersConsistency(
    entryText: string,
    runs: number = 5
  ): Promise<ConsistencyTestResult> {
    const results = [];

    for (let i = 0; i < runs; i++) {
      const result = await this.openaiService.analyzeTriggers(
        entryText,
        `consistency-test-${Date.now()}-${i}`,
        'consistency-tester'
      );
      results.push(result);
    }

    const metrics = this.calculateTriggersConsistencyMetrics(results);
    const recommendations = this.generateTriggersRecommendations(metrics);

    return {
      testEntry: entryText,
      analysisType: 'triggers',
      runs,
      results,
      metrics,
      recommendations,
    };
  }

  private calculateMoodConsistencyMetrics(results: any[]) {
    const moodScales = results.map(r => r.moodScale);
    const sentiments = results.map(r => r.sentiment);
    const emotions = results.map(r => r.emotions || []);

    const meanMoodScale = moodScales.reduce((a, b) => a + b, 0) / moodScales.length;
    const moodScaleVariance = this.calculateVariance(moodScales);

    // Sentiment consistency: percentage of results with the same sentiment
    const sentimentMode = this.findMode(sentiments);
    const sentimentConsistency = sentiments.filter(s => s === sentimentMode).length / sentiments.length;

    // Emotions consistency: average overlap between emotion lists
    const emotionsConsistency = this.calculateEmotionsOverlap(emotions);

    const overallConsistency = (sentimentConsistency + emotionsConsistency + (1 - Math.min(moodScaleVariance / 4, 1))) / 3;

    return {
      meanMoodScale: Math.round(meanMoodScale * 10) / 10,
      moodScaleVariance: Math.round(moodScaleVariance * 100) / 100,
      sentimentConsistency: Math.round(sentimentConsistency * 100) / 100,
      emotionsConsistency: Math.round(emotionsConsistency * 100) / 100,
      overallConsistency: Math.round(overallConsistency * 100) / 100,
    };
  }

  private calculateEnergyConsistencyMetrics(results: any[]) {
    const energyLevels = results.map(r => r.energyLevel);
    const meanEnergyLevel = energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length;
    const energyLevelVariance = this.calculateVariance(energyLevels);

    const overallConsistency = 1 - Math.min(energyLevelVariance / 4, 1);

    return {
      meanEnergyLevel: Math.round(meanEnergyLevel * 10) / 10,
      energyLevelVariance: Math.round(energyLevelVariance * 100) / 100,
      overallConsistency: Math.round(overallConsistency * 100) / 100,
    };
  }

  private calculateNutritionConsistencyMetrics(results: any[]) {
    const foodGroups = results.map(r => r.foodGroups || []);
    const foodGroupsConsistency = this.calculateArrayOverlap(foodGroups);

    return {
      foodGroupsConsistency: Math.round(foodGroupsConsistency * 100) / 100,
      overallConsistency: Math.round(foodGroupsConsistency * 100) / 100,
    };
  }

  private calculateTriggersConsistencyMetrics(results: any[]) {
    const stressors = results.map(r => r.stressor || r.stressors || []);
    const stressorsConsistency = this.calculateArrayOverlap(stressors);

    return {
      overallConsistency: Math.round(stressorsConsistency * 100) / 100,
    };
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private findMode(arr: string[]): string {
    const frequency: Record<string, number> = {};
    let maxFreq = 0;
    let mode = arr[0];

    for (const item of arr) {
      frequency[item] = (frequency[item] || 0) + 1;
      if (frequency[item] > maxFreq) {
        maxFreq = frequency[item];
        mode = item;
      }
    }

    return mode;
  }

  private calculateEmotionsOverlap(emotionArrays: string[][]): number {
    if (emotionArrays.length < 2) return 1;

    let totalOverlap = 0;
    let comparisons = 0;

    for (let i = 0; i < emotionArrays.length; i++) {
      for (let j = i + 1; j < emotionArrays.length; j++) {
        const overlap = this.calculateJaccardSimilarity(emotionArrays[i], emotionArrays[j]);
        totalOverlap += overlap;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalOverlap / comparisons : 0;
  }

  private calculateArrayOverlap(arrays: string[][]): number {
    if (arrays.length < 2) return 1;

    let totalOverlap = 0;
    let comparisons = 0;

    for (let i = 0; i < arrays.length; i++) {
      for (let j = i + 1; j < arrays.length; j++) {
        const overlap = this.calculateJaccardSimilarity(arrays[i], arrays[j]);
        totalOverlap += overlap;
        comparisons++;
      }
    }

    return comparisons > 0 ? totalOverlap / comparisons : 0;
  }

  private calculateJaccardSimilarity(arr1: string[], arr2: string[]): number {
    const set1 = new Set(arr1.map(s => s.toLowerCase()));
    const set2 = new Set(arr2.map(s => s.toLowerCase()));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return union.size === 0 ? 1 : intersection.size / union.size;
  }

  private generateMoodRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    if (metrics.moodScaleVariance > 2) {
      recommendations.push('Mood scale variance is high (>2 points). Consider lowering temperature or adding more specific mood anchors.');
    }

    if (metrics.sentimentConsistency < 0.8) {
      recommendations.push('Sentiment classification is inconsistent (<80%). Review sentiment thresholds in the prompt.');
    }

    if (metrics.emotionsConsistency < 0.6) {
      recommendations.push('Emotion detection varies significantly (<60% overlap). Consider providing a standardized emotion list.');
    }

    if (metrics.overallConsistency < 0.7) {
      recommendations.push('Overall mood analysis consistency is below 70%. Consider prompt engineering improvements.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Mood analysis consistency is acceptable. Continue monitoring.');
    }

    return recommendations;
  }

  private generateEnergyRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    if (metrics.energyLevelVariance > 2) {
      recommendations.push('Energy level variance is high (>2 points). Consider more specific energy level descriptions.');
    }

    if (metrics.overallConsistency < 0.7) {
      recommendations.push('Energy analysis consistency is below 70%. Consider prompt refinements.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Energy analysis consistency is acceptable. Continue monitoring.');
    }

    return recommendations;
  }

  private generateNutritionRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    if (metrics.foodGroupsConsistency < 0.7) {
      recommendations.push('Food group identification varies significantly (<70% overlap). Consider more specific food group definitions.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Nutrition analysis consistency is acceptable. Continue monitoring.');
    }

    return recommendations;
  }

  private generateTriggersRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    if (metrics.overallConsistency < 0.6) {
      recommendations.push('Trigger identification varies significantly (<60% overlap). Consider more specific trigger categories.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Trigger analysis consistency is acceptable. Continue monitoring.');
    }

    return recommendations;
  }
}