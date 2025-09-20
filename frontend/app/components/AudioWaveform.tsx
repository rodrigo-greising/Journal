import { useEffect, useRef, useState } from 'react';

interface AudioWaveformProps {
  stream: MediaStream | null;
  isRecording: boolean;
  isPaused: boolean;
  width?: number;
  height?: number;
  barWidth?: number;
  barGap?: number;
  maxBars?: number;
}

export function AudioWaveform({
  stream,
  isRecording,
  isPaused,
  width = 320,
  height = 80,
  barWidth = 3,
  barGap = 1,
  maxBars = 75
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>([]);

  useEffect(() => {
    if (!stream || !isRecording) {
      // Clean up when not recording
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      dataArrayRef.current = null;
      setAudioLevels([]);
      return;
    }

    // Set up audio analysis
    const setupAudioAnalysis = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();

        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;

        startAnalysis();
      } catch (error) {
        console.error('Error setting up audio analysis:', error);
      }
    };

    setupAudioAnalysis();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stream, isRecording]);

  const startAnalysis = () => {
    if (!analyserRef.current || !dataArrayRef.current || isPaused) {
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    const analyze = () => {
      if (!isRecording || isPaused) {
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      // Calculate average volume for this frame
      const average = Array.from(dataArray).reduce((sum: number, value: number) => sum + value, 0) / dataArray.length;
      const normalizedLevel = average / 255; // Normalize to 0-1

      setAudioLevels(prev => {
        const newLevels = [...prev, normalizedLevel];
        // Keep only the most recent levels that fit in our display
        return newLevels.slice(-maxBars);
      });

      animationFrameRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  };

  // Resume analysis when unpaused
  useEffect(() => {
    if (isRecording && !isPaused && analyserRef.current) {
      startAnalysis();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [isPaused, isRecording]);

  // Draw the waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!isRecording) {
      // Draw a flat line when not recording
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(0, height / 2 - 1, width, 2);
      return;
    }

    const totalBarWidth = barWidth + barGap;
    const startX = Math.max(0, width - (audioLevels.length * totalBarWidth));

    // Create gradient backgrounds
    const gradient = ctx.createLinearGradient(0, 0, 0, height);

    audioLevels.forEach((level, index) => {
      const x = startX + (index * totalBarWidth);
      const maxBarHeight = height * 0.95; // Use 95% of available height
      const minBarHeight = height * 0.05; // Minimum 5% height for visibility
      const barHeight = Math.max(minBarHeight, level * maxBarHeight);
      const y = (height - barHeight) / 2;

      // Create more sophisticated gradient based on volume level and recording state
      if (isPaused) {
        // Warm amber gradient for paused state
        gradient.addColorStop(0, '#fbbf24');
        gradient.addColorStop(1, '#f59e0b');
        ctx.fillStyle = gradient;
      } else {
        const intensity = Math.min(1, level * 1.5); // Boost intensity for better visibility

        // Dynamic gradient from blue to green to orange to red
        if (intensity < 0.3) {
          gradient.addColorStop(0, '#3b82f6'); // Blue
          gradient.addColorStop(1, '#1d4ed8');
        } else if (intensity < 0.6) {
          gradient.addColorStop(0, '#10b981'); // Green
          gradient.addColorStop(1, '#047857');
        } else if (intensity < 0.8) {
          gradient.addColorStop(0, '#f59e0b'); // Orange
          gradient.addColorStop(1, '#d97706');
        } else {
          gradient.addColorStop(0, '#ef4444'); // Red
          gradient.addColorStop(1, '#dc2626');
        }
        ctx.fillStyle = gradient;
      }

      // Draw rounded rectangles for a smoother appearance
      ctx.beginPath();
      const radius = Math.min(barWidth / 2, 2); // Limit radius for better appearance

      // Manual rounded rectangle implementation for browser compatibility
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, y + barHeight - radius);
      ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
      ctx.lineTo(x + radius, y + barHeight);
      ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
    });

    // Add a subtle glow effect for the most recent bars
    if (audioLevels.length > 0 && !isPaused) {
      const recentBars = 8;
      const recentLevels = audioLevels.slice(-recentBars);

      // Create a more subtle glow
      ctx.shadowColor = isPaused ? '#fbbf24' : '#3b82f6';
      ctx.shadowBlur = 6;
      ctx.globalAlpha = 0.6;

      recentLevels.forEach((level, index) => {
        const actualIndex = audioLevels.length - recentBars + index;
        if (actualIndex < 0) return;

        const x = startX + (actualIndex * totalBarWidth);
        const maxBarHeight = height * 0.95;
        const minBarHeight = height * 0.05;
        const barHeight = Math.max(minBarHeight, level * maxBarHeight);
        const y = (height - barHeight) / 2;

        ctx.beginPath();
        const radius = Math.min(barWidth / 2, 2);

        // Manual rounded rectangle for glow effect
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, y + barHeight - radius);
        ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
        ctx.lineTo(x + radius, y + barHeight);
        ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
      });

      // Reset shadow and alpha
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
    }
  }, [audioLevels, isRecording, isPaused, width, height, barWidth, barGap, maxBars]);

  return (
    <div className="flex flex-col items-center space-y-2">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-300 rounded-lg bg-gradient-to-b from-gray-50 to-gray-100 shadow-inner"
        aria-label={`Audio waveform visualization ${isRecording ? (isPaused ? '(paused)' : '(recording)') : '(inactive)'}`}
      />
      <div className="text-xs text-gray-500 text-center">
        {!isRecording && 'Press record to see audio levels'}
        {isRecording && !isPaused && 'Recording audio...'}
        {isRecording && isPaused && 'Recording paused'}
      </div>
    </div>
  );
}