import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { AnalysisConfig, MoodAnalysisResult, EnergyAnalysisResult, NutritionAnalysisResult, TriggerAnalysisResult } from '../analysis/dto/analysis-config.dto';
import { LangfuseService } from '../langfuse/langfuse.service';

// Zod schemas for structured outputs
const MoodAnalysisSchema = z.object({
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  emotions: z.array(z.string()),
  moodScale: z.number().min(1).max(10),
  confidence: z.number().min(0).max(1),
});

const EnergyAnalysisSchema = z.object({
  energyLevel: z.number().min(1).max(10),
  fatigueIndicators: z.array(z.string()),
  sleepQuality: z.number().min(1).max(10).optional(),
  confidence: z.number().min(0).max(1),
});

const NutritionAnalysisSchema = z.object({
  foodMentions: z.array(z.string()),
  estimatedCalories: z.number().optional(),
  macros: z.object({
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fats: z.number().optional(),
  }).optional(),
  mealTiming: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1),
});

const TriggerAnalysisSchema = z.object({
  stressor: z.array(z.string()),
  cravings: z.array(z.string()),
  riskFactors: z.array(z.string()),
  copingStrategies: z.array(z.string()),
  riskLevel: z.enum(['low', 'medium', 'high']),
  confidence: z.number().min(0).max(1),
});

@Injectable()
export class OpenAIService {
  private llm: ChatOpenAI;

  constructor(
    private configService: ConfigService,
    private langfuseService: LangfuseService,
  ) {
    this.llm = new ChatOpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-4o-mini',
      temperature: 0.1,
    });
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    // For audio transcription, we still use the direct OpenAI API since LangChain doesn't have audio support yet
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    const transcription = await openai.audio.transcriptions.create({
      file: new File([new Uint8Array(audioBuffer)], 'audio.wav', { type: 'audio/wav' }),
      model: 'whisper-1',
      response_format: 'text',
    });

    return transcription;
  }

  async analyzeMood(content: string, journalEntryId?: string, userId?: string): Promise<MoodAnalysisResult> {
    const parser = StructuredOutputParser.fromZodSchema(MoodAnalysisSchema);
    
    const prompt = PromptTemplate.fromTemplate(`
You are a healthcare AI that analyzes journal entries for mood and emotional state.
Extract mood information and return structured data.

{format_instructions}

Journal entry: {content}
`);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      parser,
    ]);

    // Create Langfuse callback handler for tracing
    const callbackHandler = journalEntryId 
      ? this.langfuseService.createAnalysisCallbackHandler(journalEntryId, 'mood', userId)
      : this.langfuseService.createCallbackHandler(
          `mood-analysis-${Date.now()}`,
          userId,
          ['mood-analysis']
        );

    const result = await chain.invoke({
      content,
      format_instructions: parser.getFormatInstructions(),
    }, {
      callbacks: [callbackHandler],
    });

    return result as MoodAnalysisResult;
  }

  async analyzeEnergy(content: string, journalEntryId?: string, userId?: string): Promise<EnergyAnalysisResult> {
    const parser = StructuredOutputParser.fromZodSchema(EnergyAnalysisSchema);
    
    const prompt = PromptTemplate.fromTemplate(`
You are a healthcare AI that analyzes journal entries for energy levels and fatigue indicators.

{format_instructions}

Journal entry: {content}
`);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      parser,
    ]);

    // Create Langfuse callback handler for tracing
    const callbackHandler = journalEntryId 
      ? this.langfuseService.createAnalysisCallbackHandler(journalEntryId, 'energy', userId)
      : this.langfuseService.createCallbackHandler(
          `energy-analysis-${Date.now()}`,
          userId,
          ['energy-analysis']
        );

    const result = await chain.invoke({
      content,
      format_instructions: parser.getFormatInstructions(),
    }, {
      callbacks: [callbackHandler],
    });

    return result as EnergyAnalysisResult;
  }

  async analyzeNutrition(content: string, journalEntryId?: string, userId?: string): Promise<NutritionAnalysisResult> {
    const parser = StructuredOutputParser.fromZodSchema(NutritionAnalysisSchema);
    
    const prompt = PromptTemplate.fromTemplate(`
You are a healthcare AI that analyzes journal entries for nutrition and food-related information.

{format_instructions}

Journal entry: {content}
`);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      parser,
    ]);

    // Create Langfuse callback handler for tracing
    const callbackHandler = journalEntryId 
      ? this.langfuseService.createAnalysisCallbackHandler(journalEntryId, 'nutrition', userId)
      : this.langfuseService.createCallbackHandler(
          `nutrition-analysis-${Date.now()}`,
          userId,
          ['nutrition-analysis']
        );

    const result = await chain.invoke({
      content,
      format_instructions: parser.getFormatInstructions(),
    }, {
      callbacks: [callbackHandler],
    });

    return result as NutritionAnalysisResult;
  }

  async analyzeTriggers(content: string, journalEntryId?: string, userId?: string): Promise<TriggerAnalysisResult> {
    const parser = StructuredOutputParser.fromZodSchema(TriggerAnalysisSchema);
    
    const prompt = PromptTemplate.fromTemplate(`
You are a healthcare AI that analyzes journal entries for addiction treatment triggers, stressors, and coping strategies.

{format_instructions}

Journal entry: {content}
`);

    const chain = RunnableSequence.from([
      prompt,
      this.llm,
      parser,
    ]);

    // Create Langfuse callback handler for tracing
    const callbackHandler = journalEntryId 
      ? this.langfuseService.createAnalysisCallbackHandler(journalEntryId, 'triggers', userId)
      : this.langfuseService.createCallbackHandler(
          `triggers-analysis-${Date.now()}`,
          userId,
          ['triggers-analysis']
        );

    const result = await chain.invoke({
      content,
      format_instructions: parser.getFormatInstructions(),
    }, {
      callbacks: [callbackHandler],
    });

    return result as TriggerAnalysisResult; // Updated to use 'stressor' instead of 'stressors'
  }
}