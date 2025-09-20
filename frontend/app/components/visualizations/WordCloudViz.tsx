import { useEffect, useRef, useState } from 'react';

interface WordCloudData {
  text: string;
  size: number;
  category: string;
}

interface WordCloudVizProps {
  data: WordCloudData[];
  viewMode: 'overview' | 'detailed';
}

// Color scheme for different categories
const CATEGORY_COLORS = {
  triggers: '#ef4444', // red
  emotions: '#3b82f6', // blue
  activities: '#10b981', // green
  food: '#f59e0b', // amber
  people: '#8b5cf6', // purple
  places: '#06b6d4', // cyan
  default: '#6b7280', // gray
};

export function WordCloudViz({ data, viewMode }: WordCloudVizProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: viewMode === 'detailed' ? 400 : 300,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [viewMode]);

  useEffect(() => {
    if (!data.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sort words by size for better placement
    const sortedWords = [...data].sort((a, b) => b.size - a.size);

    // Simple word cloud layout algorithm
    const words: Array<{
      text: string;
      x: number;
      y: number;
      width: number;
      height: number;
      fontSize: number;
      color: string;
      category: string;
    }> = [];

    const maxSize = Math.max(...sortedWords.map(w => w.size));
    const minSize = Math.min(...sortedWords.map(w => w.size));
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    sortedWords.forEach((word, index) => {
      // Calculate font size based on word importance
      const normalizedSize = (word.size - minSize) / (maxSize - minSize || 1);
      const fontSize = Math.max(12, Math.min(48, 12 + normalizedSize * 36));

      ctx.font = `${fontSize}px Inter, sans-serif`;
      const metrics = ctx.measureText(word.text);
      const width = metrics.width;
      const height = fontSize;

      // Simple spiral placement algorithm
      let x = centerX;
      let y = centerY;
      let placed = false;
      let angle = 0;
      let radius = 0;

      while (!placed && radius < Math.min(canvas.width, canvas.height) / 2) {
        x = centerX + Math.cos(angle) * radius - width / 2;
        y = centerY + Math.sin(angle) * radius;

        // Check for collisions
        let collision = false;
        for (const placedWord of words) {
          if (
            x < placedWord.x + placedWord.width + 5 &&
            x + width + 5 > placedWord.x &&
            y < placedWord.y + placedWord.height + 5 &&
            y + height + 5 > placedWord.y
          ) {
            collision = true;
            break;
          }
        }

        if (!collision && x >= 0 && y >= 0 && x + width <= canvas.width && y + height <= canvas.height) {
          placed = true;
        } else {
          angle += 0.5;
          if (angle > 2 * Math.PI) {
            angle = 0;
            radius += 10;
          }
        }
      }

      if (placed) {
        const color = CATEGORY_COLORS[word.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default;
        words.push({
          text: word.text,
          x,
          y,
          width,
          height,
          fontSize,
          color,
          category: word.category,
        });
      }
    });

    // Draw words
    words.forEach(word => {
      ctx.font = `${word.fontSize}px Inter, sans-serif`;
      ctx.fillStyle = hoveredWord === word.text ? '#1f2937' : word.color;
      ctx.textBaseline = 'top';

      // Add subtle shadow for better readability
      if (hoveredWord === word.text) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
      }

      ctx.fillText(word.text, word.x, word.y);

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    });

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      let foundWord = null;
      for (const word of words) {
        if (
          mouseX >= word.x &&
          mouseX <= word.x + word.width &&
          mouseY >= word.y &&
          mouseY <= word.y + word.height
        ) {
          foundWord = word.text;
          break;
        }
      }

      if (foundWord !== hoveredWord) {
        setHoveredWord(foundWord);
        canvas.style.cursor = foundWord ? 'pointer' : 'default';
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [data, dimensions, hoveredWord, viewMode]);

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="font-medium">No keywords found</p>
          <p className="text-sm">Word cloud will appear here once text analysis is completed</p>
        </div>
      </div>
    );
  }

  const categoryStats = data.reduce((acc, word) => {
    acc[word.category] = (acc[word.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="relative">
      <div ref={containerRef} className="w-full">
        <canvas
          ref={canvasRef}
          className="w-full border border-gray-200 rounded-lg bg-gray-50"
          style={{ height: dimensions.height }}
        />
      </div>

      {hoveredWord && (
        <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded text-sm pointer-events-none">
          {hoveredWord}
        </div>
      )}

      {viewMode === 'detailed' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Category Breakdown</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(categoryStats).map(([category, count]) => (
              <div key={category} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.default
                  }}
                />
                <span className="text-sm text-gray-700 capitalize">
                  {category} ({count})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        <p>Words sized by frequency • Hover to highlight • Categories color-coded</p>
      </div>
    </div>
  );
}