import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from backend/.env and repo root .env if present
dotenv.config();
if (!process.env.OPENAI_API_KEY) {
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
}

interface GeneratorOptions {
  outputDir: string;
  startOffset: number;
  endOffset: number;
  model: string;
  targetWords: number;
  minWords: number;
  maxWords: number;
  dryRun: boolean;
}

interface TestJournalEntryFile {
  content: string;
  type: 'text';
  dateOffset: number;
  expectedAnalysis?: {
    mood?: {
      moodScale: number;
      sentiment: string;
      emotions: string[];
    };
    energy?: {
      energyLevel: number;
      fatigueIndicators: string[];
      sleepQuality?: number;
    };
    nutrition?: {
      foodMentions: string[];
      calorieEstimate?: number;
      macros?: {
        protein: number;
        carbs: number;
        fat: number;
      };
    };
    triggers?: {
      stressors: string[];
      cravings?: string[];
      riskFactors?: string[];
    };
  };
}

interface TargetScores {
  mood: number; // 1-10
  energy: number; // 1-10
  sleepQuality: number; // 1-10
  nutritionQuality: number; // 1-10 (derived from food choices)
  stressLevel: number; // 1-10 (inverse of mood for triggers)
}

interface HealthCondition {
  name: string;
  symptoms: string[];
  triggers: string[];
  copingStrategies: string[];
  medications?: string[];
  lifestyleFactors: string[];
  severity: 'mild' | 'moderate' | 'severe';
  onsetDay?: number; // When condition starts affecting the person
  remissionDay?: number; // When condition goes into remission
}

interface HealthJourney {
  conditions: HealthCondition[];
  medications: string[];
  doctorVisits: { day: number; reason: string; outcome: string }[];
  lifestyleChanges: { day: number; change: string; impact: string }[];
}

