import { Controller, Post, Get, Param, Query } from '@nestjs/common';
import {
  LLMEvaluationService,
  EvaluationResult,
  LLMPerformanceReport,
} from './llm-evaluation.service';

@Controller('evaluation')
export class LLMEvaluationController {
  constructor(private readonly llmEvaluationService: LLMEvaluationService) {}

  @Post('profile/:profileName')
  async evaluateProfile(@Param('profileName') profileName: string): Promise<{
    message: string;
    profileName: string;
    results: EvaluationResult[];
  }> {
    const results =
      await this.llmEvaluationService.evaluateProfile(profileName);
    return {
      message: `Evaluation completed for profile '${profileName}'`,
      profileName,
      results,
    };
  }

  @Post('all-profiles')
  async evaluateAllProfiles(): Promise<{
    message: string;
    report: LLMPerformanceReport;
  }> {
    const report = await this.llmEvaluationService.evaluateAllProfiles();
    return {
      message: 'Comprehensive LLM evaluation completed',
      report,
    };
  }

  @Get('report')
  async getPerformanceReport(): Promise<{
    message: string;
    report: LLMPerformanceReport;
  }> {
    const report = await this.llmEvaluationService.generatePerformanceReport();
    return {
      message: 'LLM performance report generated',
      report,
    };
  }

  @Get('metrics/summary')
  async getMetricsSummary(): Promise<{
    accuracy: number;
    consistency: number;
    lastEvaluated: Date;
    totalProfiles: number;
    recommendations: string[];
  }> {
    const report = await this.llmEvaluationService.generatePerformanceReport();

    return {
      accuracy: report.overallMetrics.accuracy,
      consistency: report.overallMetrics.consistency,
      lastEvaluated: new Date(),
      totalProfiles: report.profileResults.length,
      recommendations: report.recommendations,
    };
  }
}
