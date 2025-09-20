import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { JournalEntry } from '../journal-entries/journal-entry.entity';
import { AnalysisResult } from '../analysis/analysis-result.entity';
import { DashboardData } from './interfaces/dashboard-data.interface';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(JournalEntry)
    private journalEntriesRepository: Repository<JournalEntry>,
    @InjectRepository(AnalysisResult)
    private analysisResultsRepository: Repository<AnalysisResult>,
  ) {}

  async getDashboardData(
    startDate: Date,
    endDate: Date,
  ): Promise<DashboardData> {
    // Get journal entries in date range
    const entries = await this.journalEntriesRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
        isDraft: false,
        isDeleted: false,
      },
      order: { createdAt: 'ASC' },
    });

    // Get all completed analysis results with journal entries
    const allAnalysisResults = await this.analysisResultsRepository.find({
      where: {
        status: 'completed',
      },
      relations: ['journalEntry'],
    });

    // Filter by journal entry date range manually
    const analysisResults = allAnalysisResults.filter((result) => {
      const entryDate = new Date(result.journalEntry.createdAt);
      return (
        entryDate >= startDate &&
        entryDate <= endDate &&
        !result.journalEntry.isDraft &&
        !result.journalEntry.isDeleted
      );
    });

    // Process trends data
    const trends = this.processTrends(analysisResults);

    // Process word cloud data
    const wordCloud = this.processWordCloud(analysisResults);

    // Process summary data
    const summary = this.processSummary(entries, analysisResults);

    return {
      trends,
      wordCloud,
      summary,
    };
  }

  private processTrends(analysisResults: AnalysisResult[]) {
    const moodData: Array<{ date: string; value: number }> = [];
    const energyData: Array<{ date: string; value: number }> = [];
    const sleepData: Array<{ date: string; value: number }> = [];

    // Group by date and analysis type
    const resultsByDate = new Map<
      string,
      { mood?: number; energy?: number; sleep?: number }
    >();

    analysisResults.forEach((result) => {
      const date = result.journalEntry.createdAt.toISOString().split('T')[0];

      if (!resultsByDate.has(date)) {
        resultsByDate.set(date, {});
      }

      const dayData = resultsByDate.get(date)!;

      if (result.analysisType === 'mood' && result.result?.moodScale) {
        dayData.mood = result.result.moodScale;
      } else if (
        result.analysisType === 'energy' &&
        result.result?.energyLevel
      ) {
        dayData.energy = result.result.energyLevel;
        if (result.result?.sleepQuality) {
          dayData.sleep = result.result.sleepQuality;
        }
      }
    });

    // Convert to arrays
    Array.from(resultsByDate.entries()).forEach(([date, data]) => {
      if (data.mood !== undefined) {
        moodData.push({ date, value: data.mood });
      }
      if (data.energy !== undefined) {
        energyData.push({ date, value: data.energy });
      }
      if (data.sleep !== undefined) {
        sleepData.push({ date, value: data.sleep });
      }
    });

    return {
      mood: moodData,
      energy: energyData,
      sleep: sleepData,
    };
  }

  private processWordCloud(analysisResults: AnalysisResult[]) {
    const wordFrequency = new Map<
      string,
      { count: number; category: string }
    >();

    analysisResults.forEach((result) => {
      if (result.analysisType === 'triggers' && result.result) {
        // Process stressors (handle both 'stressor' and 'stressors' fields)
        const stressors =
          result.result.stressor || result.result.stressors || [];
        if (stressors && Array.isArray(stressors)) {
          stressors.forEach((stressor: string) => {
            const key = stressor.toLowerCase();
            const current = wordFrequency.get(key) || {
              count: 0,
              category: 'triggers',
            };
            wordFrequency.set(key, {
              count: current.count + 1,
              category: 'triggers',
            });
          });
        }

        // Process cravings
        if (result.result.cravings) {
          result.result.cravings.forEach((craving: string) => {
            const key = craving.toLowerCase();
            const current = wordFrequency.get(key) || {
              count: 0,
              category: 'triggers',
            };
            wordFrequency.set(key, {
              count: current.count + 1,
              category: 'triggers',
            });
          });
        }
      }

      if (result.analysisType === 'mood' && result.result?.emotions) {
        result.result.emotions.forEach((emotion: string) => {
          const key = emotion.toLowerCase();
          const current = wordFrequency.get(key) || {
            count: 0,
            category: 'emotions',
          };
          wordFrequency.set(key, {
            count: current.count + 1,
            category: 'emotions',
          });
        });
      }

      if (result.analysisType === 'nutrition' && result.result?.foodMentions) {
        result.result.foodMentions.forEach((food: string) => {
          const key = food.toLowerCase();
          const current = wordFrequency.get(key) || {
            count: 0,
            category: 'food',
          };
          wordFrequency.set(key, {
            count: current.count + 1,
            category: 'food',
          });
        });
      }
    });

    // Convert to word cloud format and sort by frequency
    return Array.from(wordFrequency.entries())
      .map(([text, data]) => ({
        text,
        size: data.count,
        category: data.category,
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 50); // Limit to top 50 words
  }

  private processSummary(
    entries: JournalEntry[],
    analysisResults: AnalysisResult[],
  ) {
    const totalEntries = entries.length;

    // Calculate average mood and energy
    const moodResults = analysisResults.filter(
      (r) => r.analysisType === 'mood' && r.result?.moodScale,
    );
    const energyResults = analysisResults.filter(
      (r) => r.analysisType === 'energy' && r.result?.energyLevel,
    );

    const avgMood =
      moodResults.length > 0
        ? moodResults.reduce((sum, r) => sum + r.result.moodScale, 0) /
          moodResults.length
        : 0;

    const avgEnergy =
      energyResults.length > 0
        ? energyResults.reduce((sum, r) => sum + r.result.energyLevel, 0) /
          energyResults.length
        : 0;

    // Get common triggers
    const triggerFrequency = new Map<string, number>();
    analysisResults
      .filter((r) => r.analysisType === 'triggers' && r.result)
      .forEach((result) => {
        const stressors =
          result.result.stressor || result.result.stressors || [];
        if (stressors && Array.isArray(stressors)) {
          stressors.forEach((stressor: string) => {
            const current = triggerFrequency.get(stressor) || 0;
            triggerFrequency.set(stressor, current + 1);
          });
        }
      });

    const commonTriggers = Array.from(triggerFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([trigger]) => trigger);

    // Generate positive trends (simplified)
    const positiveTrends: string[] = [];

    if (avgMood > 6) {
      positiveTrends.push('Overall mood is above average');
    }

    if (avgEnergy > 6) {
      positiveTrends.push('Energy levels are consistently good');
    }

    if (moodResults.length >= 7) {
      const recentMood = moodResults.slice(-7);
      const earlierMood = moodResults.slice(-14, -7);

      if (recentMood.length > 0 && earlierMood.length > 0) {
        const recentAvg =
          recentMood.reduce((sum, r) => sum + r.result.moodScale, 0) /
          recentMood.length;
        const earlierAvg =
          earlierMood.reduce((sum, r) => sum + r.result.moodScale, 0) /
          earlierMood.length;

        if (recentAvg > earlierAvg) {
          positiveTrends.push('Mood has been improving recently');
        }
      }
    }

    if (totalEntries >= 5) {
      positiveTrends.push('Consistent journaling habit established');
    }

    return {
      totalEntries,
      avgMood: Math.round(avgMood * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      commonTriggers,
      positiveTrends,
    };
  }
}