function parseArgs(argv: string[]): GeneratorOptions {
  const args = new Map<string, string>();
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const [key, val] = arg.split('=');
      if (val !== undefined) args.set(key, val);
      else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        args.set(key, argv[++i]);
      } else {
        args.set(key, 'true');
      }
    }
  }

  const outputDir = args.get('--out') || args.get('--output') || path.resolve(process.cwd(), 'generated-journal');
  const startOffset = Number(args.get('--start') ?? -180);
  const endOffset = Number(args.get('--end') ?? -1);
  const model = args.get('--model') || process.env.JOURNAL_GEN_MODEL || 'gpt-5-nano-2025-08-07';
  const targetWords = Number(args.get('--words') ?? 1000);
  const tolerance = Number(args.get('--tolerance') ?? 100); // +/- words
  const minWords = Number(args.get('--minWords') ?? targetWords - tolerance);
  const maxWords = Number(args.get('--maxWords') ?? targetWords + tolerance);
  const dryRun = (args.get('--dryRun') ?? 'false') === 'true';

  if (!Number.isFinite(startOffset) || !Number.isFinite(endOffset)) {
    throw new Error('Invalid --start/--end offsets.');
  }
  if (startOffset > endOffset) {
    throw new Error('--start must be less than or equal to --end (e.g., --start -180 --end -1).');
  }
  if (!Number.isFinite(targetWords) || targetWords <= 0) {
    throw new Error('Invalid --words value.');
  }

  return {
    outputDir: path.resolve(outputDir),
    startOffset,
    endOffset,
    model,
    targetWords,
    minWords,
    maxWords,
    dryRun,
  };
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function generateHealthJourney(days: number): HealthJourney {
  const conditions: HealthCondition[] = [];
  const doctorVisits: { day: number; reason: string; outcome: string }[] = [];
  const lifestyleChanges: { day: number; change: string; impact: string }[] = [];
  
  // Define realistic health conditions that could develop over 6 months
  const possibleConditions = [
    {
      name: 'Generalized Anxiety Disorder',
      symptoms: ['racing heart', 'sweating', 'restlessness', 'difficulty concentrating', 'muscle tension'],
      triggers: ['work stress', 'social situations', 'financial worries', 'health concerns'],
      copingStrategies: ['deep breathing', 'meditation', 'exercise', 'therapy', 'medication'],
      medications: ['sertraline', 'buspirone', 'lorazepam'],
      lifestyleFactors: ['caffeine reduction', 'regular sleep', 'stress management'],
      severity: 'moderate' as const,
      onsetDay: Math.floor(days * 0.1), // Starts around day 18
      remissionDay: Math.floor(days * 0.7) // Improves around day 126
    },
    {
      name: 'Insomnia',
      symptoms: ['difficulty falling asleep', 'waking frequently', 'early morning awakening', 'daytime fatigue'],
      triggers: ['stress', 'caffeine', 'screen time', 'irregular schedule'],
      copingStrategies: ['sleep hygiene', 'melatonin', 'meditation', 'regular bedtime'],
      medications: ['melatonin', 'trazodone', 'zolpidem'],
      lifestyleFactors: ['no screens before bed', 'cool room', 'dark environment'],
      severity: 'mild' as const,
      onsetDay: Math.floor(days * 0.05), // Starts early
      remissionDay: Math.floor(days * 0.6) // Improves around day 108
    },
    {
      name: 'Depression',
      symptoms: ['persistent sadness', 'loss of interest', 'fatigue', 'sleep changes', 'appetite changes'],
      triggers: ['life stress', 'seasonal changes', 'social isolation', 'work pressure'],
      copingStrategies: ['therapy', 'exercise', 'social connection', 'medication'],
      medications: ['fluoxetine', 'sertraline', 'bupropion'],
      lifestyleFactors: ['regular exercise', 'social activities', 'sunlight exposure'],
      severity: 'moderate' as const,
      onsetDay: Math.floor(days * 0.2), // Starts around day 36
      remissionDay: Math.floor(days * 0.8) // Improves around day 144
    },
    {
      name: 'Migraine',
      symptoms: ['severe headache', 'nausea', 'light sensitivity', 'sound sensitivity', 'aura'],
      triggers: ['stress', 'hormonal changes', 'certain foods', 'weather changes'],
      copingStrategies: ['dark room', 'cold compress', 'medication', 'preventive measures'],
      medications: ['sumatriptan', 'ibuprofen', 'acetaminophen'],
      lifestyleFactors: ['regular meals', 'adequate sleep', 'stress reduction'],
      severity: 'severe' as const,
      onsetDay: Math.floor(days * 0.15), // Starts around day 27
      remissionDay: Math.floor(days * 0.75) // Improves around day 135
    },
    {
      name: 'Irritable Bowel Syndrome',
      symptoms: ['abdominal pain', 'bloating', 'diarrhea', 'constipation', 'gas'],
      triggers: ['stress', 'certain foods', 'irregular eating', 'caffeine'],
      copingStrategies: ['diet modification', 'stress management', 'probiotics', 'fiber'],
      medications: ['dicyclomine', 'loperamide', 'probiotics'],
      lifestyleFactors: ['regular meals', 'fiber intake', 'stress reduction'],
      severity: 'mild' as const,
      onsetDay: Math.floor(days * 0.25), // Starts around day 45
      remissionDay: Math.floor(days * 0.85) // Improves around day 153
    }
  ];
  
  // Select 2-3 conditions that develop over the journey
  const selectedConditions = possibleConditions.slice(0, 3);
  conditions.push(...selectedConditions);
  
  // Generate doctor visits based on conditions
  selectedConditions.forEach(condition => {
    if (condition.onsetDay) {
      // Initial visit when symptoms start
      doctorVisits.push({
        day: condition.onsetDay + 7, // Visit doctor a week after symptoms start
        reason: `Concerned about ${condition.symptoms.slice(0, 2).join(' and ')}`,
        outcome: `Diagnosed with ${condition.name}. Prescribed ${condition.medications?.[0] || 'lifestyle changes'}.`
      });
      
      // Follow-up visit
      doctorVisits.push({
        day: condition.onsetDay + 30,
        reason: `Follow-up for ${condition.name}`,
        outcome: condition.severity === 'severe' ?
          `Symptoms worsening. Increased medication dosage.` :
          `Symptoms improving. Continue current treatment.`
      });
      
      // Final visit when condition improves
      if (condition.remissionDay) {
        doctorVisits.push({
          day: condition.remissionDay + 14,
          reason: `Follow-up for ${condition.name}`,
          outcome: `Significant improvement. Consider reducing medication.`
        });
      }
    }
  });
  
  // Generate lifestyle changes
  selectedConditions.forEach(condition => {
    if (condition.onsetDay) {
      condition.lifestyleFactors.forEach((factor, index) => {
        lifestyleChanges.push({
          day: condition.onsetDay! + (index * 7), // Staggered implementation
          change: factor,
          impact: `Implemented to help manage ${condition.name}`
        });
      });
    }
  });
  
  // Add some general health improvements
  lifestyleChanges.push(
    { day: Math.floor(days * 0.1), change: 'Started daily walks', impact: 'Improved mood and energy' },
    { day: Math.floor(days * 0.3), change: 'Reduced caffeine intake', impact: 'Better sleep quality' },
    { day: Math.floor(days * 0.5), change: 'Started meal prep', impact: 'More consistent nutrition' },
    { day: Math.floor(days * 0.7), change: 'Added meditation practice', impact: 'Reduced stress and anxiety' }
  );
  
  return {
    conditions,
    medications: selectedConditions.flatMap(c => c.medications || []),
    doctorVisits,
    lifestyleChanges
  };
}

