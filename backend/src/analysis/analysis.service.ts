import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalysisResult, AnalysisType } from './analysis-result.entity';
import { JournalEntry } from '../journal-entries/journal-entry.entity';
import { OpenAIService } from '../openai/openai.service';
import { QueueService } from '../queue/queue.service';
import { AnalysisConfig } from './dto/analysis-config.dto';
import { readFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    @InjectRepository(AnalysisResult)
    private analysisResultRepository: Repository<AnalysisResult>,
    @InjectRepository(JournalEntry)
    private journalEntryRepository: Repository<JournalEntry>,
    private openaiService: OpenAIService,
    private queueService: QueueService,
  ) {}

  async createAnalysisBuilder(): Promise<AnalysisBuilder> {
    return new AnalysisBuilder(this);
  }

  async processJournalEntry(journalEntryId: string, analysisType: AnalysisType): Promise<void> {
    const journalEntry = await this.journalEntryRepository.findOne({
      where: { id: journalEntryId }
    });

    if (!journalEntry) {
      throw new Error(`Journal entry ${journalEntryId} not found`);
    }

    let content = journalEntry.content;

    // If it's an audio entry and content is empty, transcribe first
    if (journalEntry.type === 'audio' && (!content || content.trim() === '') && journalEntry.audioUrl) {
      content = await this.transcribeAudio(journalEntry.audioUrl);
      // Update the journal entry with transcribed content
      await this.journalEntryRepository.update(journalEntryId, { content });
    }

    // Create or update analysis result
    let analysisResult = await this.analysisResultRepository.findOne({
      where: { journalEntryId, analysisType }
    });

    if (!analysisResult) {
      analysisResult = this.analysisResultRepository.create({
        journalEntryId,
        analysisType,
        status: 'processing'
      });
    } else {
      analysisResult.status = 'processing';
      analysisResult.errorMessage = undefined;
      analysisResult.retryCount++;
    }

    await this.analysisResultRepository.save(analysisResult);

    try {
      let result: any;

      switch (analysisType) {
        case 'mood':
          result = await this.openaiService.analyzeMood(content, journalEntryId);
          break;
        case 'energy':
          result = await this.openaiService.analyzeEnergy(content, journalEntryId);
          break;
        case 'nutrition':
          result = await this.openaiService.analyzeNutrition(content, journalEntryId);
          break;
        case 'triggers':
          result = await this.openaiService.analyzeTriggers(content, journalEntryId);
          break;
        default:
          throw new Error(`Unknown analysis type: ${analysisType}`);
      }

      analysisResult.result = result;
      analysisResult.status = 'completed';
      await this.analysisResultRepository.save(analysisResult);

      this.logger.log(`Analysis completed for entry ${journalEntryId}, type ${analysisType}`);
    } catch (error) {
      analysisResult.status = 'failed';
      analysisResult.errorMessage = error.message;
      await this.analysisResultRepository.save(analysisResult);

      this.logger.error(`Analysis failed for entry ${journalEntryId}, type ${analysisType}:`, error);
      throw error;
    }
  }

  async queueAnalysisForEntry(journalEntryId: string, analysisTypes: AnalysisType[]): Promise<void> {
    const journalEntry = await this.journalEntryRepository.findOne({
      where: { id: journalEntryId }
    });

    if (!journalEntry) {
      throw new Error(`Journal entry ${journalEntryId} not found`);
    }

    const jobs = analysisTypes.map(analysisType => ({
      journalEntryId,
      analysisType,
      content: journalEntry.content,
      audioUrl: journalEntry.audioUrl,
    }));

    await this.queueService.addBulkAnalysisJobs(jobs);
  }

  async reprocessAllEntries(analysisType: AnalysisType): Promise<void> {
    const journalEntries = await this.journalEntryRepository.find({
      where: { isDeleted: false, isDraft: false }
    });

    const jobs = journalEntries.map(entry => ({
      journalEntryId: entry.id,
      analysisType,
      content: entry.content,
      audioUrl: entry.audioUrl,
    }));

    await this.queueService.addBulkAnalysisJobs(jobs);
    this.logger.log(`Queued ${jobs.length} entries for ${analysisType} reprocessing`);
  }

  async getAnalysisResults(journalEntryId: string): Promise<AnalysisResult[]> {
    return await this.analysisResultRepository.find({
      where: { journalEntryId },
      order: { createdAt: 'DESC' }
    });
  }

  async getAllAnalysisResults(): Promise<AnalysisResult[]> {
    return await this.analysisResultRepository.find({
      relations: ['journalEntry'],
      where: { status: 'completed' },
      order: { createdAt: 'DESC' }
    });
  }

  async getAnalysisResultsByType(analysisType: AnalysisType): Promise<AnalysisResult[]> {
    return await this.analysisResultRepository.find({
      relations: ['journalEntry'],
      where: { analysisType, status: 'completed' },
      order: { createdAt: 'DESC' }
    });
  }

  private async transcribeAudio(audioUrl: string): Promise<string> {
    try {
      this.logger.log(`Starting audio transcription for ${audioUrl}`);
      
      // Extract filename from URL (e.g., "http://localhost:3001/uploads/audio/filename.webm" -> "filename.webm")
      const filename = audioUrl.split('/').pop();
      if (!filename) {
        throw new Error(`Invalid audio URL: ${audioUrl}`);
      }
      
      // Construct the file path
      const filePath = join(process.cwd(), 'uploads', 'audio', filename);
      
      // Read the audio file
      const audioBuffer = await readFile(filePath);
      
      // Transcribe using OpenAI service
      const transcription = await this.openaiService.transcribeAudio(audioBuffer);
      
      this.logger.log(`Audio transcription completed for ${audioUrl}`);
      return transcription;
    } catch (error) {
      this.logger.error(`Failed to transcribe audio ${audioUrl}:`, error);
      throw new Error(`Audio transcription failed: ${error.message}`);
    }
  }
}

