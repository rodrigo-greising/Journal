import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendData {
  mood: Array<{ date: string; value: number }>;
  energy: Array<{ date: string; value: number }>;
  sleep: Array<{ date: string; value: number }>;
}

interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}

interface TrendChartProps {
  data: TrendData;
  viewMode: 'overview' | 'detailed';
  timeRange: TimeRange;
  onDateSelect?: (date: string | null) => void;
}

export function TrendChart({ data, viewMode, timeRange, onDateSelect }: TrendChartProps) {
  // Prepare chart data
  const dates = Array.from(
    new Set([
      ...data.mood.map(d => d.date),
      ...data.energy.map(d => d.date),
      ...data.sleep.map(d => d.date),
    ])
  ).sort();

  const chartData = {
    labels: dates.map(date => {
      // Parse date as UTC to avoid timezone issues
      const d = new Date(date + 'T00:00:00.000Z');
      if (viewMode === 'detailed' || dates.length <= 30) {
        return d.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          timeZone: 'UTC'
        });
      } else {
        return d.toLocaleDateString('en-US', { 
          month: 'short', 
          year: '2-digit',
          timeZone: 'UTC'
        });
      }
    }),
    datasets: [
      {
        label: 'Mood',
        data: dates.map(date => {
          const moodEntry = data.mood.find(m => m.date === date);
          return moodEntry ? moodEntry.value : null;
        }),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: false,
        pointRadius: viewMode === 'detailed' ? 4 : 2,
        pointHoverRadius: 6,
        pointStyle: 'circle',
      },
      {
        label: 'Energy',
        data: dates.map(date => {
          const energyEntry = data.energy.find(e => e.date === date);
          return energyEntry ? energyEntry.value : null;
        }),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.3,
        fill: false,
        pointRadius: viewMode === 'detailed' ? 4 : 2,
        pointHoverRadius: 6,
        pointStyle: 'circle',
      },
      {
        label: 'Sleep Quality',
        data: dates.map(date => {
          const sleepEntry = data.sleep.find(s => s.date === date);
          return sleepEntry ? sleepEntry.value : null;
        }),
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.3,
        fill: false,
        pointRadius: viewMode === 'detailed' ? 4 : 2,
        pointHoverRadius: 6,
        pointStyle: 'circle',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (context) => {
            // Parse date as UTC to avoid timezone issues
            const date = new Date(dates[context[0].dataIndex] + 'T00:00:00.000Z');
            return date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC'
            });
          },
          label: (context) => {
            const value = context.parsed.y;
            return value !== null ? `${context.dataset.label}: ${value}/10` : '';
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
        grid: {
          display: viewMode === 'detailed',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Rating (1-10)',
        },
        min: 0,
        max: 10,
        ticks: {
          stepSize: 1,
        },
        grid: {
          display: true,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    elements: {
      point: {
        hoverBackgroundColor: 'white',
        hoverBorderWidth: 2,
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onDateSelect) {
        const dataIndex = elements[0].index;
        const selectedDate = dates[dataIndex];
        onDateSelect(selectedDate);
      }
    },
  };

  if (!dates.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="font-medium">No trend data available</p>
          <p className="text-sm">Data will appear here once analysis is completed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="h-64 md:h-80">
        <Line data={chartData} options={options} />
      </div>
      
      {onDateSelect && (
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-500">
            Click on any data point to view journal entries for that date
          </p>
        </div>
      )}

      {viewMode === 'detailed' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Trend Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-600">Mood Trend:</span>
              <span className="ml-2 text-gray-700">
                {data.mood.length > 1 ? 'Improving' : 'Insufficient data'}
              </span>
            </div>
            <div>
              <span className="font-medium text-yellow-600">Energy Trend:</span>
              <span className="ml-2 text-gray-700">
                {data.energy.length > 1 ? 'Stable' : 'Insufficient data'}
              </span>
            </div>
            <div>
              <span className="font-medium text-purple-600">Sleep Trend:</span>
              <span className="ml-2 text-gray-700">
                {data.sleep.length > 1 ? 'Variable' : 'Insufficient data'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}