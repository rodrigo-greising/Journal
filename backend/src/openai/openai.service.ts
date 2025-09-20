import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import {
  AnalysisConfig,
  MoodAnalysisResult,
  EnergyAnalysisResult,
  NutritionAnalysisResult,
  TriggerAnalysisResult,
  SleepAnalysisResult,
} from '../analysis/dto/analysis-config.dto';
import { LangfuseService } from '../langfuse/langfuse.service';

// Zod schemas for structured outputs
const MoodAnalysisSchema = z.object({
  sentiment: z.enum(['positive', 'negative', 'neutral', 'mixed']),
  emotions: z.array(z.string()),
  moodScale: z.number().min(1).max(10),
  confidence: z.number().min(0).max(1),
});

const EnergyAnalysisSchema = z.object({
  energyLevel: z.number().min(1).max(10),
  fatigueIndicators: z.array(z.string()),
  sleepQuality: z.number().min(1).max(10).nullable().optional(),
  confidence: z.number().min(0).max(1),
});

const NutritionAnalysisSchema = z.object({
  foodMentions: z.array(z.string()), // Keep as foodMentions to match frontend
  estimatedCalories: z.number().nullable().optional(),
  macros: z
    .object({
      protein: z.number().nullable().optional(),
      carbs: z.number().nullable().optional(),
      fats: z.number().nullable().optional(),
    })
    .optional(),
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

const SleepAnalysisSchema = z.object({
  sleepQuality: z.number().min(1).max(10),
  sleepDuration: z.number().nullable().optional(), // hours
  sleepPatterns: z.array(z.string()).optional(),
  sleepDisruptions: z.array(z.string()).optional(),
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
      modelName: 'gpt-5-nano-2025-08-07',
      // Note: gpt-5-nano-2025-08-07 only supports default temperature (1), custom values are not supported
    });
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    // For audio transcription, we still use the direct OpenAI API since LangChain doesn't have audio support yet
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    const transcription = await openai.audio.transcriptions.create({
      file: new File([new Uint8Array(audioBuffer)], 'audio.wav', {
        type: 'audio/wav',
      }),
      model: 'whisper-1',
      response_format: 'text',
    });

    return transcription;
  }

  async analyzeMood(
    content: string,
    journalEntryId?: string,
    userId?: string,
  ): Promise<MoodAnalysisResult> {
    const parser = StructuredOutputParser.fromZodSchema(MoodAnalysisSchema);

    const prompt = PromptTemplate.fromTemplate(`
You are a healthcare AI that analyzes journal entries for mood and emotional state.

MOOD SCALE REFERENCE:
10/10: Euphoric, ecstatic, peak happiness, boundless joy
9/10: Very happy, elated, excellent mood, highly positive
8/10: Happy, good mood, optimistic, content
7/10: Pleasant, positive, mildly upbeat
6/10: Neutral-positive, stable, okay
5/10: Neutral, baseline, neither good nor bad
4/10: Slightly down, mildly negative, subdued
3/10: Low mood, sad, disappointed, struggling
2/10: Very low, depressed, significant distress
1/10: Severely depressed, hopeless, crisis level

SENTIMENT CATEGORIES:
- positive: Generally upbeat, optimistic content
- negative: Generally sad, frustrated, distressed content
- neutral: Balanced or factual content
- mixed: Both positive and negative elements present

Extract mood information and return structured data.

{format_instructions}

Journal entry: {content}
`);

    const chain = RunnableSequence.from([prompt, this.llm, parser]);

    // Create Langfuse callback handler for tracing
    const callbackHandler = journalEntryId
      ? this.langfuseService.createAnalysisCallbackHandler(
          journalEntryId,
          'mood',
          userId,
        )
      : this.langfuseService.createCallbackHandler(
          `mood-analysis-${Date.now()}`,
          userId,
          ['mood-analysis'],
        );

    const result = await chain.invoke(
      {
        content,
        format_instructions: parser.getFormatInstructions(),
      },
      {
        callbacks: [callbackHandler],
      },
    );

    return result as MoodAnalysisResult;
  }

  async analyzeEnergy(
    content: string,
    journalEntryId?: string,
    userId?: string,
  ): Promise<EnergyAnalysisResult> {
    const parser = StructuredOutputParser.fromZodSchema(EnergyAnalysisSchema);

    const prompt = PromptTemplate.fromTemplate(`
You are a healthcare AI that analyzes journal entries for energy levels and fatigue indicators.

ENERGY SCALE REFERENCE:
10/10: Peak energy, boundless vitality, could run a marathon
9/10: Very high energy, highly motivated, very active
8/10: Good energy, active, productive, alert
7/10: Moderately good energy, can handle tasks well
6/10: Adequate energy, stable, can function normally
5/10: Neutral energy, baseline, neither high nor low
4/10: Slightly low energy, mild fatigue, less motivated
3/10: Low energy, tired, struggling with tasks
2/10: Very low energy, exhausted, significant fatigue
1/10: Severely depleted, can barely function, extreme exhaustion

SLEEP QUALITY SCALE (when mentioned):
10/10: Perfect sleep, woke up completely refreshed
8-9/10: Very good sleep, mostly refreshed
6-7/10: Good sleep, adequately rested
4-5/10: Fair sleep, somewhat rested
2-3/10: Poor sleep, tired upon waking
1/10: Terrible sleep, exhausted, no rest

{format_instructions}

Journal entry: {content}
`);

    const chain = RunnableSequence.from([prompt, this.llm, parser]);

    // Create Langfuse callback handler for tracing
    const callbackHandler = journalEntryId
      ? this.langfuseService.createAnalysisCallbackHandler(
          journalEntryId,
          'energy',
          userId,
        )
      : this.langfuseService.createCallbackHandler(
          `energy-analysis-${Date.now()}`,
          userId,
          ['energy-analysis'],
        );

    const result = await chain.invoke(
      {
        content,
        format_instructions: parser.getFormatInstructions(),
      },
      {
        callbacks: [callbackHandler],
      },
    );

    return result as EnergyAnalysisResult;
  }

  async analyzeNutrition(
    content: string,
    journalEntryId?: string,
    userId?: string,
  ): Promise<NutritionAnalysisResult> {
    const parser = StructuredOutputParser.fromZodSchema(
      NutritionAnalysisSchema,
    );

    const prompt = PromptTemplate.fromTemplate(`
You are a healthcare AI that analyzes journal entries for nutrition and food-related information.

FOOD MENTIONS TO IDENTIFY:
- Specific foods mentioned: List exact foods mentioned (e.g., "oatmeal", "grilled chicken", "salad")
- Food categories: Group similar foods (e.g., "fruits", "vegetables", "whole grains")
- Include both specific items and general categories
- Examples: "oatmeal", "blueberries", "almonds", "grilled chicken", "salad", "quinoa", "salmon", "sweet potato"

CALORIE ESTIMATION GUIDELINES:
- Light meal: 200-400 calories
- Moderate meal: 400-700 calories
- Large meal: 700-1000+ calories
- Snack: 50-200 calories

MACRO ESTIMATION GUIDELINES:
- Protein: Estimate grams based on protein sources (meat, fish, eggs, dairy, legumes)
- Carbs: Estimate grams based on grains, fruits, vegetables, sugars
- Fats: Estimate grams based on oils, nuts, avocados, fatty proteins

MACRO EXAMPLES:
- Grilled salmon (6oz): ~40g protein, ~0g carbs, ~15g fats
- Quinoa (1 cup): ~8g protein, ~40g carbs, ~4g fats
- Banana: ~1g protein, ~25g carbs, ~0g fats
- Protein smoothie: ~25g protein, ~15g carbs, ~5g fats

Only provide macro estimates when specific foods and reasonable portions are mentioned.

{format_instructions}

Journal entry: {content}
`);

    const chain = RunnableSequence.from([prompt, this.llm, parser]);

    // Create Langfuse callback handler for tracing
    const callbackHandler = journalEntryId
      ? this.langfuseService.createAnalysisCallbackHandler(
          journalEntryId,
          'nutrition',
          userId,
        )
      : this.langfuseService.createCallbackHandler(
          `nutrition-analysis-${Date.now()}`,
          userId,
          ['nutrition-analysis'],
        );

    const result = await chain.invoke(
      {
        content,
        format_instructions: parser.getFormatInstructions(),
      },
      {
        callbacks: [callbackHandler],
      },
    );

    return result as NutritionAnalysisResult;
  }

  async analyzeTriggers(
    content: string,
    journalEntryId?: string,
    userId?: string,
  ): Promise<TriggerAnalysisResult> {
    const parser = StructuredOutputParser.fromZodSchema(TriggerAnalysisSchema);

    const prompt = PromptTemplate.fromTemplate(`
You are a healthcare AI that analyzes journal entries for addiction treatment triggers, stressors, and coping strategies.

{format_instructions}

Journal entry: {content}
`);

    const chain = RunnableSequence.from([prompt, this.llm, parser]);

    // Create Langfuse callback handler for tracing
    const callbackHandler = journalEntryId
      ? this.langfuseService.createAnalysisCallbackHandler(
          journalEntryId,
          'triggers',
          userId,
        )
      : this.langfuseService.createCallbackHandler(
          `triggers-analysis-${Date.now()}`,
          userId,
          ['triggers-analysis'],
        );

    const result = await chain.invoke(
      {
        content,
        format_instructions: parser.getFormatInstructions(),
      },
      {
        callbacks: [callbackHandler],
      },
    );

    return result as TriggerAnalysisResult; // Updated to use 'stressor' instead of 'stressors'
  }

  async analyzeSleep(
    content: string,
    journalEntryId?: string,
    userId?: string,
  ): Promise<SleepAnalysisResult> {
    const parser = StructuredOutputParser.fromZodSchema(SleepAnalysisSchema);

    const prompt = PromptTemplate.fromTemplate(`
You are a healthcare AI that analyzes journal entries for sleep-related information.

SLEEP QUALITY INDICATORS:
- Sleep quality (1-10 scale): Based on mentions of restfulness, energy levels, sleep satisfaction
- Sleep duration: Look for specific hours mentioned or duration descriptions
- Sleep patterns: Regular bedtime, wake time, sleep schedule consistency
- Sleep disruptions: Insomnia, waking up frequently, nightmares, external disturbances

SLEEP QUALITY SCALE:
- 1-3: Poor sleep (insomnia, frequent waking, feeling exhausted)
- 4-6: Fair sleep (some disruptions but generally restful)
- 7-8: Good sleep (restful, adequate duration, minimal disruptions)
- 9-10: Excellent sleep (deeply restful, perfect duration, no disruptions)

{format_instructions}

Journal entry: {content}
`);

    const chain = RunnableSequence.from([prompt, this.llm, parser]);

    // Create Langfuse callback handler for tracing
    const callbackHandler = journalEntryId
      ? this.langfuseService.createAnalysisCallbackHandler(
          journalEntryId,
          'sleep',
          userId,
        )
      : this.langfuseService.createCallbackHandler(
          `sleep-analysis-${Date.now()}`,
          userId,
          ['sleep-analysis'],
        );

    const result = await chain.invoke(
      {
        content,
        format_instructions: parser.getFormatInstructions(),
      },
      {
        callbacks: [callbackHandler],
      },
    );

    return result as SleepAnalysisResult;
  }
}
