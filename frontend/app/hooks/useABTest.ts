import { useState, useEffect } from 'react';

interface ABTestConfig {
  testName: string;
  variants: string[];
  weights?: number[]; // Optional weights for each variant
}

interface ABTestResult {
  variant: string;
  isLoading: boolean;
}

// Simple hash function for consistent user assignment
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Get or create a persistent user ID
function getUserId(): string {
  const storageKey = 'health-journal-user-id';
  let userId = localStorage.getItem(storageKey);

  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, userId);
  }

  return userId;
}

// Track A/B test assignment
function trackAssignment(testName: string, variant: string, userId: string) {
  const assignment = {
    testName,
    variant,
    userId,
    timestamp: new Date().toISOString(),
  };

  // Store locally for debugging
  const key = `ab-test-${testName}`;
  localStorage.setItem(key, JSON.stringify(assignment));

  // In production, you would send this to your analytics service
  console.log('A/B Test Assignment:', assignment);
}

export function useABTest(config: ABTestConfig): ABTestResult {
  const [variant, setVariant] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { testName, variants, weights } = config;

    if (!variants.length) {
      setVariant('default');
      setIsLoading(false);
      return;
    }

    const userId = getUserId();

    // Check if user already has an assignment for this test
    const existingAssignment = localStorage.getItem(`ab-test-${testName}`);
    if (existingAssignment) {
      try {
        const assignment = JSON.parse(existingAssignment);
        if (assignment.variant && variants.includes(assignment.variant)) {
          setVariant(assignment.variant);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.warn('Failed to parse existing A/B test assignment:', error);
      }
    }

    // Assign user to a variant
    const hash = hashCode(`${testName}-${userId}`);

    let selectedVariant: string;

    if (weights && weights.length === variants.length) {
      // Use weighted distribution
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      const normalizedWeights = weights.map(weight => weight / totalWeight);

      const random = (hash % 1000) / 1000; // Convert hash to 0-1 range
      let cumulativeWeight = 0;

      selectedVariant = variants[variants.length - 1]; // Default to last variant

      for (let i = 0; i < normalizedWeights.length; i++) {
        cumulativeWeight += normalizedWeights[i];
        if (random <= cumulativeWeight) {
          selectedVariant = variants[i];
          break;
        }
      }
    } else {
      // Use equal distribution
      const variantIndex = hash % variants.length;
      selectedVariant = variants[variantIndex];
    }

    trackAssignment(testName, selectedVariant, userId);
    setVariant(selectedVariant);
    setIsLoading(false);
  }, [config]);

  return { variant, isLoading };
}

// Hook for tracking A/B test events
export function useABTestTracking() {
  const trackEvent = (testName: string, eventName: string, properties?: Record<string, any>) => {
    const userId = getUserId();
    const existingAssignment = localStorage.getItem(`ab-test-${testName}`);

    let variant = 'unknown';
    if (existingAssignment) {
      try {
        const assignment = JSON.parse(existingAssignment);
        variant = assignment.variant;
      } catch (error) {
        console.warn('Failed to parse A/B test assignment for tracking:', error);
      }
    }

    const event = {
      testName,
      variant,
      eventName,
      userId,
      properties,
      timestamp: new Date().toISOString(),
    };

    // In production, send this to your analytics service
    console.log('A/B Test Event:', event);

    // Store locally for debugging
    const events = JSON.parse(localStorage.getItem('ab-test-events') || '[]');
    events.push(event);
    localStorage.setItem('ab-test-events', JSON.stringify(events.slice(-100))); // Keep last 100 events
  };

  return { trackEvent };
}