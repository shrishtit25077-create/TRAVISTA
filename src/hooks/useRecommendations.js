import { useState, useEffect } from 'react';
import { getRecommendations, hasEnoughData } from '../services/recommendationEngine';
import { reRankWithGemini } from '../services/geminiReranker';
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
        try {
          const reranked = await reRankWithGemini(topMatches, getAllSignals());
          setRecommendations(reranked.slice(0, limit));
        } catch (err) {
          console.error('Gemini reranking failed, falling back to cosine similarity:', err);
          // Gemini failed — use cosine results with generic reasons
          setRecommendations(topMatches.slice(0, limit).map(m => ({
            ...m,
            reason: 'Matches your travel style',
          })));
        }
      } else {
        setRecommendations(topMatches.slice(0, limit));
      }
      setLoading(false);
    }
    compute();
  }, [exclude.join(','), limit]);

  return { recommendations, loading, isPersonalised };
}
