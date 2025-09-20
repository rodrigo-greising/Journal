import { type ReactNode } from 'react';
import { useABTest, useABTestTracking } from '../../hooks/useABTest';

interface ABTestWrapperProps {
  testName: string;
  variants: {
    [key: string]: ReactNode;
  };
  defaultVariant?: string;
}

export function ABTestWrapper({ testName, variants, defaultVariant = 'control' }: ABTestWrapperProps) {
  const variantNames = Object.keys(variants);
  const { variant, isLoading } = useABTest({
    testName,
    variants: variantNames,
  });
  const { trackEvent } = useABTestTracking();

  // Track when component is rendered
  if (!isLoading && variant) {
    trackEvent(testName, 'component_rendered');
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  const selectedVariant = variants[variant] || variants[defaultVariant] || Object.values(variants)[0];

  return (
    <div data-ab-test={testName} data-ab-variant={variant}>
      {selectedVariant}
    </div>
  );
}

// Predefined A/B test configurations for common dashboard variations
export const DASHBOARD_AB_TESTS = {
  WORD_CLOUD_STYLE: {
    testName: 'word-cloud-style',
    variants: ['canvas', 'svg', 'text-list'],
    description: 'Test different word cloud visualization approaches',
  },
  TREND_CHART_TYPE: {
    testName: 'trend-chart-type',
    variants: ['line', 'area', 'bar'],
    description: 'Test different chart types for trend visualization',
  },
  SUMMARY_LAYOUT: {
    testName: 'summary-layout',
    variants: ['cards', 'list', 'compact'],
    description: 'Test different summary card layouts',
  },
  DASHBOARD_DENSITY: {
    testName: 'dashboard-density',
    variants: ['spacious', 'compact', 'detailed'],
    description: 'Test different information density levels',
  },
};