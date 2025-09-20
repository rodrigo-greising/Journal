interface SummaryData {
  totalEntries: number;
  avgMood: number;
  avgEnergy: number;
  commonTriggers: string[];
  positiveTrends: string[];
}

interface SummaryCardsProps {
  data: SummaryData;
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const formatRating = (rating: number) => {
    return rating ? rating.toFixed(1) : 'N/A';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 7) return 'text-green-600 bg-green-50 border-green-200';
    if (rating >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const cards = [
    {
      title: 'Total Entries',
      value: data.totalEntries,
      suffix: '',
      icon: '📝',
      description: 'Journal entries in period',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      title: 'Average Mood',
      value: formatRating(data.avgMood),
      suffix: '/10',
      icon: '😊',
      description: 'Overall mood rating',
      color: getRatingColor(data.avgMood),
    },
    {
      title: 'Average Energy',
      value: formatRating(data.avgEnergy),
      suffix: '/10',
      icon: '⚡',
      description: 'Energy level rating',
      color: getRatingColor(data.avgEnergy),
    },
    {
      title: 'Common Triggers',
      value: data.commonTriggers.length,
      suffix: ' identified',
      icon: '⚠️',
      description: 'Stress triggers found',
      color: data.commonTriggers.length > 0
        ? 'text-orange-600 bg-orange-50 border-orange-200'
        : 'text-gray-600 bg-gray-50 border-gray-200',
      details: data.commonTriggers.slice(0, 3),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`rounded-lg border p-4 ${card.color} transition-all hover:shadow-md`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg" role="img" aria-label={card.title}>
                  {card.icon}
                </span>
                <h3 className="text-sm font-medium opacity-80">
                  {card.title}
                </h3>
              </div>

              <div className="mb-1">
                <span className="text-2xl font-bold">
                  {card.value}
                </span>
                {card.suffix && (
                  <span className="text-sm opacity-70 ml-1">
                    {card.suffix}
                  </span>
                )}
              </div>

              <p className="text-xs opacity-70">
                {card.description}
              </p>

              {/* Additional details for triggers */}
              {card.details && card.details.length > 0 && (
                <div className="mt-2 pt-2 border-t border-current border-opacity-20">
                  <div className="flex flex-wrap gap-1">
                    {card.details.map((trigger, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 text-xs bg-white bg-opacity-50 rounded-full"
                      >
                        {trigger}
                      </span>
                    ))}
                    {data.commonTriggers.length > 3 && (
                      <span className="inline-block px-2 py-1 text-xs bg-white bg-opacity-50 rounded-full">
                        +{data.commonTriggers.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Positive Trends Card - Full Width */}
      {data.positiveTrends.length > 0 && (
        <div className="md:col-span-2 lg:col-span-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-start space-x-3">
            <span className="text-lg" role="img" aria-label="Positive trends">
              📈
            </span>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-800 mb-2">
                Positive Trends Identified
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {data.positiveTrends.map((trend, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-sm text-green-700"
                  >
                    <span className="text-green-500">✓</span>
                    <span>{trend}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}