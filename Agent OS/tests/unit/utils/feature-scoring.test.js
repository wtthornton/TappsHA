import { describe, it, expect } from 'vitest';
import FeatureScoringFramework from '../../../utils/feature-scoring.js';

describe('FeatureScoringFramework', () => {
  it('scores features and produces weighted score and priority', () => {
    const framework = new FeatureScoringFramework();
    const res = framework.scoreFeature({
      name: 'Test Feature',
      description: 'demo',
      importance: 8,
      complexity: 3,
      impact: 9
    });
    expect(res.scores.weighted).toBeGreaterThan(0);
    expect(['HIGH','MEDIUM','LOW','ELIMINATE']).toContain(res.priority);
  });
});