function generateProgressionWithNoise(
  day: number,
  totalDays: number,
  startValue: number,
  endValue: number,
  noiseAmplitude: number = 0.5,
  cycleLength: number = 7
): number {
  const progress = day / totalDays; // 0 to 1

  // Main upward trend using sigmoid-like function for more realistic progression
  const sigmoidFactor = 6; // Controls steepness of the curve
  const sigmoidProgress = 1 / (1 + Math.exp(-sigmoidFactor * (progress - 0.5)));
  const trendValue = startValue + (endValue - startValue) * sigmoidProgress;

  // Add cyclical noise (weekly patterns)
  const weeklyNoise = Math.sin((day / cycleLength) * Math.PI * 2) * noiseAmplitude;

  // Add random noise with Perlin-like smoothness
  const randomNoise = (Math.sin(day * 0.1) * Math.cos(day * 0.07) * Math.sin(day * 0.13)) * noiseAmplitude * 0.8;

  // Add monthly variations
  const monthlyPhase = (day % 30) / 30;
  const monthlyNoise = Math.sin(monthlyPhase * Math.PI * 2) * noiseAmplitude * 0.6;

  return trendValue + weeklyNoise + randomNoise + monthlyNoise;
}

function generateScorePattern(days: number, healthJourney: HealthJourney): TargetScores[] {
  const scores: TargetScores[] = [];

  for (let day = 0; day < days; day++) {
    const progress = day / days; // 0 to 1
    const weekPhase = (day % 7) / 7; // 0 to 1 within each week

    // Use the new progression function for more realistic trends
    const moodBase = generateProgressionWithNoise(day, days, 2.5, 6.5, 0.8, 7);
    const energyBase = generateProgressionWithNoise(day, days, 2.8, 6.2, 0.7, 7);
    const sleepBase = generateProgressionWithNoise(day, days, 3.2, 6.8, 1.0, 7);
    const nutritionBase = generateProgressionWithNoise(day, days, 2.2, 6.5, 0.6, 7);
    const stressBase = generateProgressionWithNoise(day, days, 8.5, 4.0, 0.8, 7); // Stress decreases

    // Add specific day-of-week effects
    const moodMonday = weekPhase < 0.15 ? -0.4 : 0; // Monday blues
    const moodWeekend = weekPhase > 0.7 ? 0.6 : 0; // Weekend boost
    const energyMonday = weekPhase < 0.15 ? -0.3 : 0;
    const energyWeekend = weekPhase > 0.7 ? 0.4 : 0;
    const sleepWeekend = weekPhase > 0.7 ? 0.8 : 0; // Better weekend sleep
    const nutritionWeekend = weekPhase > 0.7 ? 0.3 : 0; // Slightly better weekend eating
    const stressMonday = weekPhase < 0.15 ? 0.5 : 0; // Monday stress
    const stressWeekend = weekPhase > 0.7 ? -0.4 : 0; // Weekend relief

    // Add stress events with recovery periods
    const stressEvents = calculateStressImpact(day, 45, 1.8, -0.5); // Major stress every 45 days
    const moodStress = calculateStressImpact(day, 45, -1.2, 0.8);
    const energyStress = calculateStressImpact(day, 45, -0.8, 0.5);
    const sleepStress = calculateStressImpact(day, 45, -1.5, 1.0);
    const nutritionStress = calculateStressImpact(day, 45, -0.9, 0.6);
    
    // Apply health condition impacts
    const healthImpacts = calculateHealthImpacts(day, healthJourney);

    // Combine all factors for final scores
    const dayScores: TargetScores = {
      mood: Math.max(1, Math.min(10, Math.round(
        moodBase + moodMonday + moodWeekend + moodStress + healthImpacts.mood
      ))),
      energy: Math.max(1, Math.min(10, Math.round(
        energyBase + energyMonday + energyWeekend + energyStress + healthImpacts.energy
      ))),
      sleepQuality: Math.max(1, Math.min(10, Math.round(
        sleepBase + sleepWeekend + sleepStress + healthImpacts.sleep
      ))),
      nutritionQuality: Math.max(1, Math.min(10, Math.round(
        nutritionBase + nutritionWeekend + nutritionStress + healthImpacts.nutrition
      ))),
      stressLevel: Math.max(1, Math.min(10, Math.round(
        stressBase + stressMonday + stressWeekend + stressEvents + healthImpacts.stress
      ))),
    };
    
    scores.push(dayScores);
  }
  
  return scores;
}

