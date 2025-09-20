export interface MoodAnalysisConfig {
  type: 'mood';
  extractSentiment: boolean;
  extractEmotions: boolean;
  extractMoodScale: boolean; // 1-10 scale
}

export interface EnergyAnalysisConfig {
  type: 'energy';
  extractEnergyLevel: boolean; // 1-10 scale
  extractFatigueIndicators: boolean;
  extractSleepQuality: boolean;
}

export interface NutritionAnalysisConfig {
  type: 'nutrition';
  extractFoodMentions: boolean;
  extractCalorieEstimates: boolean;
  extractMacros: boolean; // protein, carbs, fats
  extractMealTiming: boolean;
}

export interface TriggerAnalysisConfig {
  type: 'triggers';
  extractStressors: boolean;
  extractCravings: boolean;
  extractRiskFactors: boolean;
  extractCopingStrategies: boolean;
}

export type AnalysisConfig =
  | MoodAnalysisConfig
  | EnergyAnalysisConfig
  | NutritionAnalysisConfig
  | TriggerAnalysisConfig;

export interface MoodAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  emotions: string[];
  moodScale: number; // 1-10
  confidence: number;
}

export interface EnergyAnalysisResult {
  energyLevel: number; // 1-10
  fatigueIndicators: string[];
  sleepQuality?: number; // 1-10
  confidence: number;
}

export interface NutritionAnalysisResult {
  foodMentions: string[];
  estimatedCalories?: number;
  macros?: {
    protein?: number;
    carbs?: number;
    fats?: number;
  };
  mealTiming?: string[];
  confidence: number;
}

export interface TriggerAnalysisResult {
  stressor: string[];
  cravings: string[];
  riskFactors: string[];
  copingStrategies: string[];
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
}