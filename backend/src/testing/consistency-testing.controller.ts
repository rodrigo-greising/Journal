import { Controller, Post, Body, Param, Query } from '@nestjs/common';
import {
  ConsistencyTestingService,
  ConsistencyTestResult,
} from './consistency-testing.service';

@Controller('consistency')
export class ConsistencyTestingController {
  constructor(
    private readonly consistencyTestingService: ConsistencyTestingService,
  ) {}

  @Post('test/mood')
  async testMoodConsistency(
    @Body() body: { text: string; runs?: number },
  ): Promise<ConsistencyTestResult> {
    const runs = body.runs || 5;
    return await this.consistencyTestingService.testMoodConsistency(
      body.text,
      runs,
    );
  }

  @Post('test/energy')
  async testEnergyConsistency(
    @Body() body: { text: string; runs?: number },
  ): Promise<ConsistencyTestResult> {
    const runs = body.runs || 5;
    return await this.consistencyTestingService.testEnergyConsistency(
      body.text,
      runs,
    );
  }

  @Post('test/nutrition')
  async testNutritionConsistency(
    @Body() body: { text: string; runs?: number },
  ): Promise<ConsistencyTestResult> {
    const runs = body.runs || 5;
    return await this.consistencyTestingService.testNutritionConsistency(
      body.text,
      runs,
    );
  }

  @Post('test/triggers')
  async testTriggersConsistency(
    @Body() body: { text: string; runs?: number },
  ): Promise<ConsistencyTestResult> {
    const runs = body.runs || 5;
    return await this.consistencyTestingService.testTriggersConsistency(
      body.text,
      runs,
    );
  }

  @Post('test/all')
  async testAllConsistency(
    @Body() body: { text: string; runs?: number },
  ): Promise<{
    text: string;
    runs: number;
    results: {
      mood: ConsistencyTestResult;
      energy: ConsistencyTestResult;
      nutrition: ConsistencyTestResult;
      triggers: ConsistencyTestResult;
    };
    overallConsistency: number;
    recommendations: string[];
  }> {
    const runs = body.runs || 5;

    const [mood, energy, nutrition, triggers] = await Promise.all([
      this.consistencyTestingService.testMoodConsistency(body.text, runs),
      this.consistencyTestingService.testEnergyConsistency(body.text, runs),
      this.consistencyTestingService.testNutritionConsistency(body.text, runs),
      this.consistencyTestingService.testTriggersConsistency(body.text, runs),
    ]);

    const overallConsistency =
      (mood.metrics.overallConsistency +
        energy.metrics.overallConsistency +
        nutrition.metrics.overallConsistency +
        triggers.metrics.overallConsistency) /
      4;

    const allRecommendations = [
      ...mood.recommendations,
      ...energy.recommendations,
      ...nutrition.recommendations,
      ...triggers.recommendations,
    ];

    return {
      text: body.text,
      runs,
      results: { mood, energy, nutrition, triggers },
      overallConsistency: Math.round(overallConsistency * 100) / 100,
      recommendations: allRecommendations,
    };
  }

  @Post('test/preset/:profileName')
  async testPresetEntry(
    @Param('profileName') profileName: string,
    @Query('entryIndex') entryIndex: string = '0',
    @Query('runs') runs: string = '5',
  ): Promise<any> {
    // This would use one of the predefined test entries
    const sampleTexts = {
      'addiction-recovery':
        'Day 1. Hands shaking. Made eggs and toast. Dave destroyed my presentation today - felt my chest get tight, wanted a drink so bad. Called Sarah instead.',
      nutrition:
        'Starting this food journal thing my doctor recommended. Breakfast was rushed - just grabbed a banana and coffee on the way to work. Lunch was that quinoa salad from the place downstairs, pretty good actually.',
      'mental-health':
        "Therapy was intense today. We dug into some childhood stuff I haven't thought about in years. Dr. Martinez says it's normal to feel stirred up after sessions like this.",
    };

    const text = sampleTexts[profileName as keyof typeof sampleTexts];
    if (!text) {
      throw new Error(`Unknown profile: ${profileName}`);
    }

    return await this.testAllConsistency({ text, runs: parseInt(runs) });
  }
}