function calculateHealthImpacts(day: number, healthJourney: HealthJourney): { mood: number; energy: number; sleep: number; nutrition: number; stress: number } {
  let impacts = { mood: 0, energy: 0, sleep: 0, nutrition: 0, stress: 0 };

  healthJourney.conditions.forEach(condition => {
    if (condition.onsetDay && condition.remissionDay) {
      // Check if condition is active on this day
      if (day >= condition.onsetDay && day <= condition.remissionDay) {
        const severity = condition.severity;
        const multiplier = severity === 'mild' ? 0.5 : severity === 'moderate' ? 1.0 : 1.5;

        // Apply condition-specific impacts
        switch (condition.name) {
          case 'Generalized Anxiety Disorder':
            impacts.mood -= 1.5 * multiplier;
            impacts.stress += 2.0 * multiplier;
            impacts.sleep -= 1.0 * multiplier;
            break;
          case 'Insomnia':
            impacts.sleep -= 2.0 * multiplier;
            impacts.energy -= 1.5 * multiplier;
            impacts.mood -= 0.8 * multiplier;
            break;
          case 'Depression':
            impacts.mood -= 2.5 * multiplier;
            impacts.energy -= 2.0 * multiplier;
            impacts.nutrition -= 1.0 * multiplier;
            break;
          case 'Migraine':
            impacts.mood -= 1.8 * multiplier;
            impacts.energy -= 2.2 * multiplier;
            impacts.stress += 1.5 * multiplier;
            break;
          case 'Irritable Bowel Syndrome':
            impacts.nutrition -= 1.5 * multiplier;
            impacts.stress += 1.2 * multiplier;
            impacts.mood -= 0.8 * multiplier;
            break;
        }
      }
    }
  });

  // Apply lifestyle changes
  healthJourney.lifestyleChanges.forEach(change => {
    if (day >= change.day) {
      // Positive impacts from lifestyle changes
      switch (change.change) {
        case 'Started daily walks':
          impacts.mood += 0.3;
          impacts.energy += 0.4;
          break;
        case 'Reduced caffeine intake':
          impacts.sleep += 0.5;
          impacts.stress -= 0.3;
          break;
        case 'Started meal prep':
          impacts.nutrition += 0.6;
          break;
        case 'Added meditation practice':
          impacts.stress -= 0.8;
          impacts.mood += 0.4;
          break;
      }
    }
  });

  return impacts;
}

