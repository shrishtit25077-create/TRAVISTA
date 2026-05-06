/**
 * AI-Powered Recommendation Engine
 * Scores destinations based on user preferences (budget, interests, style)
 */

export function getPersonalizedData(destinations, user) {
  if (!user || !user.preferences) return destinations;

  const { budget, interests, travelStyle } = user.preferences;

  return destinations
    .map(dest => {
      let score = 0;

      // 1. Interest Match (Weight: 3)
      // Check if destination category matches any user interests
      const destCategory = dest.category.toLowerCase();
      if (interests.some(interest => destCategory.includes(interest.toLowerCase()))) {
        score += 3;
      }

      // 2. Budget Match (Weight: 2)
      // Low: ₹, Mid: k, High: L
      const price = dest.price;
      if (budget === "low" && price.includes("₹")) score += 2;
      if (budget === "mid" && price.includes("k")) score += 2;
      if (budget === "high" && price.includes("L")) score += 2;

      // 3. Travel Style Match (Weight: 3)
      if (travelStyle === "luxury" && dest.category === "Luxury") score += 3;
      if (travelStyle === "adventure" && dest.category === "Adventure") score += 3;
      if (travelStyle === "relaxed" && (dest.category === "Beach" || dest.category === "Spiritual")) score += 3;

      // 4. Quality Multiplier
      score += parseFloat(dest.rating) * 0.5;

      return { ...dest, aiScore: score };
    })
    .sort((a, b) => b.aiScore - a.aiScore);
}
