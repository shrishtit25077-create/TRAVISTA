import { destinationFeatures, toVector } from '../data/destinationFeatures';
import { getAllSignals } from './trackingService';

function cosineSimilarity(a, b) {
  const dot = a.reduce((s, x, i) => s + x * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, x) => s + x * x, 0));
  const magB = Math.sqrt(b.reduce((s, x) => s + x * x, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

function buildUserVector() {
  const signals = getAllSignals();
  const allDests = Object.keys(destinationFeatures);

  // Collect weighted destination interactions
  const weights = {};
  allDests.forEach(d => {
    weights[d] = 0;
    if (signals.viewed[d]) weights[d] += signals.viewed[d];
    if (signals.saved[d]) weights[d] += signals.saved[d];
    if (signals.itinerary[d]) weights[d] += signals.itinerary[d];
    if (signals.timespent[d]) weights[d] += signals.timespent[d];
  });

  const totalWeight = Object.values(weights).reduce((s, w) => s + w, 0);
  if (totalWeight === 0) return null; // new user — no profile yet

  // Weighted average of destination vectors
  const firstDestKey = Object.keys(destinationFeatures)[0];
  const vectorLength = toVector(destinationFeatures[firstDestKey]).length;
  const userVec = new Array(vectorLength).fill(0);
  allDests.forEach(d => {
    if (weights[d] > 0) {
      const vec = toVector(destinationFeatures[d]);
      vec.forEach((v, i) => { userVec[i] += v * (weights[d] / totalWeight); });
    }
  });
  return userVec;
}

export function getRecommendations(limit = 6, exclude = []) {
  const userVec = buildUserVector();
  const allDests = Object.keys(destinationFeatures).filter(d => !exclude.includes(d));

  if (!userVec) {
    // New user — return popular destinations
    return allDests
      .sort((a, b) => destinationFeatures[b].popularity - destinationFeatures[a].popularity)
      .slice(0, limit)
      .map(d => ({ destination: d, score: destinationFeatures[d].popularity, reason: 'Trending worldwide' }));
  }

  // Score all destinations against user vector
  const scored = allDests.map(d => ({
    destination: d,
    score: cosineSimilarity(userVec, toVector(destinationFeatures[d])),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function hasEnoughData() {
  const signals = getAllSignals();
  const totalInteractions = Object.values(signals).reduce(
    (s, obj) => s + Object.values(obj).reduce((a, b) => a + b, 0), 0
  );
  return totalInteractions >= 5; // need at least 5 interactions
}