function calculateStressImpact(day: number, cycleLength: number, stressMagnitude: number, recoveryMagnitude: number): number {
  const cyclePosition = day % cycleLength;
  
  // Stress period (first 20% of cycle)
  if (cyclePosition < cycleLength * 0.2) {
    const stressIntensity = 1 - (cyclePosition / (cycleLength * 0.2)); // 1 → 0
    return stressMagnitude * stressIntensity;
  }
  
  // Recovery period (next 30% of cycle)
  if (cyclePosition < cycleLength * 0.5) {
    const recoveryIntensity = (cyclePosition - cycleLength * 0.2) / (cycleLength * 0.3); // 0 → 1
    return recoveryMagnitude * recoveryIntensity;
  }
  
  // Normal period (remaining 50% of cycle)
  return 0;
}

function generateExpectedAnalysis(scores: TargetScores): any {
  return {
    mood: generateMoodAnalysis(scores.mood),
    energy: generateEnergyAnalysis(scores.energy, scores.sleepQuality),
    nutrition: generateNutritionAnalysis(scores.nutritionQuality),
    triggers: generateTriggerAnalysis(scores.stressLevel, scores.mood)
  };
}

function generateMoodAnalysis(moodScore: number): any {
  const sentiment = moodScore <= 2 ? 'negative' : moodScore <= 4 ? 'negative' : moodScore <= 6 ? 'neutral' : moodScore <= 8 ? 'positive' : 'positive';
  
  const emotionSets = {
    low: ['sad', 'frustrated', 'anxious', 'overwhelmed', 'hopeless'],
    lowMid: ['tired', 'discouraged', 'worried', 'stressed'],
    neutral: ['neutral', 'calm', 'stable', 'focused'],
    midHigh: ['content', 'hopeful', 'motivated', 'peaceful'],
    high: ['happy', 'optimistic', 'energized', 'grateful', 'confident']
  };
  
  let emotions: string[];
  if (moodScore <= 2) emotions = emotionSets.low;
  else if (moodScore <= 4) emotions = emotionSets.lowMid;
  else if (moodScore <= 6) emotions = emotionSets.neutral;
  else if (moodScore <= 8) emotions = emotionSets.midHigh;
  else emotions = emotionSets.high;
  
  // Select 2-3 emotions based on score intensity
  const numEmotions = moodScore <= 3 ? 3 : moodScore <= 7 ? 2 : 2;
  const selectedEmotions = emotions.slice(0, numEmotions);
  
  return {
    moodScale: moodScore,
    sentiment,
    emotions: selectedEmotions
  };
}

function generateEnergyAnalysis(energyScore: number, sleepScore: number): any {
  const fatigueSets = {
    low: ['exhausted', 'drained', 'lethargic', 'weak', 'sluggish'],
    lowMid: ['tired', 'low energy', 'fatigued', 'sluggish'],
    neutral: ['moderate energy', 'stable', 'adequate'],
    midHigh: ['energetic', 'alert', 'active', 'vital'],
    high: ['high energy', 'energized', 'vibrant', 'dynamic', 'peppy']
  };
  
  let fatigueIndicators: string[];
  if (energyScore <= 2) fatigueIndicators = fatigueSets.low;
  else if (energyScore <= 4) fatigueIndicators = fatigueSets.lowMid;
  else if (energyScore <= 6) fatigueIndicators = fatigueSets.neutral;
  else if (energyScore <= 8) fatigueIndicators = fatigueSets.midHigh;
  else fatigueIndicators = fatigueSets.high;
  
  // Select appropriate number of indicators
  const numIndicators = energyScore <= 3 ? 3 : energyScore <= 7 ? 2 : 1;
  const selectedIndicators = fatigueIndicators.slice(0, numIndicators);
  
  return {
    energyLevel: energyScore,
    fatigueIndicators: selectedIndicators,
    sleepQuality: sleepScore
  };
}