export class AnalysisBuilder {
  private configs: AnalysisConfig[] = [];

  constructor(private analysisService: AnalysisService) {}

  withMoodAnalysis(extractSentiment = true, extractEmotions = true, extractMoodScale = true): this {
    this.configs.push({
      type: 'mood',
      extractSentiment,
      extractEmotions,
      extractMoodScale,
    });
    return this;
  }

  withEnergyAnalysis(extractEnergyLevel = true, extractFatigueIndicators = true, extractSleepQuality = true): this {
    this.configs.push({
      type: 'energy',
      extractEnergyLevel,
      extractFatigueIndicators,
      extractSleepQuality,
    });
    return this;
  }

  withNutritionAnalysis(extractFoodMentions = true, extractCalorieEstimates = true, extractMacros = true, extractMealTiming = true): this {
    this.configs.push({
      type: 'nutrition',
      extractFoodMentions,
      extractCalorieEstimates,
      extractMacros,
      extractMealTiming,
    });
    return this;
  }

  withTriggerAnalysis(extractStressors = true, extractCravings = true, extractRiskFactors = true, extractCopingStrategies = true): this {
    this.configs.push({
      type: 'triggers',
      extractStressors,
      extractCravings,
      extractRiskFactors,
      extractCopingStrategies,
    });
    return this;
  }

  async executeFor(journalEntryId: string): Promise<void> {
    const analysisTypes = this.configs.map(config => config.type);
    await this.analysisService.queueAnalysisForEntry(journalEntryId, analysisTypes);
  }

  async executeForAll(): Promise<void> {
    for (const config of this.configs) {
      await this.analysisService.reprocessAllEntries(config.type);
    }
  }

  getDefaultAnalysis(): this {
    return this
      .withMoodAnalysis()
      .withEnergyAnalysis();
  }

  getHealthcareAnalysis(): this {
    return this
      .withMoodAnalysis()
      .withEnergyAnalysis()
      .withTriggerAnalysis();
  }

  getNutritionAnalysis(): this {
    return this
      .withMoodAnalysis()
      .withEnergyAnalysis()
      .withNutritionAnalysis();
  }
}