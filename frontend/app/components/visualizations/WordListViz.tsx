interface WordCloudData {
  text: string;
  size: number;
  category: string;
}

interface WordListVizProps {
  data: WordCloudData[];
  viewMode: 'overview' | 'detailed';
}

const CATEGORY_COLORS = {
  triggers: '#ef4444',
  emotions: '#3b82f6',
  activities: '#10b981',
  food: '#f59e0b',
  people: '#8b5cf6',
  places: '#06b6d4',
  default: '#6b7280',
};

export function WordListViz({ data, viewMode }: WordListVizProps) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="font-medium">No keywords found</p>
          <p className="text-sm">Keywords will appear here once text analysis is completed</p>
        </div>
      </div>
    );
  }

  // Group words by category
  const categorizedWords = data.reduce((acc, word) => {
    if (!acc[word.category]) {
      acc[word.category] = [];
    }
    acc[word.category].push(word);
    return acc;
  }, {} as Record<string, WordCloudData[]>);

  // Sort words within each category by size
  Object.keys(categorizedWords).forEach(category => {
    categorizedWords[category].sort((a, b) => b.size - a.size);
  });

  const maxSize = Math.max(...data.map(w => w.size));
  const minSize = Math.min(...data.map(w => w.size));

  const getFontSize = (size: number) => {
    const normalizedSize = (size - minSize) / (maxSize - minSize || 1);
    return Math.max(12, Math.min(24, 12 + normalizedSize * 12));
  };

  const getOpacity = (size: number) => {
    const normalizedSize = (size - minSize) / (maxSize - minSize || 1);
    return Math.max(0.4, 0.4 + normalizedSize * 0.6);
  };

  return (
    <div className="space-y-6">
      {Object.entries(categorizedWords).map(([category, words]) => (
        <div key={category} className="space-y-2">
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default
              }}
            />
            <h4 className="text-sm font-semibold text-gray-900 capitalize">
              {category} ({words.length})
            </h4>
          </div>

          <div className="flex flex-wrap gap-2 pl-5">
            {words.slice(0, viewMode === 'detailed' ? words.length : 10).map((word, index) => (
              <span
                key={index}
                className="inline-block px-3 py-1 rounded-full text-white transition-all hover:scale-105 cursor-default"
                style={{
                  backgroundColor: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default,
                  fontSize: `${getFontSize(word.size)}px`,
                  opacity: getOpacity(word.size),
                }}
                title={`${word.text} (frequency: ${word.size})`}
              >
                {word.text}
              </span>
            ))}
            {words.length > 10 && viewMode === 'overview' && (
              <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-600 text-sm">
                +{words.length - 10} more
              </span>
            )}
          </div>
        </div>
      ))}

      <div className="mt-4 text-xs text-gray-500 border-t pt-3">
        <p>Words sized by frequency • Grouped by category • {data.length} total keywords</p>
      </div>
    </div>
  );
}