function generateNutritionAnalysis(nutritionScore: number): any {
  const foodSets = {
    poor: ['processed foods', 'fast food', 'junk food', 'convenience meals', 'snacks', 'sugary drinks'],
    fair: ['mixed meals', 'some vegetables', 'occasional fast food', 'basic cooking'],
    good: ['home cooked meals', 'vegetables', 'fruits', 'whole grains', 'lean protein'],
    excellent: ['whole foods', 'fresh vegetables', 'organic produce', 'balanced meals', 'nutritious choices', 'meal prep']
  };
  
  let foodMentions: string[];
  if (nutritionScore <= 2) foodMentions = foodSets.poor;
  else if (nutritionScore <= 4) foodMentions = foodSets.fair;
  else if (nutritionScore <= 7) foodMentions = foodSets.good;
  else foodMentions = foodSets.excellent;
  
  // Select 3-5 food mentions based on score
  const numFoods = nutritionScore <= 3 ? 4 : nutritionScore <= 6 ? 3 : 3;
  const selectedFoods = foodMentions.slice(0, numFoods);
  
  // Add calorie estimate based on nutrition quality
  let calorieEstimate: number | undefined;
  if (nutritionScore <= 3) calorieEstimate = 1800 + Math.random() * 400; // 1800-2200 (poor choices)
  else if (nutritionScore <= 6) calorieEstimate = 1600 + Math.random() * 300; // 1600-1900 (mixed)
  else calorieEstimate = 1400 + Math.random() * 400; // 1400-1800 (good choices)
  
  return {
    foodMentions: selectedFoods,
    calorieEstimate: Math.round(calorieEstimate)
  };
}

function generateTriggerAnalysis(stressScore: number, moodScore: number): any {
  const stressorSets = {
    low: ['low stress', 'manageable tasks', 'routine work'],
    moderate: ['daily challenges', 'minor deadlines', 'work pressure', 'time constraints'],
    high: ['major deadlines', 'work pressure', 'anxiety', 'overwhelm', 'crisis situations', 'conflict']
  };
  
  let stressors: string[];
  if (stressScore <= 3) stressors = stressorSets.low;
  else if (stressScore <= 6) stressors = stressorSets.moderate;
  else stressors = stressorSets.high;
  
  const numStressors = stressScore <= 3 ? 1 : stressScore <= 6 ? 2 : 3;
  const selectedStressors = stressors.slice(0, numStressors);
  
  // Risk factors based on stress and mood combination
  const riskFactors: string[] = [];
  if (stressScore >= 8) riskFactors.push('high stress');
  if (moodScore <= 2) riskFactors.push('depression risk');
  if (stressScore >= 7 && moodScore <= 3) riskFactors.push('burnout risk');
  if (stressScore >= 6) riskFactors.push('anxiety');
  
  return {
    stressors: selectedStressors,
    riskFactors
  };
}

function scoresToContext(scores: TargetScores, dayOffset: number): string {
  const moodDesc = scores.mood <= 3 ? 'low mood, struggling' : 
                   scores.mood <= 6 ? 'neutral mood, stable' : 
                   'positive mood, feeling good';
  
  const energyDesc = scores.energy <= 3 ? 'low energy, fatigued' :
                     scores.energy <= 6 ? 'moderate energy, stable' :
                     'high energy, energetic';
  
  const sleepDesc = scores.sleepQuality <= 3 ? 'poor sleep, restless' :
                    scores.sleepQuality <= 6 ? 'fair sleep, some disruption' :
                    'good sleep, restful';
  
  const nutritionDesc = scores.nutritionQuality <= 3 ? 'poor nutrition, processed foods' :
                        scores.nutritionQuality <= 6 ? 'mixed nutrition, some healthy choices' :
                        'good nutrition, whole foods';
  
  const stressDesc = scores.stressLevel <= 3 ? 'low stress, calm' :
                     scores.stressLevel <= 6 ? 'moderate stress, manageable' :
                     'high stress, overwhelmed';
  
  return [
    `Today's psychological state: ${moodDesc} (mood: ${scores.mood}/10)`,
    `Energy levels: ${energyDesc} (energy: ${scores.energy}/10)`,
    `Sleep quality: ${sleepDesc} (sleep: ${scores.sleepQuality}/10)`,
    `Nutrition choices: ${nutritionDesc} (nutrition: ${scores.nutritionQuality}/10)`,
    `Stress level: ${stressDesc} (stress: ${scores.stressLevel}/10)`,
  ].join('. ');
}

