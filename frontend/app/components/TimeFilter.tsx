import { useState } from "react";

interface TimeRange {
  start: Date;
  end: Date;
  label: string;
}

interface TimeFilterProps {
  currentRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

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

const PRESET_RANGES = [
  {
    label: "Last 7 days",
    getDates: () => ({
      start: getStartOfDay(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
      end: getEndOfDay(),
    }),
  },
  {
    label: "Last 30 days",
    getDates: () => ({
      start: getStartOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      end: getEndOfDay(),
    }),
  },
  {
    label: "Last 3 months",
    getDates: () => ({
      start: getStartOfDay(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)),
      end: getEndOfDay(),
    }),
  },
  {
    label: "Last 6 months",
    getDates: () => ({
      start: getStartOfDay(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)),
      end: getEndOfDay(),
    }),
  },
  {
    label: "This year",
    getDates: () => ({
      start: new Date(new Date().getFullYear(), 0, 1),
      end: getEndOfDay(),
    }),
  },
];

export function TimeFilter({ currentRange, onRangeChange }: TimeFilterProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState(
    currentRange.start.toISOString().split('T')[0]
  );
  const [customEnd, setCustomEnd] = useState(
    currentRange.end.toISOString().split('T')[0]
  );

  const handlePresetClick = (preset: typeof PRESET_RANGES[0]) => {
    const dates = preset.getDates();
    onRangeChange({
      start: dates.start,
      end: dates.end,
      label: preset.label,
    });
    setShowCustom(false);
  };

  const handleCustomSubmit = () => {
    const start = new Date(customStart);
    const end = new Date(customEnd);

    if (start > end) {
      alert("Start date must be before end date");
      return;
    }

    onRangeChange({
      start,
      end,
      label: "Custom range",
    });
    setShowCustom(false);
  };

  const isCurrentPreset = (preset: typeof PRESET_RANGES[0]) => {
    const dates = preset.getDates();
    return (
      Math.abs(dates.start.getTime() - currentRange.start.getTime()) < 24 * 60 * 60 * 1000 &&
      Math.abs(dates.end.getTime() - currentRange.end.getTime()) < 24 * 60 * 60 * 1000
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Time Period</h3>
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showCustom ? 'Hide Custom' : 'Custom Range'}
          </button>
        </div>

        {/* Preset Ranges */}
        <div className="flex flex-wrap gap-2">
          {PRESET_RANGES.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isCurrentPreset(preset)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Range */}
        {showCustom && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>
              <div>
                <button
                  onClick={handleCustomSubmit}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Current Range Display */}
        <div className="text-xs text-gray-500 border-t pt-2">
          <span className="font-medium">Current range:</span>{' '}
          {currentRange.start.toLocaleDateString()} - {currentRange.end.toLocaleDateString()}
          {' '}({currentRange.label})
        </div>
      </div>
    </div>
  );
}