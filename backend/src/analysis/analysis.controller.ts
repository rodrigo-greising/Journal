import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { QueueService } from '../queue/queue.service';
import type { AnalysisType } from './analysis-result.entity';

@Controller('analysis')
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly queueService: QueueService,
  ) {}

  @Get()
  async getAllResults() {
    return await this.analysisService.getAllAnalysisResults();
  }

  @Get('type/:type')
  async getResultsByType(@Param('type') type: AnalysisType) {
    return await this.analysisService.getAnalysisResultsByType(type);
  }

  @Get('entry/:entryId')
  async getResultsForEntry(@Param('entryId') entryId: string) {
    return await this.analysisService.getAnalysisResults(entryId);
  }

  @Post('process/:entryId')
  async processEntry(
    @Param('entryId') entryId: string,
    @Body() body: { analysisTypes?: AnalysisType[] }
  ) {
    const analysisTypes = body.analysisTypes || ['mood', 'energy'];
    await this.analysisService.queueAnalysisForEntry(entryId, analysisTypes);
    return { message: 'Analysis queued successfully', analysisTypes };
  }

  @Post('reprocess/:type')
  async reprocessType(@Param('type') type: AnalysisType) {
    await this.analysisService.reprocessAllEntries(type);
    return { message: `Reprocessing queued for ${type} analysis` };
  }

  @Post('process-all')
  async processAllEntries(@Body() body: { analysisTypes?: AnalysisType[] }) {
    const analysisTypes = body.analysisTypes || ['mood', 'energy'];

    for (const analysisType of analysisTypes) {
      await this.analysisService.reprocessAllEntries(analysisType);
    }

    return {
      message: 'Bulk processing queued successfully',
      analysisTypes
    };
  }

  @Get('queue/status')
  async getQueueStatus() {
    return await this.queueService.getJobCounts();
  }

  @Post('queue/retry-failed')
  async retryFailedJobs() {
    await this.queueService.retryFailedJobs();
    return { message: 'Failed jobs retried' };
  }

  @Post('queue/clean')
  async cleanQueue() {
    await this.queueService.cleanQueue();
    return { message: 'Queue cleaned' };
  }

  @Post('builder/default/:entryId')
  async processWithDefaultBuilder(@Param('entryId') entryId: string) {
    const builder = await this.analysisService.createAnalysisBuilder();
    await builder.getDefaultAnalysis().executeFor(entryId);
    return { message: 'Default analysis queued (mood, energy)' };
  }

  @Post('builder/healthcare/:entryId')
  async processWithHealthcareBuilder(@Param('entryId') entryId: string) {
    const builder = await this.analysisService.createAnalysisBuilder();
    await builder.getHealthcareAnalysis().executeFor(entryId);
    return { message: 'Healthcare analysis queued (mood, energy, triggers)' };
  }

  @Post('builder/nutrition/:entryId')
  async processWithNutritionBuilder(@Param('entryId') entryId: string) {
    const builder = await this.analysisService.createAnalysisBuilder();
    await builder.getNutritionAnalysis().executeFor(entryId);
    return { message: 'Nutrition analysis queued (mood, energy, nutrition)' };
  }

  @Post('builder/custom/:entryId')
  async processWithCustomBuilder(
    @Param('entryId') entryId: string,
    @Body() config: {
      includeMood?: boolean;
      includeEnergy?: boolean;
      includeNutrition?: boolean;
      includeTriggers?: boolean;
    }
  ) {
    const builder = await this.analysisService.createAnalysisBuilder();

    if (config.includeMood) builder.withMoodAnalysis();
    if (config.includeEnergy) builder.withEnergyAnalysis();
    if (config.includeNutrition) builder.withNutritionAnalysis();
    if (config.includeTriggers) builder.withTriggerAnalysis();

    await builder.executeFor(entryId);

    const enabledAnalyses = Object.entries(config)
      .filter(([key, value]) => value)
      .map(([key]) => key.replace('include', '').toLowerCase());

    return {
      message: 'Custom analysis queued',
      analysisTypes: enabledAnalyses
    };
  }
}