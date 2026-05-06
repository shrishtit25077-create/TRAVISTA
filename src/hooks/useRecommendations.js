import { useState, useEffect } from 'react';
import { getRecommendations, hasEnoughData } from '../services/recommendationEngine';
import { getAllSignals } from '../services/trackingService';

export function useRecommendations(exclude = [], limit = 6) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPersonalised, setIsPersonalised] = useState(false);

  useEffect(() => {
    async function compute() {
      setLoading(true);
      const topMatches = getRecommendations(limit + 3, exclude);
      const personalised = hasEnoughData();
      setIsPersonalised(personalised);

      if (personalised) {
        setRecommendations(topMatches.slice(0, limit).map(m => ({
          ...m,
          reason: 'Matches your travel style',
        })));
      } else {
        setRecommendations(topMatches.slice(0, limit));
      }
      setLoading(false);
    }
    compute();
  }, [exclude.join(','), limit]);

  return { recommendations, loading, isPersonalised };
}
