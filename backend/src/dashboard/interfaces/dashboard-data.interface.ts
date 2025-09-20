export interface DashboardData {
  trends: {
    mood: Array<{ date: string; value: number }>;
    energy: Array<{ date: string; value: number }>;
    sleep: Array<{ date: string; value: number }>;
  };
  wordCloud: Array<{ text: string; size: number; category: string }>;
  summary: {
    totalEntries: number;
    avgMood: number;
    avgEnergy: number;
    commonTriggers: string[];
    positiveTrends: string[];
  };
}
