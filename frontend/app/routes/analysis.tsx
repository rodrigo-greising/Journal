import type { Route } from "./+types/analysis";
import { useState, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Analysis Results - Health Journal" },
    { name: "description", content: "View AI analysis results of your journal entries" },
  ];
}

interface AnalysisResult {
  id: string;
  journalEntryId: string;
  analysisType: 'mood' | 'energy' | 'nutrition' | 'triggers';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result: any;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  journalEntry: {
    id: string;
    content: string;
    type: 'text' | 'audio';
    createdAt: string;
  };
}

interface QueueStatus {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

function MoodAnalysisCard({ result }: { result: any }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
      <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
        <span className="mr-2">😊</span>
        Mood Analysis
      </h4>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-700">Sentiment:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            result.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
            result.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {result.sentiment}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-700">Mood Scale:</span>
          <div className="flex items-center">
            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(result.moodScale / 10) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{result.moodScale}/10</span>
          </div>
        </div>
        {result.emotions && result.emotions.length > 0 && (
          <div>
            <span className="text-sm text-blue-700">Emotions:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {result.emotions.map((emotion: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                >
                  {emotion}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="text-xs text-blue-600">
          Confidence: {Math.round(result.confidence * 100)}%
        </div>
      </div>
    </div>
  );
}

function EnergyAnalysisCard({ result }: { result: any }) {
  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
      <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
        <span className="mr-2">⚡</span>
        Energy Analysis
      </h4>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-yellow-700">Energy Level:</span>
          <div className="flex items-center">
            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
              <div
                className="bg-yellow-600 h-2 rounded-full"
                style={{ width: `${(result.energyLevel / 10) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium">{result.energyLevel}/10</span>
          </div>
        </div>
        {result.sleepQuality && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-yellow-700">Sleep Quality:</span>
            <div className="flex items-center">
              <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${(result.sleepQuality / 10) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{result.sleepQuality}/10</span>
            </div>
          </div>
        )}
        {result.fatigueIndicators && result.fatigueIndicators.length > 0 && (
          <div>
            <span className="text-sm text-yellow-700">Fatigue Indicators:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {result.fatigueIndicators.map((indicator: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                >
                  {indicator}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="text-xs text-yellow-600">
          Confidence: {Math.round(result.confidence * 100)}%
        </div>
      </div>
    </div>
  );
}

function NutritionAnalysisCard({ result }: { result: any }) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
      <h4 className="font-semibold text-green-900 mb-3 flex items-center">
        <span className="mr-2">🍎</span>
        Nutrition Analysis
      </h4>
      <div className="space-y-2">
        {result.foodMentions && result.foodMentions.length > 0 && (
          <div>
            <span className="text-sm text-green-700">Food Mentions:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {result.foodMentions.map((food: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                >
                  {food}
                </span>
              ))}
            </div>
          </div>
        )}
        {result.estimatedCalories && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700">Estimated Calories:</span>
            <span className="text-sm font-medium">{result.estimatedCalories} kcal</span>
          </div>
        )}
        {result.macros && (
          <div>
            <span className="text-sm text-green-700">Macros:</span>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {result.macros.protein && (
                <div className="text-center bg-green-100 rounded p-1">
                  <div className="text-xs text-green-600">Protein</div>
                  <div className="font-medium text-green-800">{result.macros.protein}g</div>
                </div>
              )}
              {result.macros.carbs && (
                <div className="text-center bg-green-100 rounded p-1">
                  <div className="text-xs text-green-600">Carbs</div>
                  <div className="font-medium text-green-800">{result.macros.carbs}g</div>
                </div>
              )}
              {result.macros.fats && (
                <div className="text-center bg-green-100 rounded p-1">
                  <div className="text-xs text-green-600">Fats</div>
                  <div className="font-medium text-green-800">{result.macros.fats}g</div>
                </div>
              )}
            </div>
          </div>
        )}
        {result.mealTiming && result.mealTiming.length > 0 && (
          <div>
            <span className="text-sm text-green-700">Meal Timing:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {result.mealTiming.map((timing: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                >
                  {timing}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="text-xs text-green-600">
          Confidence: {Math.round(result.confidence * 100)}%
        </div>
      </div>
    </div>
  );
}

function TriggerAnalysisCard({ result }: { result: any }) {
  return (
    <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border border-red-200">
      <h4 className="font-semibold text-red-900 mb-3 flex items-center">
        <span className="mr-2">⚠️</span>
        Trigger Analysis
      </h4>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-red-700">Risk Level:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            result.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
            result.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {result.riskLevel}
          </span>
        </div>
        {result.stressor && result.stressor.length > 0 && (
          <div>
            <span className="text-sm text-red-700">Stressors:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {result.stressor.map((stressor: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs"
                >
                  {stressor}
                </span>
              ))}
            </div>
          </div>
        )}
        {result.cravings && result.cravings.length > 0 && (
          <div>
            <span className="text-sm text-red-700">Cravings:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {result.cravings.map((craving: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs"
                >
                  {craving}
                </span>
              ))}
            </div>
          </div>
        )}
        {result.copingStrategies && result.copingStrategies.length > 0 && (
          <div>
            <span className="text-sm text-red-700">Coping Strategies:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {result.copingStrategies.map((strategy: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                >
                  {strategy}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="text-xs text-red-600">
          Confidence: {Math.round(result.confidence * 100)}%
        </div>
      </div>
    </div>
  );
}

function AnalysisResultCard({ analysisResult }: { analysisResult: AnalysisResult }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderAnalysisComponent = () => {
    if (analysisResult.status !== 'completed' || !analysisResult.result) {
      return (
        <div className="text-gray-500 text-sm">
          {analysisResult.status === 'failed' && (
            <div className="text-red-600">
              <span className="font-medium">Analysis failed:</span> {analysisResult.errorMessage}
            </div>
          )}
          {analysisResult.status === 'processing' && (
            <div className="text-blue-600 flex items-center">
              <span className="animate-spin mr-2">⏳</span>
              Processing...
            </div>
          )}
          {analysisResult.status === 'pending' && (
            <div className="text-gray-600">Pending analysis...</div>
          )}
        </div>
      );
    }

    switch (analysisResult.analysisType) {
      case 'mood':
        return <MoodAnalysisCard result={analysisResult.result} />;
      case 'energy':
        return <EnergyAnalysisCard result={analysisResult.result} />;
      case 'nutrition':
        return <NutritionAnalysisCard result={analysisResult.result} />;
      case 'triggers':
        return <TriggerAnalysisCard result={analysisResult.result} />;
      default:
        return <div className="text-gray-500">Unknown analysis type</div>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Journal Entry Analysis
          </h3>
          <time className="text-sm text-gray-500">
            {formatDate(analysisResult.journalEntry.createdAt)}
          </time>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-gray-800 text-sm leading-relaxed">
            {analysisResult.journalEntry.content.substring(0, 200)}
            {analysisResult.journalEntry.content.length > 200 && '...'}
          </p>
        </div>
      </div>

      {renderAnalysisComponent()}

      <div className="mt-3 text-xs text-gray-500">
        Analysis completed: {formatDate(analysisResult.updatedAt)}
      </div>
    </div>
  );
}

export default function Analysis() {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAnalysisResults();
    fetchQueueStatus();

    // Refresh data every 10 seconds
    const interval = setInterval(() => {
      fetchAnalysisResults();
      fetchQueueStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedType]);

  const fetchAnalysisResults = async () => {
    try {
      setError(null);
      const url = selectedType === 'all'
        ? 'http://localhost:3001/analysis'
        : `http://localhost:3001/analysis/type/${selectedType}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAnalysisResults(data);
      } else {
        setError('Failed to load analysis results. Please try refreshing the page.');
      }
    } catch (error) {
      console.error('Error fetching analysis results:', error);
      setError('Unable to connect to the server. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/analysis/queue/status');
      if (response.ok) {
        const data = await response.json();
        setQueueStatus(data);
      }
    } catch (error) {
      console.error('Error fetching queue status:', error);
    }
  };

  const processAllEntries = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:3001/analysis/process-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisTypes: ['mood', 'energy', 'nutrition', 'triggers']
        }),
      });

