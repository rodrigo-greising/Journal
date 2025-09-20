import type { Route } from "./+types/dashboard";
import { useState, useEffect } from "react";
import { TrendChart } from "../components/visualizations/TrendChart";
import { WordCloudViz } from "../components/visualizations/WordCloudViz";
import { WordListViz } from "../components/visualizations/WordListViz";
import { SummaryCards } from "../components/visualizations/SummaryCards";
import { TimeFilter } from "../components/TimeFilter";
import { ABTestWrapper, DASHBOARD_AB_TESTS } from "../components/visualizations/ABTestWrapper";
import { useABTestTracking } from "../hooks/useABTest";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Health Journal" },
    { name: "description", content: "Visualize your health data patterns and trends" },
  ];
}

interface DashboardData {
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
  journalEntries: Array<{
    id: string;
    date: string;
    content: string;
    mood?: number;
    energy?: number;
    sleep?: number;
  }>;
}

interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Helper function to get end of day
  const getEndOfDay = (date: Date = new Date()) => {
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return endOfDay;
  };

  // Helper function to get start of day
  const getStartOfDay = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    return startOfDay;
  };

  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: getStartOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
    end: getEndOfDay(),
    label: "Last 30 days"
  });
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const params = new URLSearchParams({
        startDate: timeRange.start.toISOString(),
        endDate: timeRange.end.toISOString(),
      });

      const response = await fetch(`http://localhost:3001/dashboard/data?${params}`);
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      } else {
        setError('Failed to load dashboard data. Please try refreshing the page.');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Unable to connect to the server. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);
    setIsLoading(true);
  };

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
  };

  // Get journal entries for the selected date
  const selectedDateEntries = selectedDate 
    ? data?.journalEntries.filter(entry => entry.date === selectedDate) || []
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div role="status" aria-live="polite" className="text-center py-8">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              <p className="text-gray-600 mt-4">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div role="alert" aria-live="polite" className="text-center py-8">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => {
                  setIsLoading(true);
                  fetchDashboardData();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h2>
              <p className="text-gray-600 mb-4">
                No analysis data found for the selected time period. Try extending your time range or create some journal entries first.
              </p>
              <div className="space-x-4">
                <a
                  href="/"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Journal Entry
                </a>
                <a
                  href="/analysis"
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Run Analysis
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Visualize your wellness patterns and insights for {timeRange.label.toLowerCase()}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <a
                  href="/"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ← Journal
                </a>
                <span className="text-gray-300">|</span>
                <a
                  href="/analysis"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Analysis
                </a>
              </div>

              {/* View Mode Toggle */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode('overview')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'overview'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-pressed={viewMode === 'overview'}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('detailed')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'detailed'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-pressed={viewMode === 'detailed'}
                >
                  Detailed
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Time Filter */}
        <div className="mb-6">
          <TimeFilter
            currentRange={timeRange}
            onRangeChange={handleTimeRangeChange}
          />
        </div>

        {/* Summary Cards */}
        <div className="mb-6">
          <SummaryCards data={data.summary} />
        </div>

        {/* Main Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Trends Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mood & Energy Trends</h2>
            <TrendChart
              data={data.trends}
              viewMode={viewMode}
              timeRange={timeRange}
              onDateSelect={handleDateSelect}
            />
          </div>

          {/* Word Cloud */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Themes & Triggers</h2>
            <ABTestWrapper
              testName={DASHBOARD_AB_TESTS.WORD_CLOUD_STYLE.testName}
              variants={{
                canvas: <WordCloudViz data={data.wordCloud} viewMode={viewMode} />,
                'text-list': <WordListViz data={data.wordCloud} viewMode={viewMode} />,
              }}
              defaultVariant="canvas"
            />
          </div>
        </div>

        {/* Journal Entries for Selected Date */}
        {selectedDate && selectedDateEntries.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Journal Entries for {new Date(selectedDate + 'T00:00:00.000Z').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'UTC'
                  })}
                </h2>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close entries view"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {selectedDateEntries.map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex space-x-4 text-sm">
                        {entry.mood !== undefined && (
                          <span className="text-blue-600 font-medium">
                            Mood: {entry.mood}/10
                          </span>
                        )}
                        {entry.energy !== undefined && (
                          <span className="text-yellow-600 font-medium">
                            Energy: {entry.energy}/10
                          </span>
                        )}
                        {entry.sleep !== undefined && (
                          <span className="text-purple-600 font-medium">
                            Sleep: {entry.sleep}/10
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{entry.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Views (only in detailed mode) */}
        {viewMode === 'detailed' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Mood Analysis</h2>
              <div className="text-gray-600 text-sm">
                Comprehensive mood patterns and correlations will be displayed here.
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pattern Insights</h2>
              <div className="text-gray-600 text-sm">
                AI-generated insights about your health patterns and recommendations.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}