function buildSystemPrompt(targetWords: number, minWords: number, maxWords: number): string {
  return [
    'You are a skilled journal ghostwriter.',
    'Write realistic first-person daily journal entries that feel lived-in and grounded.',
    'Include everyday details (sleep, food, energy, mood, work, relationships, movement).',
    'Maintain a compassionate, reflective tone without therapy-speak or moralizing.',
    'Avoid bullet lists, headers, or meta commentary—just the journal entry text.',
    `Length: approximately ${targetWords} words (acceptable range ${minWords}-${maxWords}).`,
    'Write in past tense. Do not include dates, titles, or labels. No disclaimers.',
  ].join(' ');
}

function buildUserPrompt(dateOffset: number, targetScores: TargetScores): string {
  const scoreContext = scoresToContext(targetScores, dateOffset);
  
  return [
    `Write today\'s journal entry for day offset ${dateOffset} (negative = past days).`,
    'This is part of a six-month personal journey with natural ups and downs.',
    'Focus on a coherent day-in-the-life narrative with specific sensations and observations.',
    'If decisions or changes were made recently, reflect lightly on their impact today.',
    'Do not recap the entire journey; keep scope to this single day while feeling connected to a broader arc.',
    '',
    `TARGET STATE FOR TODAY: ${scoreContext}`,
    'Write the journal entry to naturally reflect these psychological and physical states through specific details about sleep, food choices, energy levels, mood, and stress responses.',
  ].join(' ');
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function writeJsonFile(outputDir: string, offset: number, content: string, targetScores?: TargetScores): Promise<string> {
  const filename = `entry-${offset}.json`;
  const filePath = path.join(outputDir, filename);
  
  const data: TestJournalEntryFile = { 
    content: content.trim(), 
    type: 'text', 
    dateOffset: offset 
  };
  
  if (targetScores) {
    data.expectedAnalysis = generateExpectedAnalysis(targetScores);
  }
  
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  return filePath;
}

function withTokenParam<T extends Record<string, unknown>>(req: T, model: string, maxTokens: number): T {
  const r: any = { ...req };
  if (/gpt-5/i.test(model)) {
    r.max_completion_tokens = maxTokens;
  } else {
    r.max_tokens = maxTokens;
  }
  return r as T;
}

async function generateEntryText(openai: OpenAI, model: string, systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
  const req: any = withTokenParam({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  }, model, maxTokens);
  const completion = await openai.chat.completions.create(req as any);
  const text = completion.choices?.[0]?.message?.content ?? '';
  return text.trim();
}

async function refineToTargetLength(openai: OpenAI, model: string, baseText: string, targetWords: number, minWords: number, maxWords: number, maxTokens: number): Promise<string> {
  const direction = countWords(baseText) < minWords ? 'expand' : 'condense';
  const prompt = [
    `Please ${direction} the following journal entry to approximately ${targetWords} words (acceptable range ${minWords}-${maxWords}).`,
    'Keep the voice, details, and flow. Do not add a title or meta commentary.',
    'Return only the revised journal entry text.',
  ].join(' ');

  const req: any = withTokenParam({
    model,
    messages: [
      { role: 'system', content: 'You refine writing to a target word count while preserving tone and meaning.' },
      { role: 'user', content: prompt },
      { role: 'user', content: baseText },
    ],
  }, model, maxTokens);
  const completion = await openai.chat.completions.create(req as any);
  return (completion.choices?.[0]?.message?.content ?? '').trim();
}

async function main(): Promise<void> {
  console.log('=== Journal Entry Generator Starting ===');
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set in the environment.');
  }
  console.log(`✓ API Key found: ${apiKey.substring(0, 8)}...`);

  const options = parseArgs(process.argv);
  console.log('✓ Parsed options:', {
    outputDir: options.outputDir,
    startOffset: options.startOffset,
    endOffset: options.endOffset,
    model: options.model,
    targetWords: options.targetWords,
    minWords: options.minWords,
    maxWords: options.maxWords,
    dryRun: options.dryRun
  });

  const openai = new OpenAI({ apiKey });
  console.log('✓ OpenAI client initialized');

  // GPT-5 models use tokens for reasoning, so we need much higher limits
  const maxTokens = options.model.includes('gpt-5') ? 8192 : 2048;
  console.log(`✓ Max tokens set to: ${maxTokens} (model: ${options.model})`);
  
  await ensureDir(options.outputDir);
  console.log(`✓ Output directory ensured: ${options.outputDir}`);

  // Manifest file to list all generated entries for convenience
  const manifestPath = path.join(options.outputDir, 'manifest.json');
  const manifest: { startOffset: number; endOffset: number; model: string; targetWords: number; generatedAt: string; files: string[] } = {
    startOffset: options.startOffset,
    endOffset: options.endOffset,
    model: options.model,
    targetWords: options.targetWords,
    generatedAt: new Date().toISOString(),
    files: [],
  };

  const systemPrompt = buildSystemPrompt(options.targetWords, options.minWords, options.maxWords);
  console.log('✓ System prompt built');
  
  // Generate score patterns for the entire journey
  const totalDays = Math.abs(options.endOffset - options.startOffset) + 1;
  const healthJourney = generateHealthJourney(totalDays);
  const scorePattern = generateScorePattern(totalDays, healthJourney);
  console.log(`✓ Generated score patterns for ${totalDays} days`);
  
  console.log('✓ Starting generation loop...');

  for (let offset = options.startOffset; offset <= options.endOffset; offset++) {
    // offsets are negative increasing to -1 (e.g., -180..-1); allow either order
    const currentOffset = offset;
    const dayIndex = Math.abs(offset - options.startOffset);
    const targetScores = scorePattern[dayIndex];
    const userPrompt = buildUserPrompt(currentOffset, targetScores);

    // Check if file already exists
    const filename = `entry-${currentOffset}.json`;
    const filePath = path.join(options.outputDir, filename);
    
    try {
      await fs.access(filePath);
      // File exists, skip generation
      process.stdout.write(`Generating entry for offset ${currentOffset}... skipped (exists)\n`);
      manifest.files.push(filename);
      continue;
    } catch {
      // File doesn't exist, proceed with generation
    }

    process.stdout.write(`Generating entry for offset ${currentOffset}... `);

    if (options.dryRun) {
      const dummy = `DRY RUN content for ${currentOffset}`;
      const file = await writeJsonFile(options.outputDir, currentOffset, dummy, targetScores);
      manifest.files.push(path.basename(file));
      process.stdout.write('done (dry)\n');
      continue;
    }

    let text = '';
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      attempts += 1;
      try {
        text = await generateEntryText(openai, options.model, systemPrompt, userPrompt, maxTokens);
        const words = countWords(text);
        if (words < options.minWords || words > options.maxWords) {
          // One refinement attempt
          const refined = await refineToTargetLength(openai, options.model, text, options.targetWords, options.minWords, options.maxWords, maxTokens);
          const refinedCount = countWords(refined);
          if (refined && refinedCount >= options.minWords && refinedCount <= options.maxWords) {
            text = refined;
            break;
          }
        } else {
          break;
        }
      } catch (err) {
        const e = err as Error;
        const waitMs = 1500 * attempts;
        process.stdout.write(`error: ${e.message}. retrying in ${waitMs}ms... `);
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }

    if (!text) {
      process.stdout.write(`FAILED after ${maxAttempts} attempts. Skipping...\n`);
      continue;
    }

    const file = await writeJsonFile(options.outputDir, currentOffset, text, targetScores);
    manifest.files.push(path.basename(file));
    process.stdout.write('done\n');
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  // eslint-disable-next-line no-console
  console.log(`\nWrote manifest: ${manifestPath}`);
  // eslint-disable-next-line no-console
  console.log(`Generation complete. Generated ${manifest.files.length} files out of ${options.endOffset - options.startOffset + 1} requested.`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