      if (response.ok) {
        await fetchQueueStatus();
        // Results will be updated by the interval
      } else {
        setError('Failed to start processing. Please try again.');
      }
    } catch (error) {
      console.error('Error starting processing:', error);
      setError('Unable to start processing. Please check your internet connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const retryFailedJobs = async () => {
    try {
      const response = await fetch('http://localhost:3001/analysis/queue/retry-failed', {
        method: 'POST',
      });

      if (response.ok) {
        await fetchQueueStatus();
      } else {
        setError('Failed to retry failed jobs. Please try again.');
      }
    } catch (error) {
      console.error('Error retrying failed jobs:', error);
      setError('Unable to retry failed jobs. Please check your internet connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Analysis Results</h1>
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Journal
            </a>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
            >
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Queue Status */}
          {queueStatus && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Processing Queue Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{queueStatus.waiting}</div>
                  <div className="text-blue-700">Waiting</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">{queueStatus.active}</div>
                  <div className="text-yellow-700">Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{queueStatus.completed}</div>
                  <div className="text-green-700">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{queueStatus.failed}</div>
                  <div className="text-red-700">Failed</div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={processAllEntries}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Process All Entries'}
                </button>
                {queueStatus.failed > 0 && (
                  <button
                    onClick={retryFailedJobs}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                  >
                    Retry Failed ({queueStatus.failed})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Filter Options */}
          <div className="mb-6">
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Analysis Type:
            </label>
            <select
              id="type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            >
              <option value="all">All Analysis Types</option>
              <option value="mood">Mood Analysis</option>
              <option value="energy">Energy Analysis</option>
              <option value="nutrition">Nutrition Analysis</option>
              <option value="triggers">Trigger Analysis</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="text-center py-8"
          >
            <p className="text-gray-600">Loading analysis results...</p>
          </div>
        ) : analysisResults.length > 0 ? (
          <div className="space-y-6">
            {analysisResults.map((result) => (
              <AnalysisResultCard key={result.id} analysisResult={result} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Results Yet</h3>
              <p className="text-gray-600 mb-4">
                {selectedType === 'all'
                  ? 'No analysis results have been generated yet. Process your journal entries to see insights.'
                  : `No ${selectedType} analysis results found. Try processing entries or selecting a different filter.`
                }
              </p>
              <button
                onClick={processAllEntries}
                disabled={isProcessing}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Start Analysis'